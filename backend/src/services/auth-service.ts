import type { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import type { CookieOptions } from 'hono/utils/cookie';
import { inject, injectable } from 'inversify';
import path from 'path';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import {
  type ILoginRequestBodyDto,
  type IRegisterRequestBodyDto,
  type JWTPayload,
  type RawJWTPayload,
} from '@/dto/auth-dto';
import { Database } from '@/infrastructures/database/database';

import { type IService } from './service';

/**
 * Interface definition
 */
export interface IAuthService extends IService {
  session(currentUserId: bigint): Promise<SessionData>;
  login(body: ILoginRequestBodyDto): Promise<string>;
  register(body: IRegisterRequestBodyDto): Promise<any>;
  verifyToken(token: string): Promise<JWTPayload | null>;
  generateToken(payload: JWTPayload): Promise<string | null>;
}

type SessionData = Prisma.UserGetPayload<{
  select: { id: boolean; email: boolean; fullName: boolean; profilePhotoPath: boolean };
}>;

/**
 * Service implementation
 */
@injectable()
export class AuthService implements IAuthService {
  // IoC Key
  static readonly Key = Symbol.for('AuthService');

  private prisma: PrismaClient;

  // Inject dependencies
  constructor(
    @inject(Config.Key) private config: Config,
    @inject(Database.Key) private database: Database
  ) {
    this.prisma = this.database.getPrisma();
  }

  /**
   * Get user session (prof pic, ect)
   */
  async session(currentUserId: bigint): Promise<SessionData> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: currentUserId,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePhotoPath: true,
        },
      });

      if (!user) throw ExceptionFactory.notFound('User not found');

      // note: return the profile photo path with the full URL
      const fullURL =
        user.profilePhotoPath.length > 0
          ? `${this.config.get('BE_URL')}${user.profilePhotoPath}`
          : '';

      return {
        ...user,
        profilePhotoPath: fullURL,
      };
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to get session');
    }
  }

  /**
   *  Login method
   *
   * @param email
   * @param password
   * @returns token string
   * @throws CustomException
   */
  async login(body: ILoginRequestBodyDto): Promise<string> {
    // Find user by identifier (username or email)
    let user: Prisma.UserGetPayload<{
      select: { id: boolean; email: boolean; passwordHash: boolean };
    }> | null = null;

    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [{ username: body.identifier }, { email: body.identifier }],
        },
        select: {
          id: true,
          email: true,
          passwordHash: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to login');
    }

    // Check if user exists
    if (!user)
      throw ExceptionFactory.badRequest('Invalid credentials', [
        { field: 'identifier', message: 'Invalid credentials' },
        { field: 'password', message: 'Invalid credentials' },
      ]);

    let cmpResult: boolean = false;

    try {
      // Check if password is correct
      cmpResult = await bcrypt.compare(body.password, user.passwordHash);
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to login');
    }

    if (!cmpResult)
      throw ExceptionFactory.badRequest('Invalid credentials', [
        { field: 'identifier', message: 'Invalid credentials' },
        { field: 'password', message: 'Invalid credentials' },
      ]);

    let token: string | null = null;
    try {
      // Generate token
      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      };

      token = await this.generateToken(jwtPayload);
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

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
  async register(body: IRegisterRequestBodyDto) {
    // Validate if username exists
    let usernameExists = false;
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          username: body.username,
        },
        select: {
          id: true,
        },
      });

      if (user) usernameExists = true;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to create user');
    }

    if (usernameExists)
      throw ExceptionFactory.badRequest('Username already exists', [
        { field: 'username', message: 'Username already exists' },
      ]);

    // Validate if email exists
    let emailExists = false;
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: body.email,
        },
        select: {
          id: true,
        },
      });

      if (user) emailExists = true;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to create user');
    }

    if (emailExists)
      throw ExceptionFactory.badRequest('Email already exists', [
        { field: 'email', message: 'Email already exists' },
      ]);

    try {
      // NOTE: use bcrypt@5.0.1 for node-alpine
      // https://github.com/kelektiv/node.bcrypt.js/issues/1006
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          email: body.email,
          fullName: body.name,
          username: body.username,
          passwordHash: hashedPassword,
        },
      });

      return newUser;
    } catch (error) {
      if (error instanceof Error) logger.error(error.message);

      throw ExceptionFactory.internalServerError('Failed to create user');
    }
  }

  /**
   * Verify token method
   * @param token
   * @returns boolean
   * @throws Error
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      // HMAC algorithm
      const jwtPayload = (await verify(token, jwtSecret, 'HS256')) as RawJWTPayload;

      const parsedJwtPayload: JWTPayload = {
        userId: BigInt(jwtPayload.userId),
        email: jwtPayload.email,
        iat: jwtPayload.iat,
        exp: jwtPayload.exp,
        nbf: jwtPayload.nbf,
      };

      return parsedJwtPayload;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate token method
   * @param payload
   * @throws Error (must be caught by the caller)
   * @returns token string
   */
  async generateToken(payload: JWTPayload): Promise<string> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      const rawJwtPayload: RawJWTPayload = {
        userId: payload.userId.toString(),
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp,
        nbf: payload.nbf,
      };

      const token = await sign(rawJwtPayload, jwtSecret, 'HS256');

      return token;
    } catch (error) {
      throw error;
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
