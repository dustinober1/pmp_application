
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PracticeTestsPage from './pages/PracticeTestsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import TestSessionPage from './pages/TestSessionPage';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticeTestsPage />} />
            <Route path="/practice/session/:sessionId" element={<TestSessionPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;