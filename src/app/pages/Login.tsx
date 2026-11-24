import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "../components/Layout";
import { useAuth } from "../../lib/auth";
import { useTitle } from "../../lib/useTitle";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  useTitle("Sign in");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(phone, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to Drive2Own" subtitle="Use the phone number and password you registered with.">
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-[13px] font-semibold">Phone number</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3.5 h-11 border border-[#d9e4dd] rounded-lg bg-[#f6f9f7] text-sm font-medium">🇿🇦 +27</div>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="82 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} required className="flex-1" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-semibold">Password</Label>
            <Link to="/forgot" className="text-sm font-medium text-[#00873a] hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-11" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0e3b2e]">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" disabled={busy} className="btn-premium w-full">
          {busy ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>
      <div className="mt-8 rounded-2xl border border-[#e3ebe6] bg-white p-5 text-sm">
        <p className="font-semibold">New to Drive2Own?</p>
        <p className="text-gray-600 mt-0.5">Create a free account as a driver or a car owner in a couple of minutes.</p>
        <Link to="/join" className="link-arrow inline-block mt-3 font-semibold text-[#00873a]">Create an account <span className="arr">→</span></Link>
      </div>
    </AuthShell>
  );
}
