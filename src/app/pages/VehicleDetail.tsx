import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PlatformBadges, SaveButton, StatusBadge, VehicleCard, VehicleImage } from "../components/Common";
import { DriverCalculator } from "../components/Calculator";
import { useTitle } from "../../lib/useTitle";
import { Link2, ShieldCheck } from "lucide-react";
import { Field, selectClass } from "../components/Fields";
import { api, money, platformLabel, type Vehicle } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function VehicleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState<Vehicle | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const [form, setForm] = useState({ platform: "", startDate: tomorrow, weeks: 4, message: "" });
  const [related, setRelated] = useState<Vehicle[]>([]);
  useTitle(v ? `${v.year} ${v.make} ${v.model} for rent in ${v.city}` : undefined);

  useEffect(() => {
    api<{ vehicle: Vehicle }>(`/vehicles/${id}`)
      .then((r) => { setV(r.vehicle); setForm((f) => ({ ...f, platform: r.vehicle.platforms[0] ?? "" })); })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!v) return;
    api<{ vehicles: Vehicle[] }>(`/vehicles?limit=5&platform=${v.platforms[0]}`)
      .then((r) => setRelated(r.vehicles.filter((x) => x.id !== v.id).slice(0, 3)))
      .catch(() => {});
  }, [v?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch { /* cancelled */ }
  };

  if (error) return <div className="min-h-screen"><Header /><p className="p-12 text-center text-gray-600">{error}</p></div>;
  if (!v) return <div className="min-h-screen"><Header /><p className="p-12 text-center text-gray-500">Loading…</p></div>;

  const total = v.weeklyRate * form.weeks;
  const isOwner = user?.id === v.ownerId;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/rentals", { method: "POST", body: { vehicleId: v.id, ...form, weeks: Number(form.weeks) } });
      toast.success("Request sent! The owner will review it.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <VehicleImage src={v.imageUrl} color={v.color} className="w-full h-72 md:h-96 rounded-xl" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={share} aria-label="Share this car" className="w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center"><Link2 className="w-5 h-5 text-gray-600" /></button>
              <SaveButton id={v.id} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{v.year} {v.make} {v.model}</h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="text-gray-600 mt-1">{v.city} · Listed by {v.ownerName}</p>
          </div>
          <PlatformBadges platforms={v.platforms} />
          <Card>
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[["Colour", v.color], ["Seats", v.seats], ["Fuel", v.fuel], ["Transmission", v.transmission]].map(([k, val]) => (
                <div key={k}><div className="text-gray-500">{k}</div><div className="font-medium capitalize">{val}</div></div>
              ))}
            </CardContent>
          </Card>
          {v.description && (
            <div><h2 className="font-semibold mb-2">About this vehicle</h2><p className="text-gray-700 whitespace-pre-line">{v.description}</p></div>
          )}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#00873a]" />What you'll need to rent this car</h2>
              <ul className="text-sm text-gray-700 grid sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5">
                <li>SA ID or passport</li><li>Valid driver's licence</li><li>Professional Driving Permit (PrDP)</li>
                <li>An approved {v.platforms.map(platformLabel).join(" / ")} driver account</li>
              </ul>
              <p className="text-xs text-gray-500">The owner reviews your request and documents, then you both accept a written rental agreement before handover.</p>
            </CardContent>
          </Card>
          {user?.role !== "owner" && (
            <div>
              <h2 className="font-semibold mb-1">Estimate your weekly earnings</h2>
              <p className="text-sm text-gray-600 mb-4">Try your own numbers to see whether this car's rent works for you.</p>
              <Card><CardContent className="p-6"><DriverCalculator weeklyRent={v.weeklyRate} /></CardContent></Card>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4">Similar cars</h2>
              <div className="cascade grid sm:grid-cols-3 gap-4">{related.map((r) => <VehicleCard key={r.id} v={r} />)}</div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>
                <span className="text-2xl text-[#00873a]">{money(v.weeklyRate)}</span>
                <span className="text-sm text-gray-500 font-normal"> / week</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Deposit: {v.deposit ? money(v.deposit) : "None"}</p>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">This is your listing.</p>
                  <Link to={`/vehicles/${v.id}/edit`}><Button variant="outline" className="w-full">Edit listing</Button></Link>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Sign in as a driver to request this vehicle.</p>
                  <Link to="/join?role=driver"><Button className="w-full bg-[#00873a] hover:bg-[#006f2f]">Sign up</Button></Link>
                  <Link to="/login"><Button variant="outline" className="w-full">Login</Button></Link>
                </div>
              ) : user.role === "owner" ? (
                <p className="text-sm text-gray-600">Only driver accounts can request vehicles.</p>
              ) : v.status !== "available" ? (
                <p className="text-sm text-gray-600">This vehicle is not available right now.</p>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Field label="Platform you'll drive on">
                    <select className={selectClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                      {v.platforms.map((p) => <option key={p} value={p}>{platformLabel(p)}</option>)}
                    </select>
                  </Field>
                  <Field label="Start date">
                    <Input type="date" min={tomorrow} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </Field>
                  <Field label="Rental length (weeks)">
                    <Input type="number" min={1} max={52} value={form.weeks} onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })} required />
                  </Field>
                  <Field label="Message to owner (optional)">
                    <Textarea rows={3} maxLength={500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </Field>
                  <div className="border-t pt-3 text-sm space-y-1">
                    <div className="flex justify-between"><span>Rental ({form.weeks} wk)</span><span>{money(total)}</span></div>
                    <div className="flex justify-between"><span>Deposit</span><span>{money(v.deposit)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Total due over the rental</span><span>{money(total + v.deposit)}</span></div>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full bg-[#00873a] hover:bg-[#006f2f]">
                    {busy ? "Sending…" : "Request this vehicle"}
                  </Button>
                  <p className="text-xs text-gray-500">You pay the owner directly. The owner confirms each payment in Drive2Own.</p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
