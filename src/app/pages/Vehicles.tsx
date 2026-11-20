import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Input } from "../components/ui/input";
import { VehicleCard, VehicleCardSkeleton } from "../components/Common";
import { Field, selectClass } from "../components/Fields";
import { api, PLATFORMS, type Vehicle } from "../../lib/api";
import { useTitle } from "../../lib/useTitle";

const KEYS = ["q", "platform", "transmission", "fuel", "minSeats", "maxRate", "sort"] as const;

export function Vehicles() {
  useTitle("Find a car to rent");
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filters live in the URL, so a search can be bookmarked or shared.
  const get = (k: string) => params.get(k) ?? "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const active = KEYS.filter((k) => k !== "sort" && get(k)).length;
  const query = params.toString();

  useEffect(() => {
    const qs = new URLSearchParams();
    KEYS.forEach((k) => { const v = params.get(k); if (v) qs.set(k, v); });
    const t = setTimeout(() => {
      setVehicles(null);
      api<{ vehicles: Vehicle[] }>(`/vehicles?${qs}`)
        .then((r) => { setVehicles(r.vehicles); setError(""); })
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const chip = (on: boolean) =>
    `px-4 py-1.5 rounded-full border text-sm transition-colors ${on ? "bg-[#0e3b2e] border-[#0e3b2e] text-white" : "bg-white hover:border-[#0e3b2e]"}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold mb-1">Find a car to rent</h1>
        <p className="text-gray-600 mb-6">Cars available for Uber, inDrive and Bolt.</p>

        <div className="bg-white p-4 rounded-xl border mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button className={chip(!get("platform"))} onClick={() => set("platform", "")}>All platforms</button>
            {PLATFORMS.map((p) => (
              <button key={p.id} className={chip(get("platform") === p.id)} onClick={() => set("platform", get("platform") === p.id ? "" : p.id)}>{p.label}</button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} className="ml-auto inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border hover:border-[#0e3b2e] md:hidden">
              <SlidersHorizontal className="w-4 h-4" />Filters{active ? ` (${active})` : ""}
            </button>
          </div>
          <div className={`${showFilters ? "grid" : "hidden"} md:grid sm:grid-cols-2 lg:grid-cols-5 gap-4`}>
            <Field label="Search"><Input placeholder="Make or model" value={get("q")} onChange={(e) => set("q", e.target.value)} /></Field>
            <Field label="Transmission">
              <select className={selectClass} value={get("transmission")} onChange={(e) => set("transmission", e.target.value)}>
                <option value="">Any</option><option value="manual">Manual</option><option value="automatic">Automatic</option>
              </select>
            </Field>
            <Field label="Fuel">
              <select className={selectClass} value={get("fuel")} onChange={(e) => set("fuel", e.target.value)}>
                <option value="">Any</option>{["petrol", "diesel", "hybrid", "electric"].map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </Field>
            <Field label="Seats">
              <select className={selectClass} value={get("minSeats")} onChange={(e) => set("minSeats", e.target.value)}>
                <option value="">Any</option><option value="5">5 or more</option><option value="7">7 or more</option>
              </select>
            </Field>
            <Field label={`Max weekly rate${get("maxRate") ? `: R ${Number(get("maxRate")).toLocaleString("en-ZA")}` : ""}`}>
              <input type="range" min={1500} max={6000} step={100} value={get("maxRate") || 6000}
                onChange={(e) => set("maxRate", e.target.value === "6000" ? "" : e.target.value)} className="w-full accent-[#00873a]" />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-gray-600" aria-live="polite">
            {vehicles === null && !error ? "Searching…" : `${vehicles?.length ?? 0} ${vehicles?.length === 1 ? "car" : "cars"} found`}
            {active > 0 && <button className="ml-3 text-[#00873a] underline" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
          </p>
          <div className="flex items-center gap-3">
            <select aria-label="Sort" className={`${selectClass} !w-auto`} value={get("sort") || "newest"} onChange={(e) => set("sort", e.target.value === "newest" ? "" : e.target.value)}>
              <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select>
            <div className="hidden sm:flex rounded-lg border bg-white p-0.5">
              {([["grid", LayoutGrid], ["list", List]] as const).map(([m, Icon]) => (
                <button key={m} aria-label={`${m} view`} aria-pressed={view === m} onClick={() => setView(m)}
                  className={`p-2 rounded-md ${view === m ? "bg-[#0e3b2e] text-white" : "text-gray-600"}`}><Icon className="w-4 h-4" /></button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {vehicles?.length === 0 && (
          <div className="bg-white rounded-xl border p-10 text-center text-gray-600">
            No cars match these filters. Try removing one, or check back soon as new cars are listed regularly.
          </div>
        )}
        <div className={view === "list" ? "grid gap-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {vehicles === null && !error && [1, 2, 3, 4, 5, 6].map((i) => <VehicleCardSkeleton key={i} />)}
          {vehicles?.map((v) => <VehicleCard key={v.id} v={v} row={view === "list"} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
}
