import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold mb-1">Saved cars</h1>
        <p className="text-gray-600 mb-6">Cars you've saved on this device.</p>
        {ids.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center space-y-3">
            <p className="text-gray-600">You haven't saved any cars yet. Tap the heart on a car to keep it here.</p>
            <Link to="/vehicles" className="inline-flex h-10 items-center px-5 rounded-lg bg-[#0e3b2e] text-white font-semibold">Browse cars</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles === null ? [1, 2, 3].map((i) => <VehicleCardSkeleton key={i} />) : vehicles.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
