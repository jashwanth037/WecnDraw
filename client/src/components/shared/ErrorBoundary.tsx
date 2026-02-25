import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem' }}>💥</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Something went wrong</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
                    <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
