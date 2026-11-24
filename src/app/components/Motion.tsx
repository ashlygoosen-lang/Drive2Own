import { useEffect, useRef, useState, type ReactNode } from "react";

/** True when the user has asked the OS for reduced motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** True on mouse/trackpad devices: cursor effects are skipped on touch screens. */
const finePointer = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/**
 * One passive scroll listener and one pointer listener for the whole site:
 * - writes --sy (scroll offset, for parallax) and --progress (page progress bar) on <html>
 * - moves the radial spotlight on any `.spotlight` card under the pointer
 */
export function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--sy", String(Math.min(y, 1200)));
        root.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : "0");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const onPointer = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".spotlight") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    if (finePointer()) document.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onPointer);
    };
  }, []);
  return <div className="scroll-progress" aria-hidden />;
}

/** Splits a headline into words that slide up one after another. Screen readers get the plain text. */
export function SplitWords({ text, delay = 0, step = 70, className = "", wordClassName = "" }: { text: string; delay?: number; step?: number; className?: string; wordClassName?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="split-word"><span className={wordClassName} style={{ ["--d" as string]: delay + i * step }}>{w}</span></span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Counts up to `value` when it first scrolls into view (or immediately with reduced motion). */
export function CountUp({ value, format = (n) => String(n), duration = 1200 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current || typeof IntersectionObserver === "undefined") { setShown(value); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setShown(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref} className="tabular-nums">{format(shown)}</span>;
}

/** Wraps a button/link so it leans gently toward the cursor (pointer devices only). */
export function Magnetic({ children, strength = 0.25, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${Math.max(-8, Math.min(8, x))}px, ${Math.max(-6, Math.min(6, y))}px, 0)`;
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return <span ref={ref} className={`magnetic inline-flex ${className}`}>{children}</span>;
}

/** Decorative drifting light orbs for dark hero sections, with light scroll parallax. */
export function HeroAmbient() {
  return (
    <>
      <span className="hero-orb gold" style={{ width: 560, height: 560, top: -180, right: -120, ["--px" as string]: 0.18 }} aria-hidden><i /></span>
      <span className="hero-orb green" style={{ width: 640, height: 640, bottom: -320, left: -200, ["--px" as string]: -0.08 }} aria-hidden><i /></span>
    </>
  );
}
