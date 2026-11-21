import { Link } from "react-router";
import { Car } from "lucide-react";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

export function Footer() {
  const col = "space-y-2 text-sm";
  const a = "text-green-100/80 hover:text-white";
  return (
    <footer className="bg-[#0e3b2e] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#ffc72c] flex items-center justify-center"><Car className="w-5 h-5 text-[#0e3b2e]" /></div>
            <span className="font-display text-xl font-bold">Drive2Own</span>
          </div>
          <p className="text-sm text-green-100/80 max-w-sm">
            A marketplace connecting car owners with licensed e-hailing drivers across South Africa.
          </p>
          {CONTACT && <a className="text-sm underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>}
        </div>
        <nav className={col} aria-label="Drivers and owners">
          <div className="font-semibold">Get started</div>
          <div><Link className={a} to="/vehicles">Find a car</Link></div>
          <div><Link className={a} to="/join?role=driver">Sign up as a driver</Link></div>
          <div><Link className={a} to="/join?role=owner">List your car</Link></div>
          <div><Link className={a} to="/login">Login</Link></div>
        </nav>
        <nav className={col} aria-label="Company">
          <div className="font-semibold">Information</div>
          <div><Link className={a} to="/#how-it-works">How it works</Link></div>
          <div><Link className={a} to="/#faq">FAQ</Link></div>
          <div><Link className={a} to="/terms">Terms of use</Link></div>
          <div><Link className={a} to="/privacy">Privacy policy</Link></div>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 px-4 text-center text-xs text-green-100/70">
        <p>© {new Date().getFullYear()} Drive2Own. Drive2Own is a division of VINK Group (Pty) Ltd, registration number 2018/079316/07.</p>
        <p className="mt-1">Drive2Own is an independent marketplace and is not affiliated with, endorsed by or sponsored by Uber, inDrive or Bolt.</p>
      </div>
    </footer>
  );
}
