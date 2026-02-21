export default function CallClinicButton() {
  return (
    <div className="bg-ucsf-card border border-ucsf-border rounded-2xl p-6 animate-fade-up">
      <div className="flex items-center gap-2.5 mb-4">
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
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          />
        </svg>
        <h3 className="font-heading text-lg font-semibold text-ucsf-heading">
          Need to reach the clinic?
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="tel:+14153537475"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ucsf-primary text-white font-medium tracking-wide hover:bg-ucsf-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Call Clinic
          <span className="text-white/70 text-xs font-normal">
            M-F 8am–5pm
          </span>
        </a>
        <a
          href="tel:+14155619020"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-ucsf-border text-ucsf-heading font-medium tracking-wide hover:bg-ucsf-bg transition-all duration-200"
        >
          After-Hours
          <span className="text-ucsf-muted text-xs font-normal">
            Evenings & Weekends
          </span>
        </a>
      </div>
    </div>
  );
}
