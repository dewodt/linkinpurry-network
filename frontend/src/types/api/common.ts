import { AxiosError } from 'axios';

/**
 * Base response
 */
export interface BaseResponse {
  success: boolean;
  message: string;
}

/**
 * Base for pagination
 */
export interface BasePaginationResponseMeta {
  limit: number;
}

/**
 * Page pagination response meta
 */
export interface PagePaginationResponseMeta extends BasePaginationResponseMeta {
  page: number;
  totalItems: number;
  totalPages: number;
}

export interface OffsetPaginationResponseMeta extends BasePaginationResponseMeta {
  offset: number;
  totalItems: number;
}

export interface CursorPaginationResponseMeta extends BasePaginationResponseMeta {
  cursor: string | null; // null for the first page
  nextCursor: string | null; // null for the last page
}

/**
 * Success response
 */
export interface SuccessResponse<T> extends BaseResponse {
  success: true;
  data: T;
}

export interface SuccessPaginationResponse<T, M extends BasePaginationResponseMeta> extends SuccessResponse<T[]> {
  meta: M;
}

export type SuccessPagePaginationResponse<T> = SuccessPaginationResponse<T, PagePaginationResponseMeta>;

export type SuccessOffsetPaginationResponse<T> = SuccessPaginationResponse<T, OffsetPaginationResponseMeta>;

export type SuccessCursorPaginationResponse<T> = SuccessPaginationResponse<T, CursorPaginationResponseMeta>;

/**
 * Error response
 */
export interface ErrorField {
  field: string;
  message: string;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  errorFields: ErrorField[] | undefined;
}

export type AxiosErrorResponse = AxiosError<ErrorResponse>;
