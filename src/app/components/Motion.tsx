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

    // One observer for declarative reveals: add `h-reveal` (headings) or `img-reveal` (images)
    // to any element and it animates in the first time it scrolls into view.
    root.classList.add("motion-ready");
    // Chrome counts an element's own clip-path when measuring visibility, so a fully clipped
    // element never "intersects". We watch each element's unclipped parent instead.
    const waiting = new Map<Element, Set<Element>>();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      waiting.get(e.target)?.forEach((el) => el.classList.add("is-seen"));
      waiting.delete(e.target);
      io.unobserve(e.target);
    }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    let scanRaf = 0;
    const scan = () => {
      scanRaf = 0;
      waiting.forEach((_, host) => { if (!host.isConnected) { io.unobserve(host); waiting.delete(host); } });
      document.querySelectorAll(".h-reveal:not(.is-seen), .img-reveal:not(.is-seen), .foot-cascade:not(.is-seen)").forEach((el) => {
        const host = el.parentElement ?? el;
        const set = waiting.get(host);
        if (set) set.add(el); else { waiting.set(host, new Set([el])); io.observe(host); }
      });
    };
    scan();
    const mo = new MutationObserver(() => { if (!scanRaf) scanRaf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });

    // Fade out the first-load screen once the app has rendered.
    const pre = document.getElementById("preload");
    if (pre) { pre.classList.add("gone"); setTimeout(() => pre.remove(), 700); }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onPointer);
      io.disconnect(); mo.disconnect(); cancelAnimationFrame(scanRaf);
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

/**
 * 3D stage for the hero card: the card tilts toward the cursor and any child with
 * `data-depth` (e.g. floating chips) shifts by that depth, creating layered parallax.
 * Pointer devices only; static on touch screens and with reduced motion.
 */
export function TiltStage({ children, className = "", max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    let raf = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
        el.style.setProperty("--tx", x.toFixed(3));
        el.style.setProperty("--ty", y.toFixed(3));
      });
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const leave = () => set(0, 0);
    // Listen on the whole hero so the card responds before the cursor reaches it.
    const host = el.closest("section") ?? el;
    host.addEventListener("pointermove", move as EventListener);
    host.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); host.removeEventListener("pointermove", move as EventListener); host.removeEventListener("pointerleave", leave); };
  }, [max]);
  return <div ref={ref} className={`tilt-stage ${className}`}>{children}</div>;
}

/**
 * A road that fills as its section scrolls through the viewport, with a car driving
 * along it and milestones lighting up — one per step.
 */
export function ScrollRoad({ steps, gap = "2rem" }: { steps: number; gap?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.style.setProperty("--p", "1"); setReached(steps); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const host = el.closest("section") ?? el.parentElement ?? el;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.25)));
      el.style.setProperty("--p", p.toFixed(4));
      setReached(Math.min(steps, Math.floor(p * steps + 0.15)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [steps]);
  return (
    <div ref={ref} className="scroll-road hidden md:block" aria-hidden>
      <div className="road-track" />
      <div className="road-fill" />
      <div className="road-dash" />
      {Array.from({ length: steps }, (_, i) => (
        <span key={i} className={`road-dot ${i < reached ? "on" : ""}`} style={{ left: `calc(${i} * (100% + ${gap}) / ${steps})` }}>{i + 1}</span>
      ))}
      <div className="road-car-lane"><span className="road-car">
        <svg viewBox="0 0 32 18" width="30" height="17"><path d="M3 12.5Q2.6 9 6 8.3l4.6-.8Q13 3.4 17.2 3.2h5.4q3.3.4 5.3 4.2l1.4.5q1.3.6 1.3 2.3v2.3H3z" fill="#ffc72c" /><path d="M11.6 7.6q1.7-3 4.8-3.3h2.2v3.3zm8 0V4.3h2.6q2.4.4 4 3.3z" fill="#0e3b2e" opacity=".55" /><circle cx="9" cy="13" r="2.6" fill="#10201a" /><circle cx="24" cy="13" r="2.6" fill="#10201a" /></svg>
      </span></div>
    </div>
  );
}

/** Rolls smoothly from the previous value to the new one whenever `value` changes. */
export function AnimatedNumber({ value, format = (n) => String(n), duration = 450 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (prefersReducedMotion() || !Number.isFinite(value)) { setShown(value); from.current = value; return; }
    const start = performance.now(), a = from.current, b = value;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const v = a + (b - a) * (1 - Math.pow(1 - p, 3));
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="tabular-nums">{format(Math.round(shown))}</span>;
}
