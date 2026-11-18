import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { fmtDate } from "../components/Common";
import { api, type AppNotification } from "../../lib/api";

export function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const load = useCallback(() => api<{ notifications: AppNotification[] }>("/notifications").then((r) => setItems(r.notifications)).catch(() => setItems([])), []);
  useEffect(() => { void load(); }, [load]);

  const open = async (n: AppNotification) => {
    if (!n.read) await api(`/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
    if (n.link) navigate(n.link); else void load();
  };
  const readAll = async () => { await api("/notifications/read-all", { method: "POST" }); await load(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {items?.some((n) => !n.read) && <Button variant="outline" size="sm" onClick={readAll}>Mark all read</Button>}
        </div>
        {items === null && <p className="text-gray-500">Loading…</p>}
        {items?.length === 0 && <p className="text-gray-500">You're all caught up.</p>}
        {items?.map((n) => (
          <Card key={n.id} onClick={() => open(n)} className={`p-4 cursor-pointer hover:shadow ${n.read ? "" : "border-[#00C853] bg-green-50/50"}`}>
            <div className="flex justify-between gap-3">
              <div>
                <div className={n.read ? "" : "font-semibold"}>{n.title}</div>
                {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
              </div>
              <div className="text-xs text-gray-400 shrink-0">{fmtDate(n.createdAt)}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
