interface Props {
  questions: { text: string; timestamp?: string }[];
}

export default function QuestionList({ questions }: Props) {
  if (questions.length === 0) {
    return (
      <p className="text-ucsf-muted text-sm italic">
        No questions were recorded during this session.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="flex-none w-6 h-6 rounded-full bg-ucsf-bg border border-ucsf-border flex items-center justify-center text-xs font-medium text-ucsf-muted">
            {i + 1}
          </span>
          <span className="text-ucsf-text pt-0.5">{q.text}</span>
        </li>
      ))}
    </ol>
  );
}
