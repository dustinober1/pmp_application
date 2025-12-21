import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PracticeTestsPage from './pages/PracticeTestsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import TestSessionPage from './pages/TestSessionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';
import './styles/auth.css';
import './styles/dashboard.css';

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
        path="/flashcards"
        element={
          <Layout>
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          </Layout>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;