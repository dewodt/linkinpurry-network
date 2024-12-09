import type { ZodError } from 'zod';

import type { ErrorFieldDto } from '@/dto/common';

/**'
 * Utils class
 */
export class Utils {
  static parseZodErrorResult = (
    zodParseResult: ZodError<any>
  ): { message: string; errorFields: ErrorFieldDto[] } => {
    const message = zodParseResult.errors.map((err) => err.message).join(', ');
    const errorFields = zodParseResult.errors.map((err) => {
      return {
        message: err.message,
        field: err.path.length > 0 ? err.path[0].toString() : 'N/A', // only get the first path
      };
    });

    return {
      message,
      errorFields,
    };
  };

  static parseBigIntId = (
    val: string
  ): { isValid: true; result: bigint } | { isValid: false; result: null } => {
    try {
      const result = BigInt(val);
      const isValid = result > 0n;

      if (!isValid)
        return {
          isValid: false,
          result: null,
        };

      return {
        isValid: true,
        result,
      };
    } catch {
      return {
        isValid: false,
        result: null,
      };
    }
  };

  /**
   * If number is valid & > 0 , return number. Else return default value
   * @param val
   * @returns
   */
  static parsePagePagination = ({
    page,
    limit,
    defaultPage = 1,
    defaultLimit = 15,
  }: {
    page: string | undefined;
    limit: string | undefined;
    defaultPage?: number;
    defaultLimit?: number;
  }) => {
    const pageResult = isNaN(Number(page)) || Number(page) <= 0 ? defaultPage : Number(page);
    const limitResult =
      isNaN(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100 // upperboundary for limit
        ? defaultLimit
        : Number(limit);

    return {
      page: pageResult,
      limit: limitResult,
    };
  };

  static parseLimitPagination = ({
    limit,
    defaultLimit = 15,
  }: {
    limit: string | undefined;
    defaultLimit?: number;
  }) => {
    const limitResult =
      isNaN(Number(limit)) || Number(limit) <= 0 || Number(limit) > 50 // upperboundary for limit
        ? defaultLimit
        : Number(limit);

    return limitResult;
  };
}
