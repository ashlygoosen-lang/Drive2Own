import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Field, PlatformPicker } from "../components/Fields";
import { ArrowRight, Car, Check, KeyRound } from "lucide-react";
import { AuthShell } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";
import { useAuth } from "../../lib/auth";
import type { Platform, Role } from "../../lib/api";

export function Join() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();
  const [role, setRole] = useState<Role>(params.get("role") === "owner" ? "owner" : "driver");
  const [f, setF] = useState({ fullName: "", phone: "", email: "", password: "", city: "Cape Town" });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  useTitle(role === "owner" ? "List your car" : "Create a driver account");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return toast.error("Please accept the terms to continue");
    setBusy(true);
    try {
      await register({ ...f, role, platforms: role === "driver" ? platforms : [] });
      toast.success("Welcome to Drive2Own!");
      navigate(role === "driver" ? "/documents" : "/vehicles/new");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  const RoleCard = ({ id, icon: Icon, title, text }: { id: Role; icon: typeof Car; title: string; text: string }) => {
    const on = role === id;
    return (
      <button type="button" onClick={() => setRole(id)} aria-pressed={on}
        className={`relative text-left p-4 rounded-xl border-2 transition-all duration-300 ${on ? "border-[#00873a] bg-[#f1f8f4] shadow-[0_10px_24px_-18px_rgba(0,135,58,0.8)]" : "border-[#e3ebe6] bg-white hover:border-[#b9cdc1]"}`}>
        <span className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${on ? "bg-[#00873a] scale-100" : "bg-[#e3ebe6] scale-90"}`}>
          {on && <Check className="w-3 h-3 text-white" />}
        </span>
        <span className={`mb-3 w-10 h-10 rounded-xl flex items-center justify-center ${on ? "bg-[#00873a] text-white" : "bg-[#e3f1e9] text-[#00873a]"}`}><Icon className="w-5 h-5" /></span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-gray-600 mt-0.5">{text}</span>
      </button>
    );
  };

  const ownerAside = (
    <ul className="space-y-4 max-w-md">
      {["List your car with photos, weekly rate and deposit", "Review each driver's verified documents before you decide", "Payments scheduled weekly and tracked for you"].map((t, i) => (
        <li key={t} className="enter flex gap-3 text-green-50/85" style={{ ["--d" as string]: 300 + i * 90 }}>
          <Check className="w-5 h-5 text-[#ffc72c] shrink-0 mt-0.5" />{t}
        </li>
      ))}
    </ul>
  );

  return (
    <AuthShell eyebrow={role === "owner" ? "For car owners" : "For drivers"} title="Create your account"
      subtitle="Free to join. Tell us how you'll use Drive2Own." aside={role === "owner" ? ownerAside : undefined}
      headline={role === "owner" ? <>Put your car to work, <span className="text-[#ffc72c]">on clear terms.</span></> : undefined}>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <RoleCard id="driver" icon={Car} title="I'm a driver" text="Rent a car for e-hailing" />
          <RoleCard id="owner" icon={KeyRound} title="I own a car" text="Rent my car to drivers" />
        </div>
        <Field label="Full name"><Input autoComplete="name" value={f.fullName} onChange={set("fullName")} required minLength={2} /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone number" hint="SA mobile, e.g. 082 123 4567">
            <Input type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} required />
          </Field>
          <Field label="City"><Input autoComplete="address-level2" value={f.city} onChange={set("city")} required /></Field>
        </div>
        <Field label="Email (optional)"><Input type="email" autoComplete="email" value={f.email} onChange={set("email")} /></Field>
        {role === "driver" && (
          <div className="swap-in"><Field label="Which platforms do you drive on?">
            <PlatformPicker value={platforms} onChange={setPlatforms} />
          </Field></div>
        )}
        <Field label="Password" hint="At least 8 characters">
          <Input type="password" autoComplete="new-password" value={f.password} onChange={set("password")} required minLength={8} />
        </Field>
        <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer rounded-xl bg-white border border-[#e3ebe6] p-4">
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#00873a]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to the <Link to="/terms" className="font-medium text-[#00873a] hover:underline">terms of use</Link> and <Link to="/privacy" className="font-medium text-[#00873a] hover:underline">privacy policy</Link>, and understand that rental agreements are between the owner and the driver.</span>
        </label>
        <Button type="submit" size="lg" disabled={busy} className="btn-premium w-full">
          {busy ? "Creating account…" : <>Create account <ArrowRight className="w-4 h-4" /></>}
        </Button>
        <p className="text-center text-sm text-gray-600">
          Already registered? <Link to="/login" className="text-[#00873a] hover:underline font-semibold">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
