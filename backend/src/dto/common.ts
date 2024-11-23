import { z } from '@hono/zod-openapi';
import type { ZodObject, ZodRawShape, ZodType } from 'zod';

/**
 * Base response DTO
 */
const zodBaseResponseDto = z.object({
  message: z.string().openapi({
    description: 'Response message',
    example: '<response_message>',
  }),
});

type BaseResponseDto = z.infer<typeof zodBaseResponseDto>;

/**
 * Base paginated success response
 */
const zodBasePaginationResponseMetaDto = z.object({
  limit: z.number().openapi({
    description: 'Number of items per page',
    example: 10,
  }),
});

type BasePaginationResponseMetaDto = z.infer<typeof zodBasePaginationResponseMetaDto>;

export const zodPagePaginationResponseMetaDto = zodBasePaginationResponseMetaDto.extend({
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

export type PagePaginationResponseMetaDto = z.infer<typeof zodPagePaginationResponseMetaDto>;

export const zodOffsetPaginationResponseMetaDto = zodBasePaginationResponseMetaDto.extend({
  offset: z.number().openapi({
    description: 'Offset of the first item in the current page',
    example: 0,
  }),
  totalItems: z.number().openapi({
    description: 'Total number of items',
    example: 100,
  }),
});

export type OffsetPaginationResponseMetaDto = z.infer<typeof zodOffsetPaginationResponseMetaDto>;

export const zodCursorPaginationResponseMetaDto = zodBasePaginationResponseMetaDto.extend({
  cursor: z.string().nullable().openapi({
    description: 'Cursor for the next page',
    example: '1',
  }), // null for the first page
  nextCursor: z.string().nullable().openapi({
    description: 'Cursor for the next page',
    example: '10',
  }), // null for the last page
});

export type CursorPaginationResponseMetaDto = z.infer<typeof zodCursorPaginationResponseMetaDto>;

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

/**
 * Error response DTO
 */
const zodErrorFieldDto = z.object({
  field: z.string().openapi({
    description: 'Field name',
    example: '<field_name>',
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: '<field_message>',
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
          schema: zodErrorResponseDto,
        },
      },
    };
  }

  static jsonUnauthorized(description: string = 'Unauthorized') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto,
        },
      },
    };
  }

  static jsonForbidden(description: string = 'Forbidden') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto,
        },
      },
    };
  }

  static jsonNotFound(description: string = 'Not Found') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto,
        },
      },
    };
  }

  static jsonInternalServerError(description: string = 'Internal Server Error') {
    return {
      description,
      content: {
        'application/json': {
          schema: zodErrorResponseDto,
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
            data: z.null().openapi({
              description: 'Response data',
              example: null,
            }),
          }),
        },
      },
    };
  }

  static jsonSuccessData<T extends ZodType>(description: string, data: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            data,
          }),
        },
      },
    };
  }

  static jsonSuccessPagePagination<T extends ZodType>(description: string, data: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            data,
            meta: zodPagePaginationResponseMetaDto,
          }),
        },
      },
    };
  }

  static jsonSuccessOffsetPagination<T extends ZodType>(description: string, data: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            data,
            meta: zodOffsetPaginationResponseMetaDto,
          }),
        },
      },
    };
  }

  static jsonSuccessCursorPagination<T extends ZodType>(description: string, data: T) {
    return {
      description,
      content: {
        'application/json': {
          schema: zodBaseResponseDto.extend({
            success: z.literal(true).openapi({
              description: 'Success flag',
              example: true,
            }),
            data,
            meta: zodCursorPaginationResponseMetaDto,
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
}
