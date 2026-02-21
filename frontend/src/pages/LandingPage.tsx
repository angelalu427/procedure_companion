import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../services/api";

export default function LandingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      const { conversation_id, conversation_url } = await createConversation(
        name.trim(),
      );
      navigate("/session", {
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
    <div className="min-h-screen flex flex-col">
      {/* Teal accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-ucsf-primary via-ucsf-teal to-ucsf-primary/60" />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-up">
          {/* Logo area */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ucsf-primary/10 mb-5">
              <svg
                className="w-7 h-7 text-ucsf-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-semibold text-ucsf-heading tracking-tight">
              Your Procedure Companion
            </h1>
            <p className="mt-3 text-ucsf-text leading-relaxed">
              Prepare for your upcoming egg retrieval at UCSF with Maya, your
              virtual patient educator.
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleStart}
            className="bg-ucsf-card border border-ucsf-border rounded-2xl p-8 space-y-5"
          >
            <div>
              <label
                htmlFor="patient-name"
                className="block text-ucsf-heading mb-2 tracking-widest uppercase"
                style={{ fontSize: "0.7rem" }}
              >
                Your First Name
              </label>
              <input
                id="patient-name"
                type="text"
                placeholder="e.g. Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-ucsf-bg border border-ucsf-border rounded-xl text-ucsf-heading placeholder:text-ucsf-muted focus:outline-none focus:ring-2 focus:ring-ucsf-teal/40 focus:border-ucsf-teal transition"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full py-3.5 rounded-xl text-white font-medium tracking-wide bg-ucsf-primary hover:bg-ucsf-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Start Your Session"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-ucsf-muted leading-relaxed">
            UCSF Center for Reproductive Health
            <br />
            This session is educational only and does not replace medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
