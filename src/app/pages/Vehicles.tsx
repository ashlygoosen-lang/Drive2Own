import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CarFront, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyState, PageHero, PageShell } from "../components/Layout";
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
    `px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${on ? "bg-[#0e3b2e] border-[#0e3b2e] text-white shadow-[0_8px_18px_-12px_rgba(14,59,46,0.9)]" : "bg-white border-[#d5e2da] hover:border-[#0e3b2e]"}`;

  return (
    <PageShell hero={
      <PageHero eyebrow="Rental marketplace" crumbs={[{ label: "Rent a car" }]}
        title={<>Find a car to <span className="text-[#ffc72c]">rent this week</span></>}
        subtitle="Cars from verified owners, approved for Uber, Bolt and inDrive. Weekly rate and deposit shown up front." />
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative -mt-8 bg-white p-5 rounded-2xl border border-[#e3ebe6] mb-8 space-y-5 shadow-[0_24px_48px_-32px_rgba(14,59,46,0.45)]">
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
            <Field label="Search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Make or model" value={get("q")} onChange={(e) => set("q", e.target.value)} className="pl-9" />
              </div>
            </Field>
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
          <p className="text-sm text-gray-600 font-medium" aria-live="polite">
            {vehicles === null && !error ? "Searching…" : `${vehicles?.length ?? 0} ${vehicles?.length === 1 ? "car" : "cars"} found`}
            {active > 0 && <button className="ml-3 inline-flex items-center gap-1 text-[#00873a] font-medium hover:underline" onClick={() => setParams({}, { replace: true })}><X className="w-3.5 h-3.5" />Clear filters</button>}
          </p>
          <div className="flex items-center gap-3">
            <select aria-label="Sort" className={`${selectClass} !w-auto`} value={get("sort") || "newest"} onChange={(e) => set("sort", e.target.value === "newest" ? "" : e.target.value)}>
              <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select>
            <div className="hidden sm:flex rounded-lg border border-[#d5e2da] bg-white p-1">
              {([["grid", LayoutGrid], ["list", List]] as const).map(([m, Icon]) => (
                <button key={m} aria-label={`${m} view`} aria-pressed={view === m} onClick={() => setView(m)}
                  className={`p-2 rounded-md ${view === m ? "bg-[#0e3b2e] text-white" : "text-gray-600"}`}><Icon className="w-4 h-4" /></button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {vehicles?.length === 0 && (
          <EmptyState icon={CarFront} title="No cars match these filters"
            text="Try removing a filter, or check back soon. New cars are listed regularly."
            action={active > 0 ? <button onClick={() => setParams({}, { replace: true })} className="inline-flex h-10 items-center px-5 rounded-lg bg-[#0e3b2e] text-white font-semibold">Clear filters</button> : undefined} />
        )}
        <div key={`${view}-${vehicles?.length ?? "l"}`} className={`cascade ${view === "list" ? "grid gap-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
          {vehicles === null && !error && [1, 2, 3, 4, 5, 6].map((i) => <VehicleCardSkeleton key={i} />)}
          {vehicles?.map((v) => <VehicleCard key={v.id} v={v} row={view === "list"} />)}
        </div>
      </div>
    </PageShell>
  );
}
