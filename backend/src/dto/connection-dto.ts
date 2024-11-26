import { z } from '@hono/zod-openapi';
import { type Context } from 'hono';

/**
 * List Connections DTO
 */

// Params
export const ListConnectionsBodyDto = z.object({
  userId: z
    .string({ message: 'userId must be type of string' })
    .transform((v) => {
      const userIdBigInt = BigInt(v);
      // Refine to ensure it's a valid BigInt and greater than 0
      if (Number.isNaN(userIdBigInt) || userIdBigInt <= 0) {
        throw new Error('userId must be a valid big int greater than 0');
      }
      return userIdBigInt;
    })
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: 1,
      },
    }),
});

export interface IListConnectionsBodyDto extends z.infer<typeof ListConnectionsBodyDto> {}

// Response
export const ListConnectionsResponseBodyDto = z.object({
  connections : z.array(
    z.object({
        userID: z.string().openapi({
            description: 'ID pf the connected user',
            example: '67890',
        }),
        username: z.string().openapi({
          description: 'Username of the user',
          example: 'dewodt',
        }),
        name: z.string().openapi({
          description: 'Name of the user',
          example: 'John Doe',
        }),
        profile_photo: z.string().openapi({
          description: 'Profile photo of the user',
          example: 'https://example.com/my-pict.jpg',
        }),
        work_history: z
          .string()
          .nullable() // no work history (null)
          .openapi({
            description: 'Work history of the user (in rich text)',
            example: `
            <ul>
              <li>Frontend Developer at Company A</li>
              <li>Backend Developer at Company B</li>
            </ul>
          `,
          }),
        skills: z
          .string()
          .nullable() // no skills (null)
          .openapi({
            description: 'Skills of the user (rich text)',
            example: `
                <ul>
                  <li>JavaScript</li>
                  <li>TypeScript</li>
                  <li>Node.js</li>
                </ul>      
              `,
          }),
    }),
    ).openapi({
        description: 'List of connections',
    }),
});

export interface IListConnectionsResponseBodyDto extends z.infer<typeof ListConnectionsResponseBodyDto> {}

/**
 * Accept or Reject Connections DTO
 */

// Params
export const AcceptorRejectParamsDto = z.object({
    userId: z
    .string({ message: 'userId must be type of string' })
    .transform((v) => {
        const userIdBigInt = BigInt(v);
        // Refine to ensure it's a valid BigInt and greater than 0
        if (Number.isNaN(userIdBigInt) || userIdBigInt <= 0) {
            throw new Error('userId must be a valid big int greater than 0');
        }
        return userIdBigInt;
    })
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID to get the profile',
        example: 1,
      },
    }),
});

export interface IAcceptorRejectParamsDto extends z.infer<typeof AcceptorRejectParamsDto> {}
                                              
//Request
export const AcceptorRejectRequestBodyDto = {
    content: {
      'application/json': {
        schema: z.object({
          action: z
            .enum(['accept', 'reject'])
            .openapi({
              description: 'Action to perform on the connection request',
              example: 'accept',
            }),
          requestId: z
            .number({ message: 'requestId must be a number' }) // Tipe awal adalah number
            .int() // Pastikan bilangan bulat
            .transform((v) => {
                const requestIdBigInt = BigInt(v); // Transform menjadi BigInt
                if (requestIdBigInt <= 0) {
                throw new Error('requestId must be a valid big int greater than 0');
                }
                return requestIdBigInt;
            })
            .openapi({
                type: 'integer', // OpenAPI mengharapkan integer di request
                description: 'ID of the connection request',
                example: 3, // Contoh requestId dalam bentuk integer
            }),
        }),
      },
    },
  };
  


// Response
export const  AcceptorRejectResponseBodyDto = z.object({
    requestId: z
        .string()
        .openapi({
            description: 'ID of the connection request',
            example: '3',
        }),
    status: z
    .string()
    .openapi({
        description: 'Status of the connection request (e.g., accepted, rejected)',
        example: 'accepted',
    }),

});

export interface IAcceptorRejectResponseBodyDto extends z.infer<typeof AcceptorRejectResponseBodyDto> {}

/**
 * Connection Request DTO (get list of connection request)
 */

// Params
export const RequestConnectionBodyDTO = z.object({
  userId: z
    .string({ message: 'userId must be type of string' })
    .transform((v) => {
      const userIdBigInt = BigInt(v);
      // Refine to ensure it's a valid BigInt and greater than 0
      if (Number.isNaN(userIdBigInt) || userIdBigInt <= 0) {
        throw new Error('userId must be a valid big int greater than 0');
      }
      return userIdBigInt;
    })
    // @ts-ignore
    .openapi({
      type: 'bigint',
      param: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User ID who has been requested connection',
        example: 1,
      },
    }),
});

export interface IRequestConnectionBodyDTO extends z.infer<typeof RequestConnectionBodyDTO> {}

// Response
export const RequestConnectionResponseBodyDTO = z.object({
  requestsList: z
    .array(
      z.object({
        userId: z.string().openapi({
          description: 'ID of the user who requested the connection',
          example: '67890',
        }),
        requestId: z.string().openapi({
          description: 'ID of the connection request',
          example: '3',
        }),
        username: z.string().openapi({
          description: 'Username of the user',
          example: 'dewodt',
        }),
        name: z.string().openapi({
          description: 'Name of the user',
          example: 'John Doe',
        }),
        profile_photo: z.string().openapi({
          description: 'Profile photo of the user',
          example: 'https://example.com/my-pict.jpg',
        }),
        work_history: z
          .string()
          .nullable() // no work history (null)
          .openapi({
            description: 'Work history of the user (in rich text)',
            example: `
            <ul>
              <li>Frontend Developer at Company A</li>
              <li>Backend Developer at Company B</li>
            </ul>
          `,
          }),
        skills: z
          .string()
          .nullable() // no skills (null)
          .openapi({
            description: 'Skills of the user (rich text)',
            example: `
                <ul>
                  <li>JavaScript</li>
                  <li>TypeScript</li>
                  <li>Node.js</li>
                </ul>      
              `,
          }),
      })
    )
    .openapi({
      description: 'List of connection requests',
    }),
});

export interface IRequestConnectionResponseBodyDTO
  extends z.infer<typeof RequestConnectionResponseBodyDTO> {}
