import { Link, useLocation, useNavigate } from "react-router";
import { Car, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { HowItWorksModal } from "./HowItWorksModal";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const isLoggedIn = location.pathname.includes('/dashboard') || location.pathname.includes('/documents');

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setHowItWorksOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00C853] rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Drive2Own</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!isLoggedIn ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-[#00C853]">
                  Home
                </Link>
                <a 
                  href="#how-it-works" 
                  className="text-gray-700 hover:text-[#00C853] cursor-pointer"
                  onClick={handleHowItWorksClick}
                >
                  How It Works
                </a>
                <Link to="/login" className="text-gray-700 hover:text-[#00C853]">
                  Login
                </Link>
                <Link to="/join">
                  <Button className="bg-[#00C853] hover:bg-[#00b84a]">
                    Join Now
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-gray-700 hover:text-[#00C853] ${location.pathname === '/dashboard' ? 'text-[#00C853]' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/documents" 
                  className={`text-gray-700 hover:text-[#00C853] ${location.pathname === '/documents' ? 'text-[#00C853]' : ''}`}
                >
                  Documents
                </Link>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Logout
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/" 
                  className="block text-gray-700 hover:text-[#00C853] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <a 
                  href="#how-it-works" 
                  className="block text-gray-700 hover:text-[#00C853] py-2 cursor-pointer"
                  onClick={handleHowItWorksClick}
                >
                  How It Works
                </a>
                <Link 
                  to="/login" 
                  className="block text-gray-700 hover:text-[#00C853] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link to="/join" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#00C853] hover:bg-[#00b84a]">
                    Join Now
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className="block text-gray-700 hover:text-[#00C853] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/documents" 
                  className="block text-gray-700 hover:text-[#00C853] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documents
                </Link>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                  Logout
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
      <HowItWorksModal open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </header>
  );
}