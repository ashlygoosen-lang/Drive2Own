/** Drive2Own mark: a road that rises into an arrow, on deep green. */
export function LogoMark({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`logo-mark ${className}`} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#0e3b2e" />
      <path d="M11 29c4.5-1 7-3.6 8.6-7.4L22.4 15" fill="none" stroke="#ffc72c" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M17.6 13.6 23.6 11l1.6 6.4" fill="none" stroke="#ffc72c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 29c2.6-.6 4.6-1.8 6-3.6" fill="none" stroke="#3fbf7f" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false, tagline = true }: { dark?: boolean; tagline?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-[1.3rem] font-extrabold tracking-tight ${dark ? "text-white" : "text-[#0e3b2e]"}`}>
          Drive<span className="text-[#00873a]">2</span>Own
        </span>
        {tagline && <span className={`block text-[10px] font-semibold uppercase tracking-[0.22em] mt-1 ${dark ? "text-green-100/60" : "text-gray-500"}`}>Rent · Drive · Own</span>}
      </span>
    </span>
  );
}
