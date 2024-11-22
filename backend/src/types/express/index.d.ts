// src/types/express/index.d.ts
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
      iat: number; // Issued at (UNIX timestamp)
      exp: number; // Expiration (TTL)
    };
  }
}
