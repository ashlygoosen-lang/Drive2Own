import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { CarFront, FileSearch, KeyRound, ShieldCheck, Users } from "lucide-react";
import { EmptyState, PageHero, PageShell, StatCard } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { StatusBadge, fmtDate } from "../components/Common";
import { api, openDocument } from "../../lib/api";
import { useAuth } from "../../lib/auth";

interface AdminDoc {
  id: number; type: string; name: string; status: string; note: string | null; uploadedAt: string;
  user: { id: number; name: string; phone: string; role: string };
}
interface Stats { owners: number; drivers: number; vehicles: number; activeRentals: number; documentsToReview: number }

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<"uploaded" | "verified" | "rejected">("uploaded");
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [profiles, setProfiles] = useState<Record<number, Record<string, unknown> | null | "loading">>({});
  const toggleProfile = async (userId: number) => {
    if (profiles[userId] !== undefined) { const { [userId]: _, ...rest } = profiles; setProfiles(rest); return; }
    setProfiles({ ...profiles, [userId]: "loading" });
    try { const r = await api<{ profile: Record<string, unknown> | null }>(`/admin/users/${userId}/profile`); setProfiles((cur) => ({ ...cur, [userId]: r.profile })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not load profile"); }
  };

  const load = useCallback(async () => {
    try {
      setStats(await api<Stats>("/admin/stats"));
      setDocs((await api<{ documents: AdminDoc[] }>(`/admin/documents?status=${filter}`)).documents);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not load"); }
  }, [filter]);
  useEffect(() => { if (user?.isAdmin) void load(); }, [load, user?.isAdmin]);

  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;

  const review = async (id: number, status: "verified" | "rejected") => {
    try {
      await api(`/admin/documents/${id}/review`, { method: "POST", body: { status, note: notes[id] } });
      toast.success(status === "verified" ? "Document verified" : "Document rejected");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save"); }
  };

  return (
    <PageShell cta={false} hero={<PageHero compact eyebrow="Administration" title="Admin" subtitle="Platform overview and driver document verification." />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {stats && (
          <div className="relative -mt-8 cascade grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={KeyRound} label="Owners" value={stats.owners} />
            <StatCard icon={Users} label="Drivers" value={stats.drivers} />
            <StatCard icon={CarFront} label="Cars" value={stats.vehicles} />
            <StatCard icon={ShieldCheck} label="Active rentals" value={stats.activeRentals} />
            <StatCard icon={FileSearch} label="Docs to review" value={stats.documentsToReview} tone={stats.documentsToReview ? "alert" : "default"} />
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {(["uploaded", "verified", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full border text-sm font-medium capitalize transition-all ${filter === s ? "bg-[#0e3b2e] border-[#0e3b2e] text-white" : "bg-white border-[#d5e2da] text-gray-700 hover:border-[#0e3b2e]"}`}>
              {s === "uploaded" ? "To review" : s}
            </button>
          ))}
        </div>
        {docs.length === 0 && <EmptyState icon={FileSearch} title="Nothing in this list" text="Documents appear here as drivers and owners upload them." />}
        {docs.map((d) => (
          <Card key={d.id} className="lift">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-medium capitalize">{d.type.replace(/_/g, " ")} <StatusBadge status={d.status === "uploaded" ? "pending" : d.status === "verified" ? "paid" : "declined"} label={d.status === "uploaded" ? "to review" : d.status} /></div>
                  <div className="text-sm text-gray-600">{d.user.name} ({d.user.role}) · {d.user.phone} · {fmtDate(d.uploadedAt)}</div>
                  {d.note && <div className="text-sm text-gray-500">Note: {d.note}</div>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleProfile(d.user.id)}>{profiles[d.user.id] !== undefined ? "Hide profile" : "View member profile"}</Button>
                  <Button variant="outline" size="sm" onClick={() => openDocument(d.id).catch((e) => toast.error(e.message))}>Open file</Button>
                </div>
              </div>
              {profiles[d.user.id] !== undefined && docs.findIndex((x) => x.user.id === d.user.id) === docs.indexOf(d) && <ProfilePanel profile={profiles[d.user.id]!} />}
              {filter !== "verified" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-[#00873a] hover:bg-[#006f2f]" onClick={() => review(d.id, "verified")}>Verify</Button>
                  <Input className="flex-1 min-w-[200px] h-8" placeholder="Reason (required to reject)" value={notes[d.id] ?? ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} />
                  <Button size="sm" variant="outline" onClick={() => review(d.id, "rejected")}>Reject</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

const LABELS: [string, string][] = [
  ["id_type", "ID type"], ["id_number", "ID / passport number"], ["date_of_birth", "Date of birth"], ["nationality", "Nationality"],
  ["work_permit_number", "Work permit"], ["address_line1", "Address"], ["address_line2", "Address line 2"], ["suburb", "Suburb"],
  ["city", "City"], ["province", "Province"], ["postal_code", "Postal code"], ["employment_status", "Employment"],
  ["income_source", "Income source"], ["income_source_other", "Other income"], ["monthly_income_band", "Monthly income"],
  ["years_driving", "Years licensed"], ["company_name", "Company"], ["company_reg_number", "Company reg."], ["tax_number", "Tax number"],
  ["source_of_funds", "Source of funds"], ["is_pep", "Public official (PEP)"], ["pep_details", "PEP details"],
  ["legal_version", "Terms version accepted"], ["accepted_at", "Declarations accepted"],
];

function ProfilePanel({ profile }: { profile: Record<string, unknown> | null | "loading" }) {
  if (profile === "loading") return <div className="shimmer h-24 !rounded-xl" />;
  if (!profile) return <p className="text-sm rounded-xl bg-amber-50 border border-amber-200 p-3">This member has not completed a verification profile yet.</p>;
  const BANDS: Record<string, string> = { under_5000: "Under R5 000", "5000_10000": "R5 000 – R10 000", "10000_20000": "R10 000 – R20 000", "20000_35000": "R20 000 – R35 000", "35000_50000": "R35 000 – R50 000", over_50000: "Over R50 000" };
  const fmt = (k: string, v: unknown) => k === "is_pep" ? (v ? "Yes" : "No") : k === "monthly_income_band" ? BANDS[String(v)] ?? String(v) : k === "id_type" ? (v === "sa_id" ? "South African ID" : "Passport") : String(v).replace(/_/g, " ");
  return (
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-[#f6f9f7] border border-[#e3ebe6] p-4 text-sm">
      {LABELS.filter(([k]) => profile[k] !== null && profile[k] !== undefined && profile[k] !== "").map(([k, l]) => (
        <div key={k} className={k === "source_of_funds" || k === "pep_details" ? "sm:col-span-2" : ""}>
          <dt className="text-xs text-gray-500">{l}</dt>
          <dd className={`font-medium capitalize-first ${k === "is_pep" && profile[k] ? "text-red-600" : ""}`}>{fmt(k, profile[k])}</dd>
        </div>
      ))}
    </dl>
  );
}
