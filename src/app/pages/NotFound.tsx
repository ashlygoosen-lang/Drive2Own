import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useTitle } from "../../lib/useTitle";

export function NotFound() {
  useTitle("Page not found");
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="font-display text-7xl font-extrabold text-[#0e3b2e]">404</p>
        <h1 className="font-display text-2xl font-bold">This page took a wrong turn</h1>
        <p className="text-gray-600">The page you're looking for doesn't exist or has moved.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/" className="h-11 inline-flex items-center px-6 rounded-lg bg-[#0e3b2e] text-white font-semibold">Go home</Link>
          <Link to="/vehicles" className="h-11 inline-flex items-center px-6 rounded-lg border font-semibold">Find a car</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
