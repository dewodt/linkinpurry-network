import type { ZodError } from 'zod';

import type { ErrorFieldDto } from '@/dto/common';

/**'
 * Utils class
 */
export class Utils {
  static getErrorFieldsFromZodParseResult = (zodParseResult: ZodError<any>): ErrorFieldDto[] => {
    return zodParseResult.errors.map((err) => {
      return {
        field: err.path[0].toString(), // only get the first path
        message: err.message,
      };
    });
  };

  static getErrorMessagesFromZodParseResult = (zodParseResult: ZodError<any>): string => {
    return zodParseResult.errors.map((err) => err.message).join(', ');
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
      isNaN(Number(limit)) || Number(limit) <= 0 || Number(limit) > 50 // upperboundary for limit
        ? defaultLimit
        : Number(limit);

    return {
      page: pageResult,
      limit: limitResult,
    };
  };
}
