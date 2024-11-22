/**
 * Custom Exception interface definition
 */
export interface ICustomException extends Error {
  code: number;
}

/**
 * Custom exception class
 */
export class CustomException implements ICustomException {
  public code: number;
  public message: string;
  public name: string;
  public stack?: string;

  constructor(code: number, message: string, name: string = 'CustomException', stack?: string) {
    this.code = code;
    this.message = message;
    this.name = name;
    this.stack = stack;
  }
}

/**
 * Exception factory
 */
export class ExceptionFactory {
  static badRequest(message: string): CustomException {
    return new CustomException(400, message, 'BadRequest');
  }

  static unauthorized(message: string): CustomException {
    return new CustomException(401, message, 'Unauthorized');
  }

  static forbidden(message: string): CustomException {
    return new CustomException(403, message, 'Forbidden');
  }

  static notFound(message: string): CustomException {
    return new CustomException(404, message, 'NotFound');
  }

  static internalServerError(message: string): CustomException {
    return new CustomException(500, message, 'InternalServerError');
  }
}
