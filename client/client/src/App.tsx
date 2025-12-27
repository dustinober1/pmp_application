import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './styles/mobile.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const PracticeTestsPage = lazy(() => import('./pages/PracticeTestsPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const TestSessionPage = lazy(() => import('./pages/TestSessionPage'));
const TestReviewPage = lazy(() => import('./pages/TestReviewPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center" role="status" aria-label="Loading page">
    <div className="spinner" aria-hidden="true"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/practice"
          element={
            <Layout>
              <PracticeTestsPage />
            </Layout>
          }
        />
        <Route
          path="/practice/session/:sessionId"
          element={
            <Layout>
              <TestSessionPage />
            </Layout>
          }
        />
        <Route
          path="/practice/review/:sessionId"
          element={
            <Layout>
              <TestReviewPage />
            </Layout>
          }
        />
        <Route
          path="/flashcards"
          element={
            <Layout>
              <FlashcardsPage />
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
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
