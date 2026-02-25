import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import WhiteboardPage from './pages/WhiteboardPage';
import DrawPage from './pages/DrawPage';
import NotFoundPage from './pages/NotFoundPage';
import { useCanvasStore } from './store/canvasStore';
import { useEffect } from 'react';

const ThemeApplicator: React.FC = () => {
  const { theme } = useCanvasStore();
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <ThemeApplicator />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
              error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
              duration: 3500,
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/draw"
              element={
                <ProtectedRoute>
                  <DrawPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <WhiteboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
