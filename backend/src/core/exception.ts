import type { ErrorResponseDto } from '@/dto/common';

/**
 * Service exception error field
 */
export interface ServiceExceptionErrorField {
  field: string;
  message: string;
}

/**
 * Service exception class
 */
export abstract class ServiceException extends Error {
  public readonly code: number;
  public readonly message: string;
  public readonly errorFields: ServiceExceptionErrorField[] | undefined;

  constructor(code: number, message: string, errorFields?: ServiceExceptionErrorField[]) {
    super();
    this.code = code;
    this.message = message;
    this.errorFields = errorFields;
  }

  public toResponseDto(): ErrorResponseDto {
    return {
      success: false,
      message: this.message,
      errorFields: this.errorFields,
    };
  }
}

/**
 * Http exceptions
 */
export class BadRequestException extends ServiceException {
  constructor(message: string, errorFields?: ServiceExceptionErrorField[]) {
    super(400, message, errorFields);
  }
}

export class UnauthorizedException extends ServiceException {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenException extends ServiceException {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundException extends ServiceException {
  constructor(message: string) {
    super(404, message);
  }
}

export class InternalServerErrorException extends ServiceException {
  constructor(message: string) {
    super(500, message);
  }
}

/**
 * Exception factory
 */
export class ExceptionFactory {
  static badRequest(
    message: string,
    errorFields?: ServiceExceptionErrorField[]
  ): BadRequestException {
    return new BadRequestException(message, errorFields);
  }

  static unauthorized(message: string): UnauthorizedException {
    return new UnauthorizedException(message);
  }

  static forbidden(message: string): ForbiddenException {
    return new ForbiddenException(message);
  }

  static notFound(message: string): NotFoundException {
    return new NotFoundException(message);
  }

  static internalServerError(message: string): InternalServerErrorException {
    return new InternalServerErrorException(message);
  }

  static fromError(error: Error): InternalServerErrorException {
    return new InternalServerErrorException(error.message);
  }
}
