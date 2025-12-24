import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/mobile.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const PracticeTestsPage = lazy(() => import('./pages/PracticeTestsPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const TestSessionPage = lazy(() => import('./pages/TestSessionPage'));
const TestReviewPage = lazy(() => import('./pages/TestReviewPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center" role="status" aria-label="Loading page">
    <div className="spinner" aria-hidden="true"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle auth-based redirects
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes without layout */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        {/* Routes with layout */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/practice"
          element={
            <Layout>
              <ProtectedRoute>
                <PracticeTestsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/practice/session/:sessionId"
          element={
            <Layout>
              <ProtectedRoute>
                <TestSessionPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/practice/review/:sessionId"
          element={
            <Layout>
              <ProtectedRoute>
                <TestReviewPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/flashcards"
          element={
            <Layout>
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;