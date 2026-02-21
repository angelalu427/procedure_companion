import { useParams, useLocation } from "react-router-dom";
import { useConversationStream } from "../hooks/useConversationStream";
import SummaryCard from "../components/SummaryCard";
import TopicTag from "../components/TopicTag";
import QuestionList from "../components/QuestionList";
import CallClinicButton from "../components/CallClinicButton";

const ICONS = {
  topics:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
  questions:
    "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z",
  perception:
    "M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z",
  doctor:
    "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0V3.75m5.8 0V3.75",
};

export default function SummaryPage() {
  const { conversationId } = useParams();
  const location = useLocation();
  const patientName = (location.state as { patientName?: string })
    ?.patientName;
  const { summary, loading } = useConversationStream(conversationId || "");

  const doctorRedirects = summary?.escalations.filter(
    (e) => e.eventType === "doctor_redirect",
  );

  return (
    <div className="min-h-screen bg-ucsf-bg flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-ucsf-primary via-ucsf-teal to-ucsf-primary/60" />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Greeting */}
          <div className="animate-fade-up">
            <p
              className="text-ucsf-muted tracking-widest uppercase mb-2"
              style={{ fontSize: "0.7rem" }}
            >
              Session Recap
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ucsf-heading">
              {patientName
                ? `Hi ${patientName}, here's what we covered.`
                : "Here's your session recap."}
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-fade-up">
              <div className="inline-block w-10 h-10 border-[3px] border-ucsf-border border-t-ucsf-primary rounded-full animate-spin" />
              <p className="mt-5 text-ucsf-muted text-sm">
                Preparing your recap...
              </p>
            </div>
          ) : summary ? (
            <>
              {summary.topicsCovered.length > 0 && (
                <SummaryCard title="What We Covered" icon={ICONS.topics}>
                  <div className="flex flex-wrap gap-2">
                    {summary.topicsCovered.map((topic) => (
                      <TopicTag key={topic} label={topic} />
                    ))}
                  </div>
                </SummaryCard>
              )}

              <SummaryCard title="Questions You Asked" icon={ICONS.questions}>
                <QuestionList questions={summary.questionsAsked} />
              </SummaryCard>

              {summary.perceptionNotes && (
                <SummaryCard
                  title="How the Session Felt"
                  icon={ICONS.perception}
                >
                  <p className="text-sm text-ucsf-text leading-relaxed">
                    {summary.perceptionNotes}
                  </p>
                </SummaryCard>
              )}

              {doctorRedirects && doctorRedirects.length > 0 && (
                <SummaryCard
                  title="Topics for Your Doctor"
                  icon={ICONS.doctor}
                >
                  <ul className="space-y-2">
                    {doctorRedirects.map((e, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-ucsf-text"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ucsf-primary shrink-0" />
                        {e.questionText || e.reason}
                      </li>
                    ))}
                  </ul>
                </SummaryCard>
              )}

              <CallClinicButton />
            </>
          ) : (
            <div className="text-center py-20 animate-fade-up">
              <p className="text-ucsf-muted text-sm">
                No summary available for this session.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-ucsf-muted pt-4 pb-8">
            UCSF Center for Reproductive Health
          </p>
        </div>
      </div>
    </div>
  );
}
