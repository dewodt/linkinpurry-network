import { z } from '@hono/zod-openapi';
import { error } from 'console';
import type { ZodObject, ZodRawShape, ZodType } from 'zod';

/**
 * Base response DTO
 */
const zodBaseResponseDto = z.object({
  message: z.string().openapi({
    description: 'Response message',
    example: 'Success', // base message is success, extend to override for error
  }),
});

type BaseResponseDto = z.infer<typeof zodBaseResponseDto>;

/**
 * Base paginated success response
 */
const zodBasePaginationResponseMeta = z.object({
  limit: z.number().openapi({
    description: 'Number of items per page',
    example: 10,
  }),
});

type BasePaginationResponseMeta = z.infer<typeof zodBasePaginationResponseMeta>;

export const zodPagePaginationResponseMeta = zodBasePaginationResponseMeta.extend({
  page: z.number().openapi({
    description: 'Current page number',
    example: 1,
  }),
  totalItems: z.number().openapi({
    description: 'Total number of items',
    example: 100,
  }),
  totalPages: z.number().openapi({
    description: 'Total number of pages',
    example: 10,
  }),
});

export type PagePaginationResponseMeta = z.infer<typeof zodPagePaginationResponseMeta>;

export const zodOffsetPaginationResponseMeta = zodBasePaginationResponseMeta.extend({
  offset: z.number().openapi({
    description: 'Offset of the first item in the current page',
    example: 0,
  }),
  totalItems: z.number().openapi({
    description: 'Total number of items',
    example: 100,
  }),
});

export type OffsetPaginationResponseMeta = z.infer<typeof zodOffsetPaginationResponseMeta>;

export const zodCursorPaginationResponseMeta = zodBasePaginationResponseMeta.extend({
  cursor: z.string().nullable().openapi({
    description: 'Cursor for the next page',
    example: '1',
  }), // null for the first page
  nextCursor: z.string().nullable().openapi({
    description: 'Cursor for the next page',
    example: '10',
  }), // null for the last page
});

export type CursorPaginationResponseMeta = z.infer<typeof zodCursorPaginationResponseMeta>;

/**
 * Non-paginated success response
 */
export interface SuccessResponseDto<T> extends BaseResponseDto {
  success: true;
  body: T;
}

/**
 * Page pagination success response
 */
interface SuccessPaginationResponseDto<T, M extends BasePaginationResponseMeta>
  extends SuccessResponseDto<T[]> {
  meta: M;
}

export type SuccessPagePaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  PagePaginationResponseMeta
>;

/**
 * Offset pagination success response
 */
export type SuccessOffsetPaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  OffsetPaginationResponseMeta
>;

/**
 * Cursor pagination success response
 */
export type SuccessCursorPaginationResponseDto<T> = SuccessPaginationResponseDto<
  T,
  CursorPaginationResponseMeta
>;

/**
 * Error response DTO
 */
const zodErrorFieldDto = z.object({
  field: z.string().openapi({
    description: 'Field name',
    example: 'foo',
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: 'foo is required',
  }),
});

export type ErrorFieldDto = z.infer<typeof zodErrorFieldDto>;

export const zodErrorResponseDto = zodBaseResponseDto.extend({
  success: z.literal(false).openapi({
    description: 'Error flag',
    example: false,
  }),
  errorFields: z.array(zodErrorFieldDto).optional(),
});

export type ErrorResponseDto = z.infer<typeof zodErrorResponseDto>;

/**
 * Factory for creating response DTOs (for controllers)
 */
export class ResponseDtoFactory {
  static createSuccessResponseDto(message: string): SuccessResponseDto<null> {
    return {
      success: true,
      message: message,
      body: null,
    };
  }

  static createSuccessDataResponseDto<T>(message: string, body: T): SuccessResponseDto<T> {
    return {
      success: true,
      message,
      body,
    };
  }

  static createSuccessPagePaginationResponseDto<T>(
    message: string,
    body: T[],
    meta: PagePaginationResponseMeta
  ): SuccessPagePaginationResponseDto<T> {
    return {
      success: true,
      message,
      body,
      meta,
    };
  }

  static createSuccessOffsetPaginationResponseDto<T>(
    message: string,
    body: T[],
    meta: OffsetPaginationResponseMeta
  ): SuccessOffsetPaginationResponseDto<T> {
    return {
      success: true,
      message,
      body,
      meta,
    };
  }

  // this method was created just to adapt to the specificaition api contract
  static createDifferentSuccessCursorPaginationResponse<T>(
    message: string,
    body: T,
    meta: CursorPaginationResponseMeta
  ) {
    return {
      success: true as const,
      message,
      body,
      meta,
    };
  }

  static createSuccessCursorPaginationResponseDto<T>(
    message: string,
    body: T[],
    meta: CursorPaginationResponseMeta
  ): SuccessCursorPaginationResponseDto<T> {
    return {
      success: true,
      message,
      body,
      meta,
    };
  }

  static createErrorResponseDto(message: string, errorFields?: ErrorFieldDto[]): ErrorResponseDto {
    return { success: false, message, errorFields };
  }
}

/**
 * Factory for creating response DTOs using Zod (for openapi)
 */
export class OpenApiResponseFactory {
  static jsonBadRequest(description: string = 'Bad Request') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto.extend({
            message: z.string().openapi({
              description: 'Error message',
              example: 'Bad Request',
            }),
          }),
        },
      },
    };
  }

  static jsonUnauthorized(description: string = 'Unauthorized') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto.extend({
            message: z.string().openapi({
              description: 'Error message',
              example: 'Unauthorized',
            }),
            errorFields: z.literal(undefined),
          }),
        },
      },
    };
  }

  static jsonForbidden(description: string = 'Forbidden') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto.extend({
            message: z.string().openapi({
              description: 'Error message',
              example: 'Forbidden',
            }),
            errorFields: z.literal(undefined),
          }),
        },
      },
    };
  }

  static jsonNotFound(description: string = 'Not Found') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto.extend({
            message: z.string().openapi({
              description: 'Error message',
              example: 'Not Found',
            }),
            errorFields: z.literal(undefined),
          }),
        },
      },
    };
  }

  static jsonInternalServerError(description: string = 'Internal Server Error') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto.extend({
            message: z.string().openapi({
              description: 'Error message',
              example: 'Internal Server Error',
            }),
            errorFields: z.literal(undefined),
          }),
        },
      },
    };
  }

  static jsonSuccess(description: string) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            body: z.null().openapi({
              description: 'Response data',
              example: null,
            }),
          }),
        },
      },
    };
  }

  static jsonSuccessData<T extends ZodType>(description: string, body: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            body,
          }),
        },
      },
    };
  }

  static jsonSuccessPagePagination<T extends ZodType>(description: string, body: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            body,
            meta: zodPagePaginationResponseMeta,
          }),
        },
      },
    };
  }

  static jsonSuccessOffsetPagination<T extends ZodType>(description: string, body: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            body,
            meta: zodOffsetPaginationResponseMeta,
          }),
        },
      },
    };
  }

  static jsonSuccessCursorPagination<T extends ZodType>(description: string, body: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            body,
            meta: zodCursorPaginationResponseMeta,
          }),
        },
      },
    };
  }
}

export class OpenApiRequestFactory {
  static jsonBody<T extends ZodType>(description: string, schema: T) {
    return {
      required: true,
      description,
      content: {
        'application/json': {
          schema,
        },
      },
    };
  }

  static formDataBody<T extends ZodType>(description: string, schema: T) {
    return {
      required: true,
      description,
      content: {
        'multipart/form-data': {
          schema,
        },
      },
    };
  }
}
