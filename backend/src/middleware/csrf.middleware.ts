import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';

// Configure CSRF protection
const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-csrf',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req: Request) => {
    // Use user ID from JWT if available, otherwise use a default identifier
    return (req as any).user?.id?.toString() || 'anonymous';
  },
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
