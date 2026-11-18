import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { StatusBadge, VehicleImage, fmtDate } from "../components/Common";
import { api, money, openDocument, payOnline, platformLabel, type Doc, type Payment, type Rental, type Vehicle } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card><CardContent className="p-5"><div className="text-sm text-gray-500">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>
  );
}

function Payments({ rental, isOwner }: { rental: Rental; isOwner: boolean }) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [online, setOnline] = useState(false);
  useEffect(() => { api<{ onlinePayments: boolean }>("/meta").then((m) => setOnline(m.onlinePayments)).catch(() => {}); }, []);
  const load = useCallback(
    () => api<{ payments: Payment[] }>(`/rentals/${rental.id}/payments`).then((r) => setPayments(r.payments)).catch((e) => toast.error(msg(e))),
    [rental.id],
  );
  useEffect(() => { void load(); }, [load]);
  const markPaid = async (p: Payment) => {
    try { await api(`/rentals/${rental.id}/payments/${p.id}/paid`, { method: "POST" }); await load(); }
    catch (e) { toast.error(msg(e)); }
  };
  if (!payments) return <p className="text-sm text-gray-500">Loading payments…</p>;
  if (payments.length === 0) return <p className="text-sm text-gray-500">No payments scheduled yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500"><th className="py-1">Due</th><th>Type</th><th>Amount</th><th>Status</th><th /></tr></thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-2">{fmtDate(p.dueDate)}</td>
              <td className="capitalize">{p.kind}</td>
              <td>{money(p.amount)}</td>
              <td><StatusBadge status={p.status} /></td>
              <td className="text-right">
                {isOwner && (p.status === "pending" || p.status === "overdue") && (
                  <Button size="sm" variant="outline" onClick={() => markPaid(p)}>Mark paid</Button>
                )}
                {!isOwner && online && (p.status === "pending" || p.status === "overdue") && (
                  <Button size="sm" className="bg-[#00873a] hover:bg-[#006f2f]" onClick={() => payOnline(p.id).catch((e) => toast.error(msg(e)))}>Pay online</Button>
                )}
                {p.status === "paid" && p.paidVia === "payfast" && <span className="text-xs text-gray-500">via PayFast</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgreementPanel({ r, isOwner, reload }: { r: Rental; isOwner: boolean; reload: () => void }) {
  const [text, setText] = useState<string | null>(null);
  const [insured, setInsured] = useState(false);
  const [busy, setBusy] = useState(false);
  const a = r.agreement;
  const mine = isOwner ? a.ownerAccepted : a.driverAccepted;

  const toggle = async () => {
    if (text) return setText(null);
    try { setText((await api<{ text: string }>(`/rentals/${r.id}/agreement`)).text); } catch (e) { toast.error(msg(e)); }
  };
  const accept = async () => {
    setBusy(true);
    try {
      await api(`/rentals/${r.id}/agreement/accept`, { method: "POST", body: isOwner ? { insuranceConfirmed: insured } : {} });
      toast.success("Agreement accepted");
      reload();
    } catch (e) { toast.error(msg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="border-t pt-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">Rental agreement</span>
        <span className={a.ownerAccepted ? "text-green-700" : "text-gray-500"}>Owner: {a.ownerAccepted ? "accepted" : "waiting"}</span>
        <span className={a.driverAccepted ? "text-green-700" : "text-gray-500"}>Driver: {a.driverAccepted ? "accepted" : "waiting"}</span>
        <Button size="sm" variant="ghost" onClick={toggle}>{text ? "Hide" : "Read"} agreement</Button>
      </div>
      {text && <pre className="whitespace-pre-wrap text-xs bg-gray-50 border rounded p-3 max-h-72 overflow-y-auto font-sans">{text}</pre>}
      {r.status === "approved" && !mine && (
        <div className="space-y-2">
          {isOwner && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={insured} onChange={(e) => setInsured(e.target.checked)} />
              I confirm this vehicle is comprehensively insured and the policy covers e-hailing use.
            </label>
          )}
          <Button size="sm" disabled={busy || (isOwner && !insured)} className="bg-[#00873a] hover:bg-[#006f2f]" onClick={accept}>
            Accept agreement
          </Button>
        </div>
      )}
    </div>
  );
}

function RentalCard({ r, isOwner, reload }: { r: Rental; isOwner: boolean; reload: () => void }) {
  const [showPay, setShowPay] = useState(false);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const act = async (action: string, ok: string) => {
    try { await api(`/rentals/${r.id}/${action}`, { method: "POST" }); toast.success(ok); reload(); }
    catch (e) { toast.error(msg(e)); }
  };
  const loadDocs = async () => {
    try { setDocs((await api<{ documents: Doc[] }>(`/documents/driver/${r.driver.id}`)).documents); }
    catch (e) { toast.error(msg(e)); }
  };
  const other = isOwner ? r.driver : r.owner;
  const hasPayments = r.status === "active" || r.status === "completed";

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex gap-4">
          <VehicleImage src={r.vehicle.imageUrl} color={r.vehicle.color} className="w-24 h-20 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/vehicles/${r.vehicle.id}`} className="font-semibold hover:underline">{r.vehicle.year} {r.vehicle.make} {r.vehicle.model}</Link>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-gray-600">
              {isOwner ? "Driver" : "Owner"}: {other.name}{other.phone && ` · ${other.phone}`}
            </p>
            <p className="text-sm text-gray-600">
              {platformLabel(r.platform)} · from {fmtDate(r.startDate)} · {r.weeks} wk · {money(r.weeklyRate)}/wk
            </p>
            {r.message && <p className="text-sm text-gray-500 italic mt-1">“{r.message}”</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner && r.status === "pending" && (<>
            <Button size="sm" className="bg-[#00873a] hover:bg-[#006f2f]" onClick={() => act("approve", "Request approved")}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => act("decline", "Request declined")}>Decline</Button>
          </>)}
          {isOwner && r.status === "approved" && (<>
            <Button size="sm" disabled={!r.agreement.ownerAccepted || !r.agreement.driverAccepted} title={!r.agreement.ownerAccepted || !r.agreement.driverAccepted ? "Both parties must accept the agreement first" : undefined} className="bg-[#00873a] hover:bg-[#006f2f]" onClick={() => act("activate", "Vehicle handed over — payments scheduled")}>Hand over vehicle</Button>
            <Button size="sm" variant="outline" onClick={() => act("decline", "Request declined")}>Withdraw approval</Button>
          </>)}
          {isOwner && r.status === "active" && (
            <Button size="sm" variant="outline" onClick={() => act("complete", "Rental completed")}>Mark returned / complete</Button>
          )}
          {!isOwner && (r.status === "pending" || r.status === "approved") && (
            <Button size="sm" variant="outline" onClick={() => act("cancel", "Request cancelled")}>Cancel request</Button>
          )}
          {isOwner && ["pending", "approved", "active"].includes(r.status) && (
            <Button size="sm" variant="ghost" onClick={loadDocs}>Review driver documents</Button>
          )}
          {hasPayments && <Button size="sm" variant="ghost" onClick={() => setShowPay(!showPay)}>{showPay ? "Hide" : "View"} payments</Button>}
        </div>

        {r.agreement.exists && ["approved", "active", "completed"].includes(r.status) && <AgreementPanel r={r} isOwner={isOwner} reload={reload} />}

        {docs && (
          <div className="text-sm space-y-1 border-t pt-3">
            {docs.length === 0 && <p className="text-gray-500">The driver hasn't uploaded any documents.</p>}
            {docs.map((d) => (
              <button key={d.id} className="block text-[#00873a] hover:underline" onClick={() => openDocument(d.id).catch((e) => toast.error(msg(e)))}>
                {d.type.replace(/_/g, " ")} — {d.name} ({d.status === "uploaded" ? "not yet verified" : d.status})
              </button>
            ))}
          </div>
        )}
        {showPay && <div className="border-t pt-3"><Payments rental={r} isOwner={isOwner} /></div>}
      </CardContent>
    </Card>
  );
}

function RentalList({ rentals, isOwner, reload }: { rentals: Rental[]; isOwner: boolean; reload: () => void }) {
  if (rentals.length === 0) return <p className="text-gray-500">Nothing here yet.</p>;
  return <div className="space-y-4">{rentals.map((r) => <RentalCard key={r.id} r={r} isOwner={isOwner} reload={reload} />)}</div>;
}

export function Dashboard() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [tab, setTab] = useState<"rentals" | "vehicles">("rentals");

  const load = useCallback(async () => {
    try {
      const r = await api<{ rentals: Rental[] }>("/rentals");
      setRentals(r.rentals);
      if (isOwner) setVehicles((await api<{ vehicles: Vehicle[] }>("/vehicles/mine")).vehicles);
      else setDocCount((await api<{ documents: Doc[] }>("/documents")).documents.filter((d) => ["id_document", "drivers_license", "prdp"].includes(d.type)).length);
    } catch (e) { toast.error(msg(e)); }
  }, [isOwner]);
  useEffect(() => { void load(); }, [load]);

  const toggleHidden = async (v: Vehicle) => {
    try { await api(`/vehicles/${v.id}/visibility`, { method: "PATCH", body: { hidden: v.status !== "hidden" } }); await load(); }
    catch (e) { toast.error(msg(e)); }
  };
  const remove = async (v: Vehicle) => {
    if (!confirm(`Delete ${v.make} ${v.model}? This cannot be undone.`)) return;
    try { await api(`/vehicles/${v.id}`, { method: "DELETE" }); await load(); }
    catch (e) { toast.error(msg(e)); }
  };

  const pending = rentals.filter((r) => r.status === "pending").length;
  const active = rentals.filter((r) => r.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Hi {user?.fullName.split(" ")[0]}</h1>
            <p className="text-gray-600">{isOwner ? "Manage your vehicles and rental requests." : "Track your rental requests and weekly payments."}</p>
          </div>
          {isOwner
            ? <Link to="/vehicles/new"><Button className="bg-[#00873a] hover:bg-[#006f2f]">List a vehicle</Button></Link>
            : <Link to="/vehicles"><Button className="bg-[#00873a] hover:bg-[#006f2f]">Find a vehicle</Button></Link>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isOwner ? (<>
            <Stat label="Vehicles listed" value={vehicles.length} />
            <Stat label="Pending requests" value={pending} />
            <Stat label="Active rentals" value={active} />
            <Stat label="Weekly income (active)" value={money(rentals.filter((r) => r.status === "active").reduce((s, r) => s + r.weeklyRate, 0))} />
          </>) : (<>
            <Stat label="Pending requests" value={pending} />
            <Stat label="Active rental" value={active ? "Yes" : "No"} />
            <Stat label="Required documents" value={`${docCount} / 3`} />
            <Stat label="Total requests" value={rentals.length} />
          </>)}
        </div>

        {!isOwner && docCount < 3 && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Upload your ID, driver's licence and PrDP to start requesting vehicles.</span>
              <Link to="/documents"><Button size="sm" className="bg-[#00873a] hover:bg-[#006f2f]">Upload documents</Button></Link>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <div className="flex gap-2 border-b">
            {(["rentals", "vehicles"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 -mb-px border-b-2 capitalize ${tab === t ? "border-[#00873a] text-[#00873a] font-medium" : "border-transparent text-gray-600"}`}>
                {t === "rentals" ? `Requests & rentals${pending ? ` (${pending})` : ""}` : "My vehicles"}
              </button>
            ))}
          </div>
        )}

        {(!isOwner || tab === "rentals") && (
          <section className="space-y-3">
            {!isOwner && <h2 className="text-xl font-semibold">My rentals</h2>}
            <RentalList rentals={rentals} isOwner={isOwner} reload={load} />
          </section>
        )}

        {isOwner && tab === "vehicles" && (
          <section className="space-y-4">
            {vehicles.length === 0 && <p className="text-gray-500">You haven't listed a vehicle yet.</p>}
            {vehicles.map((v) => (
              <Card key={v.id}>
                <CardContent className="p-5 flex flex-wrap gap-4 items-center">
                  <VehicleImage src={v.imageUrl} className="w-24 h-20 rounded-lg" />
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2"><span className="font-semibold">{v.year} {v.make} {v.model}</span><StatusBadge status={v.status} /></div>
                    <p className="text-sm text-gray-600">{v.plate} · {money(v.weeklyRate)}/wk · deposit {money(v.deposit)}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/vehicles/${v.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                    {v.status !== "rented" && <Button size="sm" variant="outline" onClick={() => toggleHidden(v)}>{v.status === "hidden" ? "Show listing" : "Hide listing"}</Button>}
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(v)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
