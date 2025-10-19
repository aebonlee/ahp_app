// 모니터링 서비스 - 에러 추적, 성능 모니터링, 사용자 행동 분석

interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  level: 'error' | 'warning' | 'info';
}

interface PerformanceMetric {
  timestamp: Date;
  metricName: string;
  value: number;
  unit: string;
  context?: Record<string, any>;
}

interface UserAction {
  timestamp: Date;
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}

class MonitoringService {
  private errorLogs: ErrorLog[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private isProduction: boolean;
  private apiEndpoint: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.REACT_APP_MONITORING_API || '/api/monitoring';
    this.setupErrorHandlers();
    this.setupPerformanceObserver();
  }

  // 에러 핸들러 설정
  private setupErrorHandlers() {
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        level: 'error'
      });
    });

    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        level: 'error'
      });
    });
  }

  // 성능 옵저버 설정
  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logPerformance('LCP', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.logPerformance('FID', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.logPerformance('CLS', clsValue, 'score');
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // 에러 로깅
  logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      level: error.level || 'error'
    };

    this.errorLogs.push(errorLog);
    
    // 프로덕션 환경에서만 서버로 전송
    if (this.isProduction) {
      this.sendToServer('errors', errorLog);
    } else {
      console.error('[Monitoring]', errorLog);
    }
  }

  // 성능 메트릭 로깅
  logPerformance(metricName: string, value: number, unit: string = 'ms', context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      metricName,
      value,
      unit,
      context
    };

    this.performanceMetrics.push(metric);

    // 임계값 체크
    this.checkPerformanceThresholds(metricName, value);

    if (this.isProduction) {
      this.sendToServer('performance', metric);
    } else {
      console.log('[Performance]', metric);
    }
  }

  // 사용자 액션 추적
  trackUserAction(action: string, category: string, label?: string, value?: number) {
    const userAction: UserAction = {
      timestamp: new Date(),
      action,
      category,
      label,
      value,
      userId: this.getCurrentUserId()
    };

    this.userActions.push(userAction);

    if (this.isProduction) {
      this.sendToServer('actions', userAction);
    } else {
      console.log('[UserAction]', userAction);
    }
  }

  // API 호출 모니터링
  async monitorApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      this.logPerformance(`API_${endpoint}`, duration, 'ms', {
        endpoint,
        status: 'success'
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.logPerformance(`API_${endpoint}`, duration, 'ms', {
        endpoint,
        status: 'error'
      });
      
      this.logError({
        message: `API Error: ${endpoint} - ${error.message}`,
        stack: error.stack,
        level: 'error'
      });
      
      throw error;
    }
  }

  // 성능 임계값 체크
  private checkPerformanceThresholds(metricName: string, value: number) {
    const thresholds: Record<string, number> = {
      LCP: 2500,      // 2.5초
      FID: 100,       // 100ms
      CLS: 0.1,       // 0.1 score
      API_: 3000      // 3초 (API 호출)
    };

    const threshold = Object.keys(thresholds).find(key => metricName.startsWith(key));
    
    if (threshold && value > thresholds[threshold]) {
      this.logError({
        message: `Performance threshold exceeded: ${metricName} = ${value}`,
        level: 'warning'
      });
    }
  }

  // 서버로 데이터 전송
  private async sendToServer(type: string, data: any) {
    try {
      await fetch(`${this.apiEndpoint}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      // 전송 실패 시 로컬스토리지에 저장
      const stored = localStorage.getItem('monitoring_queue') || '[]';
      const queue = JSON.parse(stored);
      queue.push({ type, data, timestamp: Date.now() });
      localStorage.setItem('monitoring_queue', JSON.stringify(queue));
    }
  }

  // 현재 사용자 ID 가져오기
  private getCurrentUserId(): string | undefined {
    const userStr = localStorage.getItem('ahp_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  // 보고서 생성
  generateReport() {
    return {
      errors: {
        total: this.errorLogs.length,
        byLevel: this.groupBy(this.errorLogs, 'level'),
        recent: this.errorLogs.slice(-10)
      },
      performance: {
        averages: this.calculateAverages(this.performanceMetrics),
        percentiles: this.calculatePercentiles(this.performanceMetrics)
      },
      userActions: {
        total: this.userActions.length,
        byCategory: this.groupBy(this.userActions, 'category'),
        mostFrequent: this.getMostFrequent(this.userActions, 'action')
      }
    };
  }

  // 헬퍼 함수들
  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverages(metrics: PerformanceMetric[]) {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricName]) {
        acc[metric.metricName] = [];
      }
      acc[metric.metricName].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).reduce((acc, [key, values]) => {
      acc[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculatePercentiles(metrics: PerformanceMetric[]) {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricName]) {
        acc[metric.metricName] = [];
      }
      acc[metric.metricName].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).reduce((acc, [key, values]) => {
      values.sort((a, b) => a - b);
      acc[key] = {
        p50: values[Math.floor(values.length * 0.5)],
        p75: values[Math.floor(values.length * 0.75)],
        p95: values[Math.floor(values.length * 0.95)]
      };
      return acc;
    }, {} as Record<string, any>);
  }

  private getMostFrequent<T>(array: T[], key: keyof T): string {
    const counts = this.groupBy(array, key);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const monitoringService = new MonitoringService();

export default monitoringService;

// React Hook for monitoring
export function useMonitoring() {
  return {
    logError: monitoringService.logError.bind(monitoringService),
    logPerformance: monitoringService.logPerformance.bind(monitoringService),
    trackAction: monitoringService.trackUserAction.bind(monitoringService),
    monitorApiCall: monitoringService.monitorApiCall.bind(monitoringService),
    generateReport: monitoringService.generateReport.bind(monitoringService)
  };
}