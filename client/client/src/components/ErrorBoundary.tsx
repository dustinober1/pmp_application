import { Component, type ErrorInfo, type ReactNode, type CSSProperties } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child
 * component tree, log those errors, and display a fallback UI.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // Call optional error callback for external logging
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you would send this to an error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    private handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        });
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI with inline styles for reliability
            return (
                <div style={styles.container} role="alert" aria-live="assertive">
                    <div style={styles.content} role="document">
                        <div style={styles.icon}>⚠️</div>
                        <h1 style={styles.title} id="error-title">
                            Something went wrong
                        </h1>
                        <p style={styles.message} aria-describedby="error-title">
                            We're sorry, but something unexpected happened. Please try again.
                        </p>

                        {/* Show error details in development */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details</summary>
                                <pre style={styles.errorText}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={styles.actions}>
                            <button
                                onClick={this.handleRetry}
                                style={styles.retryButton}
                                type="button"
                                aria-label="Try again"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={styles.refreshButton}
                                type="button"
                                aria-label="Refresh the page"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={styles.homeButton}
                                type="button"
                                aria-label="Go to home page"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Inline styles to ensure they work regardless of CSS loading issues
const styles: { [key: string]: CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    content: {
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    icon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    title: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 600,
        marginBottom: '12px',
        marginTop: 0,
    },
    message: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '16px',
        lineHeight: 1.6,
        marginBottom: '24px',
    },
    details: {
        textAlign: 'left',
        marginBottom: '24px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '12px',
    },
    summary: {
        color: 'rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        fontSize: '14px',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: '12px',
        overflow: 'auto',
        maxHeight: '200px',
        marginTop: '12px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    retryButton: {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#ffffff',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    refreshButton: {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#ffffff',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    homeButton: {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.8)',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        cursor: 'pointer',
    },
};

export default ErrorBoundary;
