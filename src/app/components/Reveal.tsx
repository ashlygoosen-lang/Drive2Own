import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "./Motion";

type Variant = "up" | "fade" | "scale";

/**
 * Reveals content as it scrolls into view.
 * `stagger` brings each direct child in one after another instead of the block as a whole.
 * Visible immediately when IntersectionObserver is missing or reduced motion is on.
 */
export function Reveal({ children, className = "", variant = "up", stagger = false, as: Tag = "div" }: {
  children: ReactNode; className?: string; variant?: Variant; stagger?: boolean; as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined" || prefersReducedMotion());
  useEffect(() => {
    if (shown || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  const v = variant === "up" ? "" : variant;
  return <Tag ref={ref} className={`reveal ${v} ${stagger ? "stagger" : ""} ${shown ? "in" : ""} ${className}`}>{children}</Tag>;
}
