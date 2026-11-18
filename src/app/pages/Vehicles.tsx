import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Input } from "../components/ui/input";
import { VehicleCard } from "../components/Common";
import { Field, selectClass } from "../components/Fields";
import { api, PLATFORMS, type Vehicle } from "../../lib/api";

export function Vehicles() {
  const [filters, setFilters] = useState({ q: "", platform: "", maxRate: "", sort: "newest" });
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));
    const t = setTimeout(() => {
      api<{ vehicles: Vehicle[] }>(`/vehicles?${qs}`)
        .then((r) => { setVehicles(r.vehicles); setError(""); })
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k: keyof typeof filters, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-1">Find a vehicle</h1>
        <p className="text-gray-600 mb-6">Cars available to rent for Uber, inDrive and Bolt.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg border mb-8">
          <Field label="Search"><Input placeholder="Make or model" value={filters.q} onChange={(e) => set("q", e.target.value)} /></Field>
          <Field label="Platform">
            <select className={selectClass} value={filters.platform} onChange={(e) => set("platform", e.target.value)}>
              <option value="">Any platform</option>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Max weekly rate (R)">
            <Input type="number" min={0} placeholder="e.g. 3000" value={filters.maxRate} onChange={(e) => set("maxRate", e.target.value)} />
          </Field>
          <Field label="Sort by">
            <select className={selectClass} value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </Field>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {vehicles === null && !error && <p className="text-gray-500">Loading vehicles…</p>}
        {vehicles?.length === 0 && <p className="text-gray-500">No vehicles match your filters.</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles?.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
      </div>
    </div>
  );
}
