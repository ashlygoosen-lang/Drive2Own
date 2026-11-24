import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Field } from "../components/Fields";
import { AuthShell } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";
import { api } from "../../lib/api";

export function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useTitle("Reset your password");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(false); }
  };

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const r = await api<{ devCode?: string }>("/auth/forgot", { method: "POST", body: { phone } });
      toast.success("If that number is registered, we've sent a 6-digit code by SMS.");
      if (r.devCode) { setCode(r.devCode); toast.info(`Development mode: your code is ${r.devCode}`); }
      setStep("code");
    });
  };
  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await api("/auth/reset", { method: "POST", body: { phone, code, password } });
      toast.success("Password updated. You can sign in now.");
      navigate("/login");
    });
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Reset your password"
      subtitle={step === "phone" ? "Enter your phone number and we'll send you a 6-digit code by SMS." : "Enter the code we sent and choose a new password."}>
      <ol className="flex items-center gap-3 mb-6 text-xs font-semibold">
        {["Your number", "New password"].map((l, i) => {
          const on = (step === "phone" ? 0 : 1) >= i;
          return (
            <li key={l} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${on ? "bg-[#00873a] text-white" : "bg-[#e3ebe6] text-gray-500"}`}>{i + 1}</span>
              <span className={on ? "text-[#10201a]" : "text-gray-500"}>{l}</span>
              {i === 0 && <span className="w-8 h-px bg-[#d5e2da]" />}
            </li>
          );
        })}
      </ol>
      {step === "phone" ? (
        <form key="phone" onSubmit={sendCode} className="swap-in space-y-5">
          <Field label="Phone number"><Input type="tel" autoComplete="tel" placeholder="082 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} required /></Field>
          <Button type="submit" size="lg" disabled={busy} className="btn-premium w-full">{busy ? "Sending…" : "Send code"}</Button>
        </form>
      ) : (
        <form key="code" onSubmit={reset} className="swap-in space-y-5">
          <Field label="6-digit code"><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required className="tracking-[0.4em] font-semibold" /></Field>
          <Field label="New password" hint="At least 8 characters"><Input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          <Button type="submit" size="lg" disabled={busy} className="btn-premium w-full">{busy ? "Saving…" : "Update password"}</Button>
          <button type="button" onClick={() => setStep("phone")} className="w-full text-sm text-gray-600 hover:text-[#0e3b2e]">Use a different number</button>
        </form>
      )}
      <p className="text-center text-sm mt-8"><Link to="/login" className="font-semibold text-[#00873a] hover:underline">← Back to sign in</Link></p>
    </AuthShell>
  );
}
