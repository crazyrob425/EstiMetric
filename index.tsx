import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("LOGIC_CORE: index.tsx loaded. Beginning module graph initialization.");
console.log("LOGIC_CORE: React Environment Version:", React.version);

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FATAL BOOT EXCEPTION:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          backgroundColor: '#020617', 
          color: '#f87171', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ marginBottom: '2rem', fontSize: '4rem' }}>⚠️</div>
          <h1 style={{fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff'}}>System Fracture</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', maxWidth: '400px', lineHeight: '1.6' }}>
            {this.state.error?.message || "An unrecoverable exception occurred in the logic core."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '2.5rem', 
              padding: '0.75rem 2rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}
          >
            Attempt Recovery
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const initializeApp = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log("LOGIC_CORE: Application successfully mounted.");
    } catch (err) {
      console.error("CRITICAL: Failed to initialize React root:", err);
    }
  } else {
    console.warn("Root element not found, waiting for DOM ready...");
    window.addEventListener('DOMContentLoaded', initializeApp);
  }
};

// Start the boot sequence
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}