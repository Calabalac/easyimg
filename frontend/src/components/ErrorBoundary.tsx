import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="card bg-base-100 shadow-lg max-w-md">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="card-title justify-center text-error">
                Что-то пошло не так
              </h2>
              <p className="text-base-content/70 mb-4">
                Произошла ошибка при отображении этого компонента
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mockup-code text-left text-xs">
                  <pre data-prefix="$">
                    <code>{this.state.error.message}</code>
                  </pre>
                  <pre data-prefix=">" className="text-warning">
                    <code>{this.state.error.stack?.split('\n').slice(0, 3).join('\n')}</code>
                  </pre>
                </div>
              )}
              
              <div className="card-actions justify-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Перезагрузить страницу
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
