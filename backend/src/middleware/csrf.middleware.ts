import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';

// Fail-fast: CSRF secret is required
if (!process.env.CSRF_SECRET) {
  throw new Error('CRITICAL: CSRF_SECRET environment variable is not set. Application cannot start without it.');
}

const isProduction = process.env.NODE_ENV === 'production';

// __Host- префикс требует secure=true: в dev браузеры отвергают такую cookie
const CSRF_COOKIE_NAME = isProduction ? '__Host-csrf' : 'csrf_token';

// Configure CSRF protection (API csrf-csrf@3: генератор называется generateToken)
const {
  generateToken: generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET as string,
  // Привязка к константе: токены выдаются до логина, привязывать к userId нельзя
  getSessionIdentifier: () => 'mm05-public',
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Middleware to generate and attach CSRF token
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = generateCsrfToken(req, res);
    // Attach token to response locals for easy access
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    next(error);
  }
};

// CSRF protection middleware
export const csrfProtection = doubleCsrfProtection;
