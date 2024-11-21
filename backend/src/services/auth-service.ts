import { injectable } from 'inversify';

import { IService } from './service';

/**
 * Interface definition
 */
export interface IAuthService extends IService {
  signIn(email: string, password: string): Promise<string>;
  signUp(email: string, password: string): Promise<string>;
}

/**
 * Service implementation
 */
@injectable()
export class AuthService implements IAuthService {
  static readonly Key = Symbol.for('AuthService');

  async signIn(email: string, password: string): Promise<string> {
    // Implement the signIn method
    return 'signIn';
  }

  async signUp(email: string, password: string): Promise<string> {
    // Implement the signUp method
    return 'signUp';
  }
}
