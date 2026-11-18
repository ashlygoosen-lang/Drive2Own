import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Field } from "../components/Fields";
import { api } from "../../lib/api";

export function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>{step === "phone" ? "Enter your phone number and we'll text you a code." : "Enter the code we sent and choose a new password."}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={sendCode} className="space-y-4">
                <Field label="Phone number"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></Field>
                <Button type="submit" disabled={busy} className="w-full bg-[#00873a] hover:bg-[#006f2f]">{busy ? "Sending…" : "Send code"}</Button>
              </form>
            ) : (
              <form onSubmit={reset} className="space-y-4">
                <Field label="6-digit code"><Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required /></Field>
                <Field label="New password" hint="At least 8 characters"><Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
                <Button type="submit" disabled={busy} className="w-full bg-[#00873a] hover:bg-[#006f2f]">{busy ? "Saving…" : "Update password"}</Button>
              </form>
            )}
            <p className="text-center text-sm mt-4"><Link to="/login" className="text-[#00873a] hover:underline">Back to login</Link></p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
