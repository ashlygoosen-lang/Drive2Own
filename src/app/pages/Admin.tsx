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
                <Button variant="outline" size="sm" onClick={() => openDocument(d.id).catch((e) => toast.error(e.message))}>Open file</Button>
              </div>
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
