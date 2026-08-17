import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Global error boundary — catches any uncaught React error and shows a friendly fallback
 * instead of a white screen of death. Includes a "Reload" and "Go home" recovery.
 *
 * Mount once at the top of App.jsx (or per major surface). Keeps the existing visual style.
 */
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info);
    }
    // Hook for future external reporting (Sentry, etc.) — intentionally left out for now.
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">
            An unexpected error occurred. You can try reloading the page or go back home.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="text-left text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 overflow-auto max-h-40 text-gray-700">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="flex-1 inline-flex items-center justify-center gap-2 btn-primary"
            >
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
