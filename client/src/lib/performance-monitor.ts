/**
 * Performance monitoring for production optimization
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  details?: any;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  private constructor() {
    this.setupPerformanceObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor page load metrics
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.duration || (entry as any).value || 0,
              timestamp: new Date(),
              details: {
                entryType: entry.entryType,
                startTime: entry.startTime
              }
            });
          }
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  }

  public startTimer(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  public endTimer(name: string, details?: any): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(name);

    this.recordMetric({
      name,
      value: duration,
      timestamp: new Date(),
      details
    });

    return duration;
  }

  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Log slow operations
    if (metric.value > 1000) { // Operations taking more than 1 second
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value.toFixed(2)}ms`);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  public logWebVitals(): void {
    // Core Web Vitals monitoring
    if ('web-vitals' in window) {
      console.log('Web Vitals support detected');
    }

    // Log current performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.log('Page Load Metrics:', {
        'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP Connection': navigation.connectEnd - navigation.connectStart,
        'Request': navigation.responseStart - navigation.requestStart,
        'Response': navigation.responseEnd - navigation.responseStart,
        'DOM Processing': navigation.domComplete - navigation.domContentLoadedEventStart,
        'Total Load Time': navigation.loadEventEnd - navigation.fetchStart
      });
    }
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.startTimes.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function for measuring async operations
export async function measureAsync<T>(
  name: string, 
  operation: () => Promise<T>,
  details?: any
): Promise<T> {
  performanceMonitor.startTimer(name);
  try {
    const result = await operation();
    performanceMonitor.endTimer(name, { ...details, success: true });
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name, { ...details, success: false, error: (error as any)?.message });
    throw error;
  }
}