import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'hono/jwt';
import { inject, injectable } from 'inversify';

import { Config } from '@/core/config';
import { ExceptionFactory } from '@/core/exception';
import { logger } from '@/core/logger';
import { type ILoginRequestDto, type IRegisterRequestDto, type JWTPayload } from '@/dto/auth-dto';
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
        OR: [{ username: body.identifier, email: body.identifier }],
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.log(error.meta);
        throw ExceptionFactory.badRequest('Email already exists');
      }

      // Other errors
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
      const jwtPayload = (await verify(token, jwtSecret, 'HS256')) as JWTPayload;

      return jwtPayload;
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
      const token = await sign(payload, jwtSecret, 'HS256');

      return token;
    } catch (error) {
      return null;
    }
  }
}
