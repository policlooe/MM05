import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token not found',
        });
      }

      const result = await AuthService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const user = await AuthService.getCurrentUser(req.user.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'User not found';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}
