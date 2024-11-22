/**
 * Base response DTO
 */
interface BaseResponseDto {
  message: string;
}

/**
 * Base paginated success response
 */
interface BasePaginationResponseMetaDto {
  limit: number;
}

export interface PagePaginationResponseMetaDto extends BasePaginationResponseMetaDto {
  page: number;
  totalItems: number;
  totalPages: number;
}

export interface OffsetPaginationResponseMetaDto extends BasePaginationResponseMetaDto {
  offset: number;
  totalItems: number;
}

export interface CursorPaginationResponseMetaDto extends BasePaginationResponseMetaDto {
  cursor: string | null; // null for the first page
  nextCursor: string | null; // null for the last page
}

/**
 * Non-paginated success response
 */
export interface SuccessResponseDto<T> extends BaseResponseDto {
  success: true;
  data: T;
}

/**
 * Page pagination success response
 */
interface SuccessPaginationResponseDto<T, M extends BasePaginationResponseMetaDto>
  extends SuccessResponseDto<T[]> {
  meta: M;
}

export type SuccessPagePaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  PagePaginationResponseMetaDto
>;

/**
 * Offset pagination success response
 */
export type SuccessOffsetPaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  OffsetPaginationResponseMetaDto
>;

/**
 * Cursor pagination success response
 */
export type SuccessCursorPaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  CursorPaginationResponseMetaDto
>;

export interface ErrorFieldDto {
  field: string;
  message: string;
}

/**
 * Error response dto
 */
export interface ErrorResponseDto extends BaseResponseDto {
  success: false;
  errorFields: ErrorFieldDto[] | null; // null if no error fields
}

/**
 * Factory for creating response DTOs
 */
export class ResponseDtoFactory {
  static createSuccessResponseDto(message: string): SuccessResponseDto<null> {
    return {
      success: true,
      message: message,
      data: null,
    };
  }

  static createSuccessDataResponseDto<T>(message: string, data: T): SuccessResponseDto<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static createSuccessPagePaginationResponseDto<T>(
    message: string,
    data: T[],
    meta: PagePaginationResponseMetaDto
  ): SuccessPagePaginationResponseDto<T> {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static createSuccessOffsetPaginationResponseDto<T>(
    message: string,
    data: T[],
    meta: OffsetPaginationResponseMetaDto
  ): SuccessOffsetPaginationResponseDto<T> {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static createSuccessCursorPaginationResponseDto<T>(
    message: string,
    data: T[],
    meta: CursorPaginationResponseMetaDto
  ): SuccessCursorPaginationResponseDto<T> {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static createErrorResponseDto(
    message: string,
    errorFields: ErrorFieldDto[] | null = null
  ): ErrorResponseDto {
    return { success: false, message, errorFields };
  }
}
