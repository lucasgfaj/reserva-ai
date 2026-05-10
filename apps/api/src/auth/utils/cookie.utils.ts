import { Response } from 'express';

export const COOKIE_NAME = 'access_token';
export const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 dia em ms

export function setAuthCookie(response: Response, token: string): void {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}
