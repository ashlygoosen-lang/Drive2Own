import { Link } from "react-router";
import { ArrowRight, BadgeCheck, FileSignature, Lock, Mail, MapPin, ReceiptText } from "lucide-react";
import { Logo } from "./Brand";
import { Magnetic } from "./Motion";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

const COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: "For drivers", links: [["Find a car to rent", "/vehicles"], ["Uber cars", "/vehicles?platform=uber"], ["Bolt cars", "/vehicles?platform=bolt"], ["inDrive cars", "/vehicles?platform=indrive"], ["Sign up as a driver", "/join?role=driver"]] },
  { title: "For owners", links: [["List your car", "/join?role=owner"], ["How it works", "/#how-it-works"], ["Income calculator", "/#calculator"], ["Owner login", "/login"]] },
  { title: "Drive to Own", links: [["How the programme works", "/drive-to-own#how"], ["How we protect you", "/drive-to-own#protection"], ["Register your interest", "/drive-to-own"], ["Questions", "/drive-to-own"]] },
  { title: "Help", links: [["FAQ", "/#faq"], ["Saved cars", "/saved"], ["Terms of use", "/terms"], ["Privacy policy (POPIA)", "/privacy"]] },
];

const TRUST: [typeof BadgeCheck, string][] = [
  [BadgeCheck, "Driver documents reviewed"],
  [FileSignature, "Written rental agreements"],
  [ReceiptText, "Every payment on record"],
  [Lock, "POPIA-compliant privacy"],
];

/** `cta={false}` hides the closing call-to-action band on pages that already end with one. */
export function Footer({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="mt-auto text-white">
      {/* Closing call to action */}
      {cta && <section className="hero-ambient bg-[#0e3b2e] border-t border-white/5">
        <span aria-hidden className="pointer-events-none absolute -right-40 -top-40 w-[520px] h-[520px] rounded-full border border-[#ffc72c]/15" />
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 w-[320px] h-[320px] rounded-full border border-[#ffc72c]/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div className="space-y-3">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffc72c]"><span className="h-px w-8 bg-[#ffc72c]/70" />Get started today</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">Your next car is a few steps away.</h2>
            <p className="text-green-50/80 max-w-xl">Rent a car from a verified owner this week, put your own car to work, or start on the road to owning one.</p>
          </div>
          <div className="flex flex-col sm:flex-row md:justify-end gap-3">
            <Magnetic><Link to="/vehicles" className="btn-premium w-full inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Find a car <ArrowRight className="w-4 h-4" /></Link></Magnetic>
            <Magnetic><Link to="/join?role=owner" className="btn-ghost-premium w-full inline-flex items-center justify-center h-12 px-7 rounded-lg border border-white/35 font-semibold hover:bg-white/10">List your car</Link></Magnetic>
          </div>
        </div>
      </section>}

      <div className="bg-[#081f18]">
        {/* Trust strip */}
        <div className="border-b border-white/10">
          <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-green-50/80">
            {TRUST.map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-2.5"><Icon className="w-4 h-4 text-[#ffc72c] shrink-0" />{t}</li>
            ))}
          </ul>
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-12 lg:grid-cols-[1.3fr_2.7fr]">
          <div className="space-y-6">
            <Link to="/" aria-label="Drive2Own, home" className="inline-block"><Logo dark /></Link>
            <p className="font-display text-xl leading-snug text-white/90 max-w-xs">Rent today. Drive with confidence. Own tomorrow.</p>
            <ul className="space-y-3 text-sm text-green-50/75">
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 text-[#ffc72c] shrink-0" />Cape Town, South Africa<br />Serving e-hailing drivers nationwide</li>
              {CONTACT && <li><a href={`mailto:${CONTACT}`} className="flex items-center gap-2.5 hover:text-white transition-colors"><Mail className="w-4 h-4 text-[#ffc72c] shrink-0" />{CONTACT}</a></li>}
            </ul>
          </div>
          <div className="foot-cascade grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map((c) => (
              <nav key={c.title} aria-label={c.title} className="space-y-4">
                <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                <ul className="space-y-2.5">
                  {c.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="footer-link text-sm text-green-50/65 hover:text-white">{label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-sm text-green-50/70">
            <div className="space-y-1">
              <p>© {new Date().getFullYear()} Drive2Own. All rights reserved.</p>
              <p>Drive2Own is a division of VINK Group (Pty) Ltd, registration number 2018/079316/07.</p>
            </div>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of use</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy &amp; POPIA</Link>
              <Link to="/#faq" className="hover:text-white transition-colors">FAQ</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
