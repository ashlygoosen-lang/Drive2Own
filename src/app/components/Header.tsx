import { Link, NavLink, useNavigate } from "react-router";
import { Heart, LayoutDashboard, LogOut, Mail, MapPin, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../../lib/auth";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "./Brand";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const link = ({ isActive }: { isActive: boolean }) =>
    `nav-link text-[15px] transition-colors hover:text-[#00873a] ${isActive ? "active text-[#00873a] font-semibold" : "text-gray-700 font-medium"}`;
  const close = () => setOpen(false);
  const doLogout = () => { logout(); close(); navigate("/"); };

  const primary = (
    <>
      <NavLink to="/vehicles" className={link} onClick={close}>Rent a Car</NavLink>
      <NavLink to="/drive-to-own" className={link} onClick={close}>Drive to Own</NavLink>
      <Link to="/join?role=owner" className={link({ isActive: false })} onClick={close}>For Owners</Link>
      <Link to="/#faq" className={link({ isActive: false })} onClick={close}>FAQ</Link>
    </>
  );

  const account = user ? (
    <>
      <NavLink to="/saved" className={link} onClick={close} aria-label="Saved cars"><span className="inline-flex items-center gap-2"><Heart className="w-[18px] h-[18px]" /><span className="lg:hidden">Saved cars</span></span></NavLink>
      <NotificationBell />
      {user.isAdmin && <NavLink to="/admin" className={link} onClick={close}>Admin</NavLink>}
      <Link to="/dashboard" onClick={close}>
        <Button className="btn-premium w-full"><LayoutDashboard className="w-4 h-4" />Dashboard</Button>
      </Link>
      <Button variant="ghost" onClick={doLogout} aria-label="Log out" className="px-3"><LogOut className="w-4 h-4" /><span className="md:hidden">Log out</span></Button>
    </>
  ) : (
    <>
      <NavLink to="/saved" className={link} onClick={close} aria-label="Saved cars"><span className="inline-flex items-center gap-2"><Heart className="w-[18px] h-[18px]" /><span className="lg:hidden">Saved cars</span></span></NavLink>
      <NavLink to="/login" className={link} onClick={close}>Sign in</NavLink>
      <Link to="/join" onClick={close}>
        <Button className="btn-premium w-full">Join now</Button>
      </Link>
    </>
  );

  return (
    <>
      {/* Utility bar */}
      <div className="hidden md:block bg-[#0a2c22] text-green-50/75 text-[13px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#ffc72c]" />Cape Town · serving drivers across South Africa</span>
            <span className="hidden lg:flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#ffc72c]" />Verified drivers · written agreements</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden lg:inline">For Uber, Bolt and inDrive drivers</span>
            {CONTACT && <a href={`mailto:${CONTACT}`} className="flex items-center gap-1.5 hover:text-white transition-colors"><Mail className="w-3.5 h-3.5 text-[#ffc72c]" />{CONTACT}</a>}
            {!user && <Link to="/login" className="font-semibold text-white hover:text-[#ffc72c] transition-colors">Owner &amp; driver login</Link>}
          </div>
        </div>
      </div>

      <header className={`site-header border-b border-[#e3ebe6] bg-white sticky top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px] gap-6">
            <Link to="/" aria-label="Drive2Own, home"><Logo /></Link>
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main">{primary}</nav>
            <div className="hidden lg:flex items-center gap-5">{account}</div>
            <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {open && (
            <nav className="menu-enter lg:hidden py-4 flex flex-col gap-4 border-t border-[#e3ebe6]" aria-label="Mobile">
              {primary}
              <div className="h-px bg-[#e3ebe6]" />
              {account}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
