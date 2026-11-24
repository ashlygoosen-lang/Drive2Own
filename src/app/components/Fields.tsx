import type { ReactNode } from "react";
import { Label } from "./ui/label";
import { PLATFORMS, type Platform } from "../../lib/api";

export const selectClass =
  "w-full h-11 rounded-lg border border-[#d9e4dd] bg-white px-3.5 text-sm outline-none transition-[border-color,box-shadow] hover:border-[#b9cdc1] focus-visible:border-[#00873a] focus-visible:ring-4 focus-visible:ring-[#00873a]/15";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-semibold text-[#10201a]">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function PlatformPicker({ value, onChange }: { value: Platform[]; onChange: (v: Platform[]) => void }) {
  const toggle = (id: Platform) => onChange(value.includes(id) ? value.filter((p) => p !== id) : [...value, id]);
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => {
        const on = value.includes(p.id);
        return (
          <button
            type="button"
            key={p.id}
            onClick={() => toggle(p.id)}
            aria-pressed={on}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              on ? "bg-[#00873a] border-[#00873a] text-white" : "bg-white text-gray-700 hover:border-[#00873a]"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
