import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export class HealthController {
  /**
   * Comprehensive health check endpoint
   * Checks database connectivity and system status
   */
  static async check(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.1.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`,
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      });
    } catch (error) {
      console.error('Health check failed:', error);
      
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error: 'Database connection failed',
        },
        message: 'Service unavailable',
      });
    }
  }

  /**
   * Readiness probe for Kubernetes/container orchestration
   * Returns 200 only when service is ready to accept traffic
   */
  static async ready(req: Request, res: Response) {
    try {
      // Check if database is accessible
      await prisma.$queryRaw`SELECT 1`;
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Liveness probe for Kubernetes/container orchestration
   * Returns 200 if service is alive (even if not ready)
   */
  static async live(req: Request, res: Response) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }
}
