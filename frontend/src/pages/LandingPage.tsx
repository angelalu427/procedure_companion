import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '../services/api';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      const { conversation_id, conversation_url } = await createConversation(name.trim());
      navigate('/session', {
        state: {
          conversationId: conversation_id,
          conversationUrl: conversation_url,
          patientName: name.trim(),
        },
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ucsf-bg">
      <form onSubmit={handleStart} className="w-full max-w-md p-8 space-y-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">Your Procedure Companion</h1>
        <p className="text-ucsf-text">
          Get answers about your upcoming egg retrieval at UCSF from Maya, your virtual patient educator.
        </p>
        <input
          type="text"
          placeholder="Your first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucsf-teal"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full py-3 rounded-lg text-white font-medium bg-ucsf-teal hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Starting...' : 'Start Your Session'}
        </button>
      </form>
    </div>
  );
}
