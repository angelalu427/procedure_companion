import type { ReactNode } from "react";

interface Props {
  title: string;
  icon?: string;
  children: ReactNode;
}

export default function SummaryCard({ title, icon, children }: Props) {
  return (
    <div className="bg-ucsf-card border border-ucsf-border rounded-2xl p-6 animate-fade-up">
      <div className="flex items-center gap-2.5 mb-4">
        {icon && (
          <svg
            className="w-5 h-5 text-ucsf-primary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={icon}
            />
          </svg>
        )}
        <h3 className="font-heading text-lg font-semibold text-ucsf-heading">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
