import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { Config } from '@/core/config';
import { logger } from '@/core/logger';
import { ILoginRequestDto, IRegisterRequestDto, JWTClaim } from '@/dto/auth-dto';
import { Database } from '@/infrastructures/database/database';

import { IService } from './service';

/**
 * Interface definition
 */
export interface IAuthService extends IService {
  verifyToken(token: string): Promise<JWTClaim | null>;
  generateToken(payload: JWTClaim): Promise<string | null>;
  login(body: ILoginRequestDto): Promise<string>;
  register(body: IRegisterRequestDto): Promise<void>;
}

/**
 * Service implementation
 */
@injectable()
export class AuthService implements IAuthService {
  // IoC Key
  static readonly Key = Symbol.for('AuthService');

  // Constants for Auth
  private readonly TTL = 60 * 60; // 1 hour

  // Inject dependencies
  constructor(
    @inject(Config.Key) private config: Config,
    @inject(Database.Key) private database: Database
  ) {}

  /**
   * Verify token method
   * @param token
   * @returns boolean
   */
  async verifyToken(token: string): Promise<JWTClaim | null> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      // HMAC algorithm
      const verifyPromise = () =>
        new Promise<JWTClaim>((resolve, reject) => {
          jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
              reject(err);
            }
            resolve(decoded as JWTClaim);
          });
        });

      const jwtPayload = await verifyPromise();

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
  async generateToken(payload: JWTClaim): Promise<string | null> {
    const jwtSecret = this.config.get('JWT_SECRET');

    try {
      const signPromise = () =>
        new Promise<string>((resolve, reject) => {
          jwt.sign(payload, jwtSecret, { expiresIn: this.TTL }, (err, token) => {
            if (err) {
              reject(err);
            }
            resolve(token as string);
          });
        });

      const token = await signPromise();

      return token;
    } catch (error) {
      return null;
    }
  }

  /**
   *  Login method
   *
   * @param email
   * @param password
   * @returns token string
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
    }

    return 'signIn';
  }

  /**
   *  Register method
   *
   * @param body
   * @returns void
   */
  async register(body: IRegisterRequestDto): Promise<void> {
    // Implement the signUp method
  }
}
