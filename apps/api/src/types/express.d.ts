import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      role?: string;
      condominiumId?: string;
    };
  }
}
