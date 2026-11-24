import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";
import { EmptyState, PageHero, PageShell } from "../components/Layout";
import { VehicleCard, VehicleCardSkeleton } from "../components/Common";
import { api, type Vehicle } from "../../lib/api";
import { useFavorites } from "../../lib/favorites";
import { useTitle } from "../../lib/useTitle";

export function Saved() {
  useTitle("Saved cars");
  const { ids } = useFavorites();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled(ids.map((id) => api<{ vehicle: Vehicle }>(`/vehicles/${id}`))).then((res) => {
      if (!alive) return;
      setVehicles(res.flatMap((r) => (r.status === "fulfilled" ? [r.value.vehicle] : [])));
    });
    return () => { alive = false; };
  }, [ids]);

  return (
    <PageShell hero={
      <PageHero compact eyebrow="Shortlist" crumbs={[{ label: "Saved cars" }]} title="Saved cars" subtitle="Cars you've saved on this device, ready to compare." />
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        {ids.length === 0 ? (
          <EmptyState icon={Heart} title="No saved cars yet" text="Tap the heart on any car to keep it here while you compare."
            action={<Link to="/vehicles" className="inline-flex h-10 items-center px-5 rounded-lg bg-[#0e3b2e] text-white font-semibold">Browse cars</Link>} />
        ) : (
          <div className="cascade grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles === null ? [1, 2, 3].map((i) => <VehicleCardSkeleton key={i} />) : vehicles.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
