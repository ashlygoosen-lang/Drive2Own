import type { ReactNode } from "react";
import { Link } from "react-router";
import { BadgeCheck, ChevronRight, FileSignature, ReceiptText, type LucideIcon } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HeroAmbient } from "./Motion";
export { Logo, LogoMark } from "./Brand";

/** Small uppercase label with a gold rule, used above section headings. */
export function Eyebrow({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#ffc72c]" : "text-[#00873a]"} ${className}`}>
      <span className={`h-px w-8 ${dark ? "bg-[#ffc72c]/70" : "bg-[#00873a]/60"}`} aria-hidden />
      {children}
    </p>
  );
}

type Crumb = { label: string; to?: string };

/** Dark banner at the top of inner pages: breadcrumbs, eyebrow, title, intro and optional actions. */
export function PageHero({ eyebrow, title, subtitle, crumbs, actions, children, compact = false }: {
  eyebrow?: string; title: ReactNode; subtitle?: ReactNode; crumbs?: Crumb[]; actions?: ReactNode; children?: ReactNode; compact?: boolean;
}) {
  return (
    <section className="hero-ambient bg-[#0e3b2e] text-white">
      <HeroAmbient />
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? "py-10 md:py-12" : "py-12 md:py-16"}`}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="enter mb-6 flex flex-wrap items-center gap-1.5 text-sm text-green-100/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                {c.to ? <Link to={c.to} className="hover:text-white transition-colors">{c.label}</Link> : <span className="text-white/90">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            {eyebrow && <div className="enter"><Eyebrow dark>{eyebrow}</Eyebrow></div>}
            <h1 className="enter font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.08]" style={{ ["--d" as string]: 80 }}>{title}</h1>
            {subtitle && <p className="enter text-green-50/85 text-base md:text-lg max-w-2xl" style={{ ["--d" as string]: 160 }}>{subtitle}</p>}
          </div>
          {actions && <div className="enter flex flex-wrap gap-3" style={{ ["--d" as string]: 240 }}>{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Standard page frame: header, optional hero, content and footer. */
export function PageShell({ hero, children, footer = true, cta = true, className = "" }: { hero?: ReactNode; children: ReactNode; footer?: boolean; cta?: boolean; className?: string }) {
  return (
    <div className="min-h-screen bg-[#f6f9f7] text-[#10201a] flex flex-col">
      <Header />
      {hero}
      <main id="main" className={`flex-1 ${className}`}>{children}</main>
      {footer ? <Footer cta={cta} /> : <div className="h-16" />}
    </div>
  );
}

const AUTH_POINTS: [LucideIcon, string, string][] = [
  [BadgeCheck, "Verified drivers", "Every driver's ID, licence and PrDP is reviewed by our team."],
  [FileSignature, "Written agreements", "Both sides accept clear terms before the keys change hands."],
  [ReceiptText, "Payments on record", "Deposit and weekly rent are scheduled and tracked."],
];

/** Split-screen layout for sign-in, sign-up and password reset. */
export function AuthShell({ eyebrow, title, subtitle, children, aside, headline }: { eyebrow: string; title: string; subtitle: string; children: ReactNode; aside?: ReactNode; headline?: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f9f7] text-[#10201a] flex flex-col">
      <Header />
      <main id="main" className="flex-1 grid lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hero-ambient [overflow:clip] hidden lg:block bg-[#0e3b2e] text-white">
          <HeroAmbient />
          <div className="sticky top-[72px] min-h-[calc(100vh-108px)] flex flex-col justify-between gap-10 p-12 xl:p-16">
          <div className="space-y-6 max-w-md">
            <div className="enter"><Eyebrow dark>{eyebrow}</Eyebrow></div>
            <h2 className="enter font-display text-4xl xl:text-5xl font-extrabold leading-[1.05]" style={{ ["--d" as string]: 100 }}>
              {headline ?? <>Your next car, <span className="text-[#ffc72c]">on clear terms.</span></>}
            </h2>
            <p className="enter text-green-50/80" style={{ ["--d" as string]: 200 }}>
              Drive2Own connects verified e-hailing drivers with car owners across South Africa, and offers a structured path to owning your own car.
            </p>
          </div>
          {aside ?? (
            <ul className="space-y-5 max-w-md">
              {AUTH_POINTS.map(([Icon, t, d], i) => (
                <li key={t} className="enter flex gap-4" style={{ ["--d" as string]: 300 + i * 90 }}>
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center"><Icon className="w-5 h-5 text-[#ffc72c]" /></span>
                  <span><span className="block font-semibold">{t}</span><span className="block text-sm text-green-50/70">{d}</span></span>
                </li>
              ))}
            </ul>
          )}
          </div>
        </aside>
        <section className="flex items-start lg:items-center justify-center px-4 sm:px-6 py-10 md:py-16">
          <div className="enter-card w-full max-w-md" style={{ ["--d" as string]: 120 }}>
            <div className="mb-8 space-y-2">
              <div className="lg:hidden"><Eyebrow>{eyebrow}</Eyebrow></div>
              <h1 className="font-display text-3xl md:text-[2.1rem] font-extrabold leading-tight">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

/** Friendly empty state with an icon and an optional action. */
export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cfddd5] bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#e3f1e9] flex items-center justify-center"><Icon className="w-7 h-7 text-[#00873a]" /></div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 text-sm text-gray-600 max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Metric tile for dashboards. */
export function StatCard({ icon: Icon, label, value, tone = "default" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: "default" | "alert" }) {
  return (
    <div className="lift rounded-2xl border border-[#e3ebe6] bg-white p-5 shadow-[0_1px_2px_rgba(16,32,26,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-500">{label}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone === "alert" ? "bg-amber-50 text-amber-600" : "bg-[#e3f1e9] text-[#00873a]"}`}><Icon className="w-[18px] h-[18px]" /></span>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

/** Primary CTA link styles shared across pages. */
export const cta = {
  gold: "btn-premium inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]",
  green: "btn-premium inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg bg-[#00873a] text-white font-semibold hover:bg-[#006f2f]",
  ghostDark: "btn-ghost-premium inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg border border-white/35 text-white font-semibold hover:bg-white/10",
  ghost: "inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg border border-[#d5e2da] bg-white font-semibold hover:bg-[#f1f6f3] transition-colors",
};
