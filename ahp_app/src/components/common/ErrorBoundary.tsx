import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../../utils/logger';

interface Props {
  children: ReactNode;
  /** 에러 발생 시 보여줄 커스텀 UI (없으면 기본 풀페이지 UI) */
  fallback?: ReactNode;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 레이아웃 수준: 'page'(전체화면) | 'section'(인라인) */
  level?: 'page' | 'section';
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // section 레벨: 인라인 에러 UI
      if (this.props.level === 'section') {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <svg className="mx-auto h-10 w-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-600 text-sm mb-3">이 섹션을 로드하는 중 오류가 발생했습니다.</p>
              <button onClick={this.handleReset}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                다시 시도
              </button>
            </div>
          </div>
        );
      }

      // page 레벨 (기본): 전체화면 에러 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                오류가 발생했습니다
              </h1>

              <p className="text-gray-600 mb-6">
                페이지를 로드하는 중에 오류가 발생했습니다.<br/>
                페이지를 새로고침해주세요.
              </p>

              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    기술 정보 보기
                  </summary>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  페이지 새로고침
                </button>

                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  다시 시도
                </button>
              </div>

              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                <p>AHP for Paper v2.4.0</p>
                <a
                  href="https://github.com/aebonlee/ahp-platform"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub에서 이슈 신고
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;