import { Link, Navigate } from "react-router";
import type { ReactNode } from "react";
import { Car, Fuel, Settings2, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { assetUrl, money, platformLabel, type Role, type Vehicle } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function PlatformBadges({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((p) => (
        <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-[#00873a] border border-green-200">
          {platformLabel(p)}
        </span>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-700",
  available: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  hidden: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge className={`${STATUS_STYLES[status] ?? ""} capitalize border-0`}>{label ?? status}</Badge>;
}

export function VehicleImage({ src, className = "" }: { src: string | null; className?: string }) {
  const url = assetUrl(src);
  return url ? (
    <img src={url} alt="" className={`object-cover ${className}`} />
  ) : (
    <div className={`bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center ${className}`}>
      <Car className="w-12 h-12 text-[#00C853]/60" />
    </div>
  );
}

export function VehicleCard({ v }: { v: Vehicle }) {
  return (
    <Link to={`/vehicles/${v.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <VehicleImage src={v.imageUrl} className="w-full h-44" />
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold">{v.year} {v.make} {v.model}</h3>
              <p className="text-sm text-gray-500">{v.city} · {v.color}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-[#00873a]">{money(v.weeklyRate)}</div>
              <div className="text-xs text-gray-500">per week</div>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{v.seats}</span>
            <span className="flex items-center gap-1 capitalize"><Fuel className="w-3.5 h-3.5" />{v.fuel}</span>
            <span className="flex items-center gap-1 capitalize"><Settings2 className="w-3.5 h-3.5" />{v.transmission}</span>
          </div>
          <PlatformBadges platforms={v.platforms} />
        </div>
      </Card>
    </Link>
  );
}

export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00` : iso.replace(" ", "T") + "Z").toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  });
