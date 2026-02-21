import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SessionPage from './pages/SessionPage';
import SummaryPage from './pages/SummaryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/summary/:conversationId" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
