export const __prod__ = process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_NAME = 'qid';
export const FORGOT_PASSWORD_PREFIX = 'forgot-password';

declare module 'express-session' {
  export interface SessionData {
    userId: string;
  }
}