import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { PageHero, PageShell } from "../components/Layout";
import {
  AddressFields, DocumentUploader, FicaFields, IdentityFields, IncomeFields, Stepper, emptyProfile, profilePayload,
  validateAddress, validateFica, validateIdentity, validateIncome, type ProfileForm,
} from "../components/Onboarding";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useTitle } from "../../lib/useTitle";

const STEPS = ["Identity", "Address", "Income", "Declarations", "Documents"];

/** For accounts created before full verification details were required. */
export function CompleteProfile() {
  useTitle("Complete your profile");
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;
  const [step, setStep] = useState(user?.profileComplete ? 4 : 0);
  const [p, setP] = useState<ProfileForm>({ ...emptyProfile, city: user?.city ?? "Cape Town" });
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState({ done: 0, total: 1 });
  const set = useCallback(<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => setP((c) => ({ ...c, [k]: v })), []);
  const onProgress = useCallback((done: number, total: number) => setDocs({ done, total }), []);
  const checks = [() => validateIdentity(p, role), () => validateAddress(p), () => validateIncome(p, role), () => validateFica(p)];

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = checks[step]?.();
    if (err) return toast.error(err);
    if (step < 3) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setBusy(true);
    try {
      await api("/auth/profile", { method: "PUT", body: profilePayload(p) });
      await refresh();
      toast.success("Profile saved. Now upload your documents.");
      setStep(4);
    } catch (e2) { toast.error(e2 instanceof Error ? e2.message : "Could not save your profile"); }
    finally { setBusy(false); }
  };

  return (
    <PageShell cta={false} hero={
      <PageHero compact eyebrow="Verification" crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Complete your profile" }]}
        title="Complete your profile" subtitle="We now verify every member's identity, address and income, in line with FICA. It takes about five minutes." />
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <Card className="max-w-2xl"><CardContent className="p-6 sm:p-8">
          <Stepper steps={STEPS} current={step} />
          {step < 4 ? (
            <form onSubmit={next} noValidate className="space-y-5">
              <div key={step} className="swap-in">
                {step === 0 && <IdentityFields p={p} set={set} role={role} />}
                {step === 1 && <AddressFields p={p} set={set} />}
                {step === 2 && <IncomeFields p={p} set={set} role={role} />}
                {step === 3 && <FicaFields p={p} set={set} />}
              </div>
              <div className="flex gap-3 pt-2">
                {step > 0 && <Button type="button" variant="outline" size="lg" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4" />Back</Button>}
                <Button type="submit" size="lg" disabled={busy} className="btn-premium flex-1">{busy ? "Saving…" : step === 3 ? "Save my profile" : "Continue"} <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </form>
          ) : (
            <div className="swap-in space-y-5">
              <p className="text-sm text-gray-600">{docs.done} of {docs.total} required documents uploaded.</p>
              <DocumentUploader onProgress={onProgress} />
              <Button size="lg" className="btn-premium w-full" onClick={() => navigate("/dashboard")}>
                {docs.done < docs.total ? "Save and finish later" : "Done"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent></Card>
      </div>
    </PageShell>
  );
}
