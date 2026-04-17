import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section-level error boundary.
 * Wraps each major tab/section so that a crash in one area doesn't
 * bring down the entire app. Provides a retry button to reset the
 * boundary state without a full page reload.
 */
class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionErrorBoundary:${this.props.sectionName}]`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={40} className="text-red-400" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-red-400 mb-2">
              {this.props.sectionName} Error
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              {this.state.error?.message || 'An unexpected error occurred in this section.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              <RefreshCw size={14} />
              Retry Section
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;
