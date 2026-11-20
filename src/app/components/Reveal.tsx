import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades content in as it scrolls into view. Content is visible by default if IntersectionObserver is unavailable. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(typeof IntersectionObserver === "undefined");
  useEffect(() => {
    if (shown || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}>
      {children}
    </div>
  );
}
