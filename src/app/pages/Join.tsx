import { useCallback, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Field, PlatformPicker } from "../components/Fields";
import { ArrowLeft, ArrowRight, Car, Check, Eye, EyeOff, FileCheck2, KeyRound } from "lucide-react";
import { AuthShell } from "../components/Layout";
import {
  AddressFields, DocumentUploader, FicaFields, IdentityFields, IncomeFields, Stepper, emptyProfile, profilePayload,
  validateAddress, validateFica, validateIdentity, validateIncome, type ProfileForm,
} from "../components/Onboarding";
import { useAuth } from "../../lib/auth";
import { useTitle } from "../../lib/useTitle";
import type { Platform, Role } from "../../lib/api";

const STEPS = ["Account", "Identity", "Address", "Income", "Declarations", "Documents"];
const STEP_INTRO = [
  "Free to join. Tell us how you'll use Drive2Own.",
  "We verify every member, so everyone on Drive2Own knows who they're dealing with.",
  "Your residential address, as it appears on your proof of residence.",
  "Your income and where your funds come from. This helps us assess affordability.",
  "A few declarations required under FICA and POPIA before we create your account.",
  "Your account is created. Upload your documents so our team can verify you.",
];

const READY: Record<Role, string[]> = {
  driver: ["SA ID or passport (and work permit if not South African)", "Driver's licence and PrDP", "Proof of residence (last 3 months)", "3 months of bank or e-hailing earnings statements", "A screenshot of your Uber, Bolt or inDrive driver profile"],
  owner: ["SA ID or passport (or company registration)", "Proof of residence (last 3 months)", "Bank confirmation letter for rent payments", "Vehicle registration certificate", "Insurance schedule covering e-hailing use"],
};

export function Join() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(params.get("role") === "owner" ? "owner" : "driver");
  const [acct, setAcct] = useState({ fullName: "", phone: "", email: "", password: "", confirm: "" });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [p, setP] = useState<ProfileForm>(emptyProfile);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState({ done: 0, total: 1 });
  useTitle(role === "owner" ? "List your car" : "Create a driver account");

  const set = useCallback(<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => setP((cur) => ({ ...cur, [k]: v })), []);
  const onProgress = useCallback((done: number, total: number) => setDocs({ done, total }), []);
  const a = (k: keyof typeof acct) => (e: React.ChangeEvent<HTMLInputElement>) => setAcct({ ...acct, [k]: e.target.value });

  const validateAccount = (): string | null => {
    if (acct.fullName.trim().split(/\s+/).length < 2) return "Enter your full name and surname, as on your ID";
    if (!/^(\+?27|0)\d{9}$/.test(acct.phone.replace(/[\s-]/g, ""))) return "Enter a valid South African mobile number";
    if (!/^\S+@\S+\.\S+$/.test(acct.email.trim())) return "Enter a valid email address";
    if (role === "driver" && platforms.length === 0) return "Choose at least one platform you drive on";
    if (acct.password.length < 8) return "Your password must be at least 8 characters";
    if (acct.password !== acct.confirm) return "The passwords don't match";
    return null;
  };
  const checks = [validateAccount, () => validateIdentity(p, role), () => validateAddress(p), () => validateIncome(p, role), () => validateFica(p)];

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = checks[step]?.();
    if (err) return toast.error(err);
    if (step < 4) { setStep(step + 1); scrollTop(); return; }
    // Step 4: create the account with the full profile
    setBusy(true);
    try {
      await register({
        role, fullName: acct.fullName.trim(), phone: acct.phone, email: acct.email.trim(), password: acct.password,
        city: p.city, platforms: role === "driver" ? platforms : [], profile: profilePayload(p),
      });
      toast.success("Account created. Now upload your documents.");
      setStep(5); scrollTop();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally { setBusy(false); }
  };
  const finish = (later = false) => {
    if (!later && docs.done < docs.total) return toast.error("Upload all the required documents, or choose to finish later");
    if (later) toast.info("You can upload the rest from your dashboard. Requests open once your documents are uploaded.");
    navigate(role === "driver" ? "/dashboard" : "/vehicles/new");
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

  const aside = (
    <div className="space-y-4 max-w-md">
      <p className="enter text-sm font-semibold text-white" style={{ ["--d" as string]: 300 }}>Have these ready</p>
      <ul className="space-y-3">
        {READY[role].map((t, i) => (
          <li key={t} className="enter flex gap-3 text-sm text-green-50/85" style={{ ["--d" as string]: 360 + i * 70 }}>
            <FileCheck2 className="w-4 h-4 text-[#ffc72c] shrink-0 mt-0.5" />{t}
          </li>
        ))}
      </ul>
      <p className="enter text-xs text-green-50/60 pt-2" style={{ ["--d" as string]: 800 }}>PDF, JPG, PNG or WebP, up to 8 MB each. Stored privately and processed under POPIA.</p>
    </div>
  );

  return (
    <AuthShell eyebrow={role === "owner" ? "For car owners" : "For drivers"} title={step === 5 ? "Upload your documents" : "Create your account"}
      subtitle={STEP_INTRO[step]} aside={aside}
      headline={role === "owner" ? <>Put your car to work, <span className="text-[#ffc72c]">on clear terms.</span></> : undefined}>
      <Stepper steps={STEPS} current={step} />
      {step < 5 ? (
        <form onSubmit={next} noValidate className="space-y-5">
          <div key={step} className="swap-in space-y-5">
            {step === 0 && (<>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard id="driver" icon={Car} title="I'm a driver" text="Rent a car for e-hailing" />
                <RoleCard id="owner" icon={KeyRound} title="I own a car" text="Rent my car to drivers" />
              </div>
              <Field label="Full name and surname" hint="Exactly as on your ID or passport"><Input autoComplete="name" value={acct.fullName} onChange={a("fullName")} /></Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Mobile number"><Input type="tel" autoComplete="tel" placeholder="082 123 4567" value={acct.phone} onChange={a("phone")} /></Field>
                <Field label="Email address"><Input type="email" autoComplete="email" value={acct.email} onChange={a("email")} /></Field>
              </div>
              {role === "driver" && (
                <div className="swap-in"><Field label="Which platforms do you drive on?"><PlatformPicker value={platforms} onChange={setPlatforms} /></Field></div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Password" hint="At least 8 characters">
                  <div className="relative">
                    <Input type={show ? "text" : "password"} autoComplete="new-password" value={acct.password} onChange={a("password")} className="pr-11" />
                    <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0e3b2e]">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm password"><Input type={show ? "text" : "password"} autoComplete="new-password" value={acct.confirm} onChange={a("confirm")} /></Field>
              </div>
            </>)}
            {step === 1 && <IdentityFields p={p} set={set} role={role} />}
            {step === 2 && <AddressFields p={p} set={set} />}
            {step === 3 && <IncomeFields p={p} set={set} role={role} />}
            {step === 4 && <FicaFields p={p} set={set} />}
          </div>
          <div className="flex gap-3 pt-2">
            {step > 0 && <Button type="button" variant="outline" size="lg" onClick={() => { setStep(step - 1); scrollTop(); }}><ArrowLeft className="w-4 h-4" />Back</Button>}
            <Button type="submit" size="lg" disabled={busy} className="btn-premium flex-1">
              {busy ? "Creating your account…" : step === 4 ? <>Create my account <ArrowRight className="w-4 h-4" /></> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
          {step === 0 && (
            <p className="text-center text-sm text-gray-600">Already registered? <Link to="/login" className="text-[#00873a] hover:underline font-semibold">Sign in</Link></p>
          )}
        </form>
      ) : (
        <div className="swap-in space-y-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{docs.done} of {docs.total} required documents uploaded</span>
            <span className="font-semibold text-[#00873a]">{Math.round((docs.done / Math.max(1, docs.total)) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#e3ebe6] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#00873a] to-[#3fbf7f] transition-[width] duration-700" style={{ width: `${(docs.done / Math.max(1, docs.total)) * 100}%` }} /></div>
          <DocumentUploader onProgress={onProgress} />
          <Button size="lg" className="btn-premium w-full" onClick={() => finish(false)} disabled={docs.done < docs.total}>
            Submit for verification <ArrowRight className="w-4 h-4" />
          </Button>
          <button type="button" onClick={() => finish(true)} className="w-full text-sm text-gray-600 hover:text-[#0e3b2e]">Save and finish later</button>
        </div>
      )}
    </AuthShell>
  );
}
