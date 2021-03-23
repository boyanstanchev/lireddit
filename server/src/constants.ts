export const __prod__ = process.env.NODE_ENV === 'production';

declare module 'express-session' {
  export interface SessionData {
    userId: string;
  }
}