/**
 * Production monitoring and health check middleware
 */
import type { Request, Response, NextFunction } from "express";

// Application metrics
interface AppMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastHealthCheck: number;
}

const metrics: AppMetrics = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  lastHealthCheck: Date.now()
};

const responseTimes: number[] = [];

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    responseTimes.push(duration);
    
    // Keep only last 100 response times for average calculation
    if (responseTimes.length > 100) {
      responseTimes.shift();
    }
    
    // Update metrics
    metrics.requestCount++;
    metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    if (res.statusCode >= 400) {
      metrics.errorCount++;
    }
    
    // Log slow requests in production
    if (duration > 5000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  metrics.lastHealthCheck = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics: {
      totalRequests: metrics.requestCount,
      totalErrors: metrics.errorCount,
      errorRate: metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount * 100).toFixed(2) + '%' : '0%',
      averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms'
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(health);
};

// Application health check (no database)
export const applicationHealthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    storage: 'memory-based',
    environment: process.env.NODE_ENV || 'development'
  });
};

// Memory usage monitoring
export const memoryMonitor = () => {
  const usage = process.memoryUsage();
  const threshold = 500 * 1024 * 1024; // 500MB threshold
  
  if (usage.heapUsed > threshold) {
    console.warn('High memory usage detected:', {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
    });
  }
};

// Start memory monitoring in production
if (process.env.NODE_ENV === 'production') {
  setInterval(memoryMonitor, 30000); // Check every 30 seconds
}

// Error tracking
export const errorTracker = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Application Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  metrics.errorCount++;
  next(err);
};