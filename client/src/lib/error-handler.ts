/**
 * Centralized error handling for production
 */

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError({
        code: 'UNHANDLED_PROMISE_REJECTION',
        message: event.reason?.message || 'Unhandled promise rejection',
        details: event.reason,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      // Prevent the default browser error reporting
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.logError({
        code: 'JAVASCRIPT_ERROR',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        },
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  public logError(errorInfo: ErrorInfo): void {
    // Add to local error log (keep last 100 errors)
    this.errorLog.push(errorInfo);
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
      this.sendToErrorTracking(errorInfo);
    }
  }

  private sendToErrorTracking(errorInfo: ErrorInfo): void {
    // Placeholder for error tracking service integration
    // In a real app, you'd send this to services like Sentry
    console.log('Sending error to tracking service:', errorInfo);
  }

  public handleWeb3Error(error: any): string {
    if (error?.code === 4001) {
      return 'Transaction was rejected by user';
    }
    if (error?.code === -32002) {
      return 'Request already pending in wallet';
    }
    if (error?.code === -32603) {
      return 'Internal error in wallet';
    }
    if (error?.message?.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error?.message?.includes('gas')) {
      return 'Gas estimation failed - transaction may fail';
    }
    if (error?.message?.includes('network')) {
      return 'Network connection error';
    }

    // Log unknown errors for investigation
    this.logError({
      code: 'WEB3_ERROR',
      message: error?.message || 'Unknown Web3 error',
      details: error,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    return error?.message || 'An unexpected error occurred';
  }

  public getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();