import { useParams, useLocation } from 'react-router-dom';

export default function SummaryPage() {
  const { conversationId } = useParams();
  const location = useLocation();
  const patientName = (location.state as { patientName?: string })?.patientName;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ucsf-bg">
      <p className="text-ucsf-text">
        {patientName ? `Hi ${patientName}, your` : 'Your'} recap for session {conversationId} — Phase 6
      </p>
    </div>
  );
}
