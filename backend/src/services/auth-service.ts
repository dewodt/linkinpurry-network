import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'hono/jwt';
import type { CookieOptions } from 'hono/utils/cookie';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import {
  type ILoginRequestDto,
  type IRegisterRequestDto,
  type JWTPayload,
  type RawJWTPayload,
} from '@/dto/auth-dto';
import { Database } from '@/infrastructures/database/database';

import { type IService } from './service';

/**
 * Interface definition
 */
export interface IAuthService extends IService {
  login(body: ILoginRequestDto): Promise<string>;
  register(body: IRegisterRequestDto): Promise<any>;
  verifyToken(token: string): Promise<JWTPayload | null>;
  generateToken(payload: JWTPayload): Promise<string | null>;
}

/**
 * Service implementation
 */
@injectable()
export class AuthService implements IAuthService {
  // IoC Key
  static readonly Key = Symbol.for('AuthService');

  // Inject dependencies
  constructor(
    @inject(Config.Key) private config: Config,
    @inject(Database.Key) private database: Database
  ) {}

  /**
   *  Login method
   *
   * @param email
   * @param password
   * @returns token string
   * @throws CustomException
   */
  async login(body: ILoginRequestDto): Promise<string> {
    const prisma = this.database.getPrisma();

    // Find user by identifier (username or email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: body.identifier }, { email: body.identifier }],
      },
    });

    // Check if user exists
    if (!user) {
      throw ExceptionFactory.badRequest('Invalid credentials');
    }

    // Check if password is correct
    const result = await compare(body.password, user.passwordHash);
    if (!result) {
      throw ExceptionFactory.badRequest('Invalid credentials');
    }

    // Generate token
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      iat: Date.now(),
      exp: Date.now() + 3600 * 1000, // 1 hour
    };
    const token = await this.generateToken(jwtPayload);
    if (!token) {
      throw ExceptionFactory.internalServerError('Failed to generate token');
    }

    return token;
  }

  /**
   *  Register method
   *
   * @param body
   * @returns void
   */
  async register(body: IRegisterRequestDto) {
    const prisma = this.database.getPrisma();

    // Validate if username exists
    const usernameExists = await prisma.user.findFirst({
      where: {
        username: body.username,
      },
    });
    if (usernameExists) {
      throw ExceptionFactory.badRequest('Username already exists', [
        { field: 'username', message: 'Username already exists' },
      ]);
    }

    // Validate if email exists
    const emailExists = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });
    if (emailExists) {
      throw ExceptionFactory.badRequest('Email already exists', [
        { field: 'email', message: 'Email already exists' },
      ]);
    }

    // NOTE: use bcrypt@5.0.1 for node-alpine
    // https://github.com/kelektiv/node.bcrypt.js/issues/1006
    const hashedPassword = await hash(body.password, 10);

    try {
      const newUser = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          username: body.username,
          passwordHash: hashedPassword,
        },
      });

      return newUser;
    } catch (error) {
      // Unique constraint on email
      if (error instanceof Error) logger.error(error.message);
      throw ExceptionFactory.internalServerError('Failed to create user');
    }
  }

  /**
   * Verify token method
   * @param token
   * @returns boolean
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      // HMAC algorithm
      const jwtPayload = (await verify(token, jwtSecret, 'HS256')) as RawJWTPayload;

      const parsedJwtPayload: JWTPayload = {
        userId: BigInt(jwtPayload.userId),
        email: jwtPayload.email,
        iat: jwtPayload.iat,
        exp: jwtPayload.exp,
      };

      return parsedJwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate token method
   * @param payload
   * @throws Error (must be caught by the caller)
   * @returns token string
   */
  async generateToken(payload: JWTPayload): Promise<string | null> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      const rawJwtPayload: RawJWTPayload = {
        userId: payload.userId.toString(),
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp,
      };

      const token = await sign(rawJwtPayload, jwtSecret, 'HS256');

      return token;
    } catch (error) {
      logger.error(`Failed to generate token: ${error}`);
      return null;
    }
  }

  /**
   * Generate cookie setting
   */
  generateCookieOptions(): CookieOptions {
    return {
      path: '/',
      domain: this.config.get('FE_DOMAIN'),
      httpOnly: true,
      secure: true,
      sameSite: 'none', // spa with different domain
      maxAge: 60 * 60, // 1 hour
    };
  }
}
