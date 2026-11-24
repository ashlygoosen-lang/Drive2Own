import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BellOff, BellRing } from "lucide-react";
import { EmptyState, PageHero, PageShell } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";
import { Card } from "../components/ui/card";
import { fmtDate } from "../components/Common";
import { api, type AppNotification } from "../../lib/api";

export function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  useTitle("Notifications");
  const load = useCallback(() => api<{ notifications: AppNotification[] }>("/notifications").then((r) => setItems(r.notifications)).catch(() => setItems([])), []);
  useEffect(() => { void load(); }, [load]);

  const open = async (n: AppNotification) => {
    if (!n.read) await api(`/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
    if (n.link) navigate(n.link); else void load();
  };
  const readAll = async () => { await api("/notifications/read-all", { method: "POST" }); await load(); };

  return (
    <PageShell cta={false} hero={
      <PageHero compact eyebrow="Inbox" crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Notifications" }]} title="Notifications"
        subtitle="Request updates, agreements and payment reminders."
        actions={items?.some((n) => !n.read) ? <button onClick={readAll} className="btn-ghost-premium inline-flex items-center h-11 px-5 rounded-lg border border-white/35 font-semibold hover:bg-white/10">Mark all as read</button> : undefined} />
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16"><div className="max-w-3xl space-y-3">
        {items === null && [1, 2, 3].map((i) => <div key={i} className="shimmer h-20 !rounded-2xl" />)}
        {items?.length === 0 && <EmptyState icon={BellOff} title="You're all caught up" text="We'll let you know here when something needs your attention." />}
        <div className="cascade space-y-3">
        {items?.map((n) => (
          <Card key={n.id} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(n)} onClick={() => open(n)} className={`lift p-4 cursor-pointer ${n.read ? "" : "border-[#9fd3b5] bg-[#f3faf6]"}`}>
            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? "bg-gray-100 text-gray-400" : "bg-[#00873a] text-white"}`}><BellRing className="w-4 h-4" /></span>
                <div>
                <div className={n.read ? "" : "font-semibold"}>{n.title}</div>
                {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
                </div>
              </div>
              <div className="text-xs text-gray-400 shrink-0">{fmtDate(n.createdAt)}</div>
            </div>
          </Card>
        ))}
        </div>
      </div></div>
    </PageShell>
  );
}
