/**
 * Production security middleware
 */
import type { Request, Response, NextFunction } from "express";

// Enhanced rate limiting with different tiers
export const createRateLimiter = () => {
  const limits: Record<string, { count: number; resetTime: number; tier: string }> = {};
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    // Different limits for different endpoints
    let maxRequests = 100; // Default limit
    let tier = 'default';
    
    if (req.path.startsWith('/api/transactions')) {
      maxRequests = 50; // Lower limit for transaction endpoints
      tier = 'transactions';
    }
    
    if (!limits[ip]) {
      limits[ip] = { count: 1, resetTime: now + windowMs, tier };
      return next();
    }
    
    const record = limits[ip];
    
    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      record.tier = tier;
      return next();
    }
    
    // Check if limit exceeded
    if (record.count >= maxRequests) {
      console.warn(`Rate limit exceeded for IP ${ip} on ${req.path} (tier: ${tier})`);
      return res.status(429).json({ 
        message: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

// Input validation and sanitization
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize common XSS attempts
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Validate and sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Validate Ethereum addresses in requests
  if (req.body?.fromAddress || req.body?.toAddress) {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (req.body.fromAddress && !ethAddressRegex.test(req.body.fromAddress)) {
      return res.status(400).json({ message: 'Invalid fromAddress format' });
    }
    
    if (req.body.toAddress && !ethAddressRegex.test(req.body.toAddress)) {
      return res.status(400).json({ message: 'Invalid toAddress format' });
    }
  }

  // Validate transaction hashes
  if (req.body?.transactionHash || req.params?.hash) {
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    const hash = req.body?.transactionHash || req.params?.hash;
    
    if (hash && !txHashRegex.test(hash)) {
      return res.status(400).json({ message: 'Invalid transaction hash format' });
    }
  }

  next();
};

// Request size limiting
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 1024 * 1024; // 1MB limit
  
  if (contentLength > maxSize) {
    return res.status(413).json({ message: 'Request too large' });
  }
  
  next();
};

// CORS configuration for production
export const configureCORS = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://your-domain.com',
    'https://your-domain.replit.app'
  ].filter(Boolean);

  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.infura.io *.alchemy.com; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "connect-src 'self' *.infura.io *.alchemy.com *.etherscan.io *.polygonscan.com wss: ws:; " +
    "img-src 'self' data: https:;"
  );
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

// Request logging for production monitoring
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log suspicious activity
    if (statusCode >= 400) {
      console.warn(`${method} ${url} ${statusCode} ${duration}ms [${ip}]`);
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${method} ${url} took ${duration}ms`);
    }
  });
  
  next();
};