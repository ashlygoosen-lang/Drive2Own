import { Link, Navigate } from "react-router";
import type { ReactNode } from "react";
import { Fuel, Heart, Settings2, Users } from "lucide-react";
import { useFavorites } from "../../lib/favorites";
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

const COLORS: Record<string, string> = {
  white: "#f4f4f2", silver: "#b9bec2", grey: "#7d868c", gray: "#7d868c", black: "#26292b", blue: "#2f5d9e",
  red: "#b3322f", green: "#2f7a4f", brown: "#7a5a43", beige: "#cdbfa3", gold: "#b99a4b", orange: "#d9732b", yellow: "#e2b72d",
};

/** Clean side-view car illustration, tinted to the vehicle's colour, shown until the owner uploads a photo. */
function CarArt({ color }: { color?: string }) {
  const fill = COLORS[(color ?? "").toLowerCase().trim()] ?? "#9aa7a0";
  return (
    <svg viewBox="0 0 200 100" className="w-3/4 max-w-[260px]" role="img" aria-label="Vehicle illustration">
      <ellipse cx="100" cy="92" rx="82" ry="4" fill="#0e3b2e" opacity="0.12" />
      <path d="M12 74 Q10 60 26 56 L54 52 Q68 30 92 28 L132 28 Q152 31 166 52 L184 56 Q192 59 192 70 L192 78 L12 78 Z" fill={fill} stroke="#0e3b2e" strokeOpacity="0.25" />
      <path d="M62 52 Q72 36 92 34 L108 34 L108 52 Z M114 34 L132 34 Q146 37 156 52 L114 52 Z" fill="#dfeee7" stroke="#0e3b2e" strokeOpacity="0.25" />
      <circle cx="54" cy="78" r="14" fill="#1b2a24" /><circle cx="54" cy="78" r="6" fill="#cfd8d3" />
      <circle cx="150" cy="78" r="14" fill="#1b2a24" /><circle cx="150" cy="78" r="6" fill="#cfd8d3" />
    </svg>
  );
}

export function VehicleImage({ src, className = "", color }: { src: string | null; className?: string; color?: string }) {
  const url = assetUrl(src);
  return url ? (
    <img src={url} alt="" className={`object-cover ${className}`} />
  ) : (
    <div className={`bg-gradient-to-b from-[#eaf3ee] to-[#d6e7de] flex items-center justify-center ${className}`}>
      <CarArt color={color} />
    </div>
  );
}

export function SaveButton({ id, className = "" }: { id: number; className?: string }) {
  const { has, toggle } = useFavorites();
  const saved = has(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved cars" : "Save this car"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      className={`w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center hover:scale-105 transition-transform ${className}`}
    >
      <Heart className={`w-5 h-5 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
    </button>
  );
}

export function VehicleCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-hidden>
      <div className="h-44 shimmer !rounded-none" />
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer w-2/3" />
        <div className="h-3 shimmer w-1/3" />
        <div className="h-3 shimmer w-1/2" />
      </div>
    </Card>
  );
}

export function VehicleCard({ v, row = false }: { v: Vehicle; row?: boolean }) {
  return (
    <Link to={`/vehicles/${v.id}`} className="group block h-full rounded-xl">
      <Card className={`lift overflow-hidden h-full relative ${row ? "sm:flex" : ""}`}>
        <SaveButton id={v.id} className="absolute top-3 right-3 z-10" />
        <div className={`img-zoom img-reveal ${row ? "w-full sm:w-64 h-44 shrink-0" : "w-full h-44"}`}><VehicleImage src={v.imageUrl} color={v.color} className="w-full h-full" /></div>
        <div className="p-4 space-y-3 flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold">{v.year} {v.make} {v.model}</h3>
              <p className="text-sm text-gray-500">{v.city} · {v.color}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-[#00873a] transition-transform duration-500 group-hover:scale-105 origin-right">{money(v.weeklyRate)}</div>
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
