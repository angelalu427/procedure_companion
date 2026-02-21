interface Props {
  label: string;
}

export default function TopicTag({ label }: Props) {
  return (
    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide bg-ucsf-teal-light text-ucsf-primary border border-ucsf-teal/20">
      {label}
    </span>
  );
}
