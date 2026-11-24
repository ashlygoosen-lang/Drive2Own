import { Link } from "react-router";
import { PageShell, cta } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";

export function NotFound() {
  useTitle("Page not found");
  return (
    <PageShell>
      <div className="max-w-xl mx-auto px-4 py-24 md:py-32 text-center space-y-5">
        <p className="enter font-display text-[7rem] leading-none font-extrabold bg-gradient-to-b from-[#0e3b2e] to-[#00873a] bg-clip-text text-transparent">404</p>
        <h1 className="enter font-display text-3xl font-bold" style={{ ["--d" as string]: 100 }}>This page took a wrong turn</h1>
        <p className="enter text-gray-600" style={{ ["--d" as string]: 180 }}>The page you're looking for doesn't exist or has moved.</p>
        <div className="enter flex flex-wrap justify-center gap-3 pt-2" style={{ ["--d" as string]: 260 }}>
          <Link to="/" className={cta.green}>Go home</Link>
          <Link to="/vehicles" className={cta.ghost}>Find a car</Link>
        </div>
      </div>
    </PageShell>
  );
}
