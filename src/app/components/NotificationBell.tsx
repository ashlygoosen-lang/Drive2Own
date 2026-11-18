import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell } from "lucide-react";
import { api } from "../../lib/api";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    const poll = () => api<{ unread: number }>("/notifications").then((r) => alive && setUnread(r.unread)).catch(() => {});
    void poll();
    const t = setInterval(poll, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return (
    <Link to="/notifications" className="relative p-1 text-gray-700 hover:text-[#00873a]" aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}>
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">{unread > 9 ? "9+" : unread}</span>
      )}
    </Link>
  );
}
