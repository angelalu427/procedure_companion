import { useLocation, Navigate } from 'react-router-dom';
import type { SessionData } from '../types';

export default function SessionPage() {
  const location = useLocation();
  const state = location.state as SessionData | null;

  if (!state) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ucsf-bg">
      <p className="text-ucsf-text">Session page — Phase 5</p>
    </div>
  );
}
