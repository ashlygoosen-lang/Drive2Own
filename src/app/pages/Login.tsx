import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Car } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00C853] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your Drive2Own account</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Use the phone number you registered with</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-lg bg-gray-50 text-sm">🇿🇦 +27</div>
                  <Input id="phone" type="tel" placeholder="82 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} required className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-[#00C853] hover:bg-[#00b84a]">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                New here? <Link to="/join" className="text-[#00873a] hover:underline font-medium">Join now</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
