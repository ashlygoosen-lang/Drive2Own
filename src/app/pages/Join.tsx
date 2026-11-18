import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Field, PlatformPicker } from "../components/Fields";
import { Car, KeyRound } from "lucide-react";
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

  const RoleCard = ({ id, icon: Icon, title, text }: { id: Role; icon: typeof Car; title: string; text: string }) => (
    <button
      type="button"
      onClick={() => setRole(id)}
      className={`text-left p-4 rounded-lg border-2 transition-colors ${role === id ? "border-[#00873a] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
    >
      <Icon className="w-6 h-6 text-[#00873a] mb-2" />
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-600">{text}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Tell us how you'll use Drive2Own</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <RoleCard id="driver" icon={Car} title="I'm a driver" text="I want to rent a car for ride-hailing" />
                <RoleCard id="owner" icon={KeyRound} title="I own a vehicle" text="I want to rent my car to drivers" />
              </div>
              <Field label="Full name"><Input value={f.fullName} onChange={set("fullName")} required minLength={2} /></Field>
              <Field label="Phone number" hint="South African mobile number, e.g. 082 123 4567">
                <Input type="tel" value={f.phone} onChange={set("phone")} required />
              </Field>
              <Field label="Email (optional)"><Input type="email" value={f.email} onChange={set("email")} /></Field>
              <Field label="City"><Input value={f.city} onChange={set("city")} required /></Field>
              {role === "driver" && (
                <Field label="Which platforms do you drive on?">
                  <PlatformPicker value={platforms} onChange={setPlatforms} />
                </Field>
              )}
              <Field label="Password" hint="At least 8 characters">
                <Input type="password" value={f.password} onChange={set("password")} required minLength={8} />
              </Field>
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                I agree to the Drive2Own terms and privacy policy, and understand that rental agreements are between the owner and the driver.
              </label>
              <Button type="submit" disabled={busy} className="w-full bg-[#00873a] hover:bg-[#006f2f]">
                {busy ? "Creating account…" : "Create account"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already registered? <Link to="/login" className="text-[#00873a] hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
