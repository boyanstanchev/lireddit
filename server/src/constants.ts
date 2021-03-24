export const __prod__ = process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_NAME = 'qid';

declare module 'express-session' {
  export interface SessionData {
    userId: string;
  }
}