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
}
