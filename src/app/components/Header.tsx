import { Link, NavLink, useNavigate } from "react-router";
import { Car, Heart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../../lib/auth";
import { NotificationBell } from "./NotificationBell";

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
    `nav-link transition-colors hover:text-[#00873a] ${isActive ? "active text-[#00873a] font-medium" : "text-gray-700"}`;
  const close = () => setOpen(false);
  const doLogout = () => { logout(); close(); navigate("/"); };

  const items = (
    <>
      <NavLink to="/vehicles" className={link} onClick={close}>Rent a Car</NavLink>
      <NavLink to="/drive-to-own" className={link} onClick={close}>Drive to Own</NavLink>
      <NavLink to="/saved" className={link} onClick={close}><span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" />Saved</span></NavLink>
      {user ? (
        <>
          <NavLink to="/dashboard" className={link} onClick={close}>Dashboard</NavLink>
          <NavLink to="/documents" className={link} onClick={close}>Documents</NavLink>
          {user.isAdmin && <NavLink to="/admin" className={link} onClick={close}>Admin</NavLink>}
          <NotificationBell />
          <Button variant="outline" onClick={doLogout}>Logout</Button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={link} onClick={close}>Login</NavLink>
          <Link to="/join" onClick={close}>
            <Button className="btn-premium bg-[#00873a] hover:bg-[#006f2f] w-full">Join Now</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className={`site-header border-b bg-white sticky top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="logo-mark w-10 h-10 bg-[#0e3b2e] rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-[#ffc72c]" />
            </div>
            <span className="font-display text-xl font-bold text-[#0e3b2e]">Drive2Own</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">{items}</nav>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && <nav className="menu-enter md:hidden py-4 flex flex-col gap-3 border-t">{items}</nav>}
      </div>
    </header>
  );
}
