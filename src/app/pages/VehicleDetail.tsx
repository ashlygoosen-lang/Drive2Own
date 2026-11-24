import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { PageShell } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PlatformBadges, SaveButton, StatusBadge, VehicleCard, VehicleImage } from "../components/Common";
import { DriverCalculator } from "../components/Calculator";
import { useTitle } from "../../lib/useTitle";
import { BadgeCheck, ChevronRight, Fuel, Link2, MapPin, Palette, Settings2, ShieldCheck, Users, FileSignature, ReceiptText } from "lucide-react";
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

  if (error) return <PageShell><div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4"><h1 className="font-display text-2xl font-bold">We couldn't load this car</h1><p className="text-gray-600">{error}</p><Link to="/vehicles" className="inline-flex h-11 items-center px-6 rounded-lg bg-[#0e3b2e] text-white font-semibold">Browse all cars</Link></div></PageShell>;
  if (!v) return (
    <div className="min-h-screen bg-[#f6f9f7]"><Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8" aria-label="Loading">
        <div className="lg:col-span-2 space-y-5"><div className="shimmer h-80 !rounded-3xl" /><div className="shimmer h-8 w-2/3" /><div className="shimmer h-24 !rounded-2xl" /></div>
        <div className="shimmer h-96 !rounded-2xl" />
      </div>
    </div>
  );

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
    <PageShell>
      <div className="border-b border-[#e3ebe6] bg-white">
        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#0e3b2e]">Home</Link><ChevronRight className="w-3.5 h-3.5" />
          <Link to="/vehicles" className="hover:text-[#0e3b2e]">Rent a car</Link><ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#10201a] font-medium truncate">{v.year} {v.make} {v.model}</span>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10 grid lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="enter-card relative overflow-hidden rounded-3xl border border-[#e3ebe6] shadow-[0_30px_60px_-40px_rgba(14,59,46,0.5)]">
            <VehicleImage src={v.imageUrl} color={v.color} className="w-full h-72 md:h-[26rem]" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={share} aria-label="Share this car" className="w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center hover:scale-105 transition-transform"><Link2 className="w-5 h-5 text-gray-600" /></button>
              <SaveButton id={v.id} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold">{v.year} {v.make} {v.model}</h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="flex items-center gap-1.5 text-gray-600"><MapPin className="w-4 h-4 text-[#00873a]" />{v.city} · Listed by {v.ownerName}</p>
            <PlatformBadges platforms={v.platforms} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([[Palette, "Colour", v.color], [Users, "Seats", v.seats], [Fuel, "Fuel", v.fuel], [Settings2, "Transmission", v.transmission]] as const).map(([Icon, k, val]) => (
              <div key={k} className="rounded-2xl border border-[#e3ebe6] bg-white p-4">
                <Icon className="w-5 h-5 text-[#00873a] mb-2" />
                <div className="text-xs text-gray-500">{k}</div>
                <div className="font-semibold capitalize">{val}</div>
              </div>
            ))}
          </div>
          {v.description && (
            <div><h2 className="font-display text-xl font-bold mb-2">About this car</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{v.description}</p></div>
          )}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#00873a]" />What you'll need to rent this car</h2>
              <ul className="text-sm text-gray-700 grid sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5">
                <li>SA ID or passport</li><li>Valid driver's licence</li><li>Professional Driving Permit (PrDP)</li>
                <li>An approved {v.platforms.map(platformLabel).join(" / ")} driver account</li>
              </ul>
              <p className="text-xs text-gray-500">The owner reviews your request and documents, then you both accept a written rental agreement before handover.</p>
            </CardContent>
          </Card>
          {user?.role !== "owner" && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Estimate your weekly earnings</h2>
              <p className="text-sm text-gray-600 mb-4">Try your own numbers to see whether this car's rent works for you.</p>
              <Card><CardContent className="p-6"><DriverCalculator weeklyRent={v.weeklyRate} /></CardContent></Card>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Similar cars</h2>
              <div className="cascade grid sm:grid-cols-3 gap-4">{related.map((r) => <VehicleCard key={r.id} v={r} />)}</div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 space-y-4">
          <Card className="overflow-hidden gap-0">
            <CardHeader className="bg-[#0e3b2e] text-white pb-6">
              <div className="text-xs uppercase tracking-[0.18em] text-[#ffc72c] font-semibold">Weekly rate</div>
              <CardTitle>
                <span className="font-display text-4xl font-extrabold">{money(v.weeklyRate)}</span>
                <span className="text-sm text-green-50/70 font-normal"> / week</span>
              </CardTitle>
              <p className="text-sm text-green-50/80">Refundable deposit: {v.deposit ? money(v.deposit) : "None"}</p>
            </CardHeader>
            <div className="h-6" />
            <CardContent>
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">This is your listing.</p>
                  <Link to={`/vehicles/${v.id}/edit`}><Button variant="outline" className="w-full">Edit listing</Button></Link>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Sign in as a driver to request this vehicle.</p>
                  <Link to="/join?role=driver" className="block"><Button size="lg" className="btn-premium w-full">Create a driver account</Button></Link>
                  <Link to="/login" className="block"><Button variant="outline" size="lg" className="w-full">Sign in</Button></Link>
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
                  <Button type="submit" size="lg" disabled={busy} className="btn-premium w-full">
                    {busy ? "Sending…" : "Request this car"}
                  </Button>
                  <p className="text-xs text-gray-500">You pay the owner directly. The owner confirms each payment in Drive2Own.</p>
                </form>
              )}
            </CardContent>
          </Card>
          <ul className="rounded-2xl border border-[#e3ebe6] bg-white p-5 space-y-3 text-sm">
            {([[BadgeCheck, "Owner reviews your verified documents"], [FileSignature, "Written agreement before handover"], [ReceiptText, "Every payment recorded"]] as const).map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3 text-gray-700"><Icon className="w-4 h-4 text-[#00873a] shrink-0" />{t}</li>
            ))}
          </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
