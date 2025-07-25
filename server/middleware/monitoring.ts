/**
 * Production monitoring and health checks
 */
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
}

class HealthMonitor {
  private static instance: HealthMonitor;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHealthChecks();
  }

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  private startHealthChecks(): void {
    // Run health checks every 30 seconds
    this.checkInterval = setInterval(() => {
      this.runHealthChecks();
    }, 30000);

    // Run initial check
    this.runHealthChecks();
  }

  private async runHealthChecks(): Promise<void> {
    // Database health check
    await this.checkDatabase();
    
    // Memory usage check
    this.checkMemoryUsage();
    
    // API response time check
    this.checkApiResponseTime();
  }

  private async checkDatabase(): Promise<void> {
    const start = Date.now();
    try {
      // Test database connection with a simple query
      await storage.getTransaction(1);
      
      const responseTime = Date.now() - start;
      this.healthChecks.set('database', {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      });
    } catch (error: any) {
      this.healthChecks.set('database', {
        service: 'database',
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      });
    }
  }

  private checkMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (memUsageMB > 500) status = 'degraded';
    if (memUsageMB > 1000) status = 'unhealthy';

    this.healthChecks.set('memory', {
      service: 'memory',
      status,
      responseTime: memUsageMB,
      lastCheck: new Date()
    });
  }

  private checkApiResponseTime(): void {
    // This would typically be measured from actual API calls
    // For now, we'll use a simple check
    const avgResponseTime = 50; // This would be calculated from actual metrics
    
    this.healthChecks.set('api', {
      service: 'api',
      status: avgResponseTime < 200 ? 'healthy' : avgResponseTime < 500 ? 'degraded' : 'unhealthy',
      responseTime: avgResponseTime,
      lastCheck: new Date()
    });
  }

  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    timestamp: Date;
  } {
    const checks = Array.from(this.healthChecks.values());
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) overallStatus = 'unhealthy';
    else if (degradedCount > 0) overallStatus = 'degraded';

    return {
      status: overallStatus,
      checks,
      timestamp: new Date()
    };
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Health check endpoint middleware
export const healthCheckEndpoint = (req: Request, res: Response) => {
  const healthMonitor = HealthMonitor.getInstance();
  const healthStatus = healthMonitor.getHealthStatus();
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json({
    status: healthStatus.status,
    timestamp: healthStatus.timestamp,
    checks: healthStatus.checks,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
};

// Metrics collection middleware
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log error responses
    if (res.statusCode >= 400) {
      console.error(`Error response: ${req.method} ${req.path} returned ${res.statusCode}`);
    }
  });
  
  next();
};

// Initialize health monitoring
export const healthMonitor = HealthMonitor.getInstance();