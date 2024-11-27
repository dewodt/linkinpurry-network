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

  static parseBigInt = (
    val: string | number
  ): { isValid: true; result: bigint } | { isValid: false; result: null } => {
    try {
      const result = BigInt(val);

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
}
