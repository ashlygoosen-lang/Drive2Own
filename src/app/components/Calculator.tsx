import { useState } from "react";
import { Input } from "./ui/input";
import type { ReactNode } from "react";
import { money } from "../../lib/api";
import { AnimatedNumber } from "./Motion";

const signed = (n: number) => `${n < 0 ? "− " : ""}${money(Math.abs(n))}`;
const minus = (n: number) => `− ${money(n)}`;
const num = (s: string) => (Number.isFinite(parseFloat(s)) ? Math.max(0, parseFloat(s)) : 0);

function Row({ label, value, strong, tone }: { label: string; value: ReactNode; strong?: boolean; tone?: "good" | "bad" }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "font-semibold text-base" : "text-sm text-gray-700"}`}>
      <span>{label}</span>
      <span className={`transition-colors duration-500 ${tone === "bad" ? "text-red-600" : tone === "good" ? "text-[#00873a]" : ""}`}>{value}</span>
    </div>
  );
}

function Num({ label, value, onChange, suffix, hint }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative">
        <Input type="number" inputMode="decimal" min={0} value={value} onChange={(e) => onChange(e.target.value)} className={suffix ? "pr-10" : ""} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</span>}
      </div>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

/** Driver weekly profit estimate. Every number is editable: the defaults are examples, not predictions. */
export function DriverCalculator({ weeklyRent }: { weeklyRent?: number }) {
  const [earn, setEarn] = useState("9000");
  const [fee, setFee] = useState("25");
  const [fuel, setFuel] = useState("2000");
  const [other, setOther] = useState("300");
  const [rent, setRent] = useState(String(weeklyRent ?? 2800));

  const earnings = num(earn), feeAmt = earnings * (Math.min(num(fee), 100) / 100);
  const costs = num(rent) + num(fuel) + num(other);
  const net = earnings - feeAmt - costs;
  const breakEven = num(fee) >= 100 ? Infinity : costs / (1 - num(fee) / 100);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Num label="Weekly fares you expect to earn" value={earn} onChange={setEarn} suffix="R" />
        <Num label="Platform fee" value={fee} onChange={setFee} suffix="%" hint="Check your platform's current commission and replace this." />
        <Num label="Weekly car rent" value={rent} onChange={setRent} suffix="R" />
        <Num label="Fuel per week" value={fuel} onChange={setFuel} suffix="R" />
        <Num label="Other costs per week" value={other} onChange={setOther} suffix="R" hint="Data, car wash, tolls, snacks." />
      </div>
      <div className="bg-[#f1f6f3] rounded-xl p-6 space-y-3 self-start">
        <Row label="Fares" value={<AnimatedNumber value={Math.round(earnings)} format={money} />} />
        <Row label={`Platform fee (${num(fee)}%)`} value={<AnimatedNumber value={Math.round(feeAmt)} format={minus} />} />
        <Row label="Car rent" value={<AnimatedNumber value={Math.round(num(rent))} format={minus} />} />
        <Row label="Fuel and other costs" value={<AnimatedNumber value={Math.round(num(fuel) + num(other))} format={minus} />} />
        <div className="border-t pt-3"><Row strong label="What you keep per week" value={<AnimatedNumber value={Math.round(net)} format={signed} />} tone={net < 0 ? "bad" : "good"} /></div>
        <p className="text-sm text-gray-600">
          {Number.isFinite(breakEven)
            ? <>You need about <strong><AnimatedNumber value={Math.ceil(breakEven)} format={money} /></strong> in weekly fares just to cover your costs.</>
            : "Enter a platform fee below 100% to see your break-even."}
        </p>
        <p className="text-xs text-gray-500">An estimate using the numbers you enter. Actual earnings depend on the hours you drive, demand and your platform's rules. Tax is not included.</p>
      </div>
    </div>
  );
}

/** Owner income estimate. */
export function OwnerCalculator() {
  const [rate, setRate] = useState("2800");
  const [weeks, setWeeks] = useState("46");
  const [service, setService] = useState("9000");
  const [insurance, setInsurance] = useState("1500");

  const w = Math.min(num(weeks), 52);
  const gross = num(rate) * w;
  const costs = num(service) + num(insurance) * 12;
  const net = gross - costs;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Num label="Weekly rate" value={rate} onChange={setRate} suffix="R" />
        <Num label="Weeks rented per year" value={weeks} onChange={setWeeks} hint="Allow for gaps between drivers and downtime. Maximum 52." />
        <Num label="Servicing and repairs per year" value={service} onChange={setService} suffix="R" />
        <Num label="Insurance per month" value={insurance} onChange={setInsurance} suffix="R" hint="Make sure your policy covers e-hailing use." />
      </div>
      <div className="bg-[#f1f6f3] rounded-xl p-6 space-y-3 self-start">
        <Row label={`Rent (${w} weeks)`} value={<AnimatedNumber value={Math.round(gross)} format={money} />} />
        <Row label="Servicing and repairs" value={<AnimatedNumber value={Math.round(num(service))} format={minus} />} />
        <Row label="Insurance (12 months)" value={<AnimatedNumber value={Math.round(num(insurance) * 12)} format={minus} />} />
        <div className="border-t pt-3 space-y-2">
          <Row strong label="Estimated per year" value={<AnimatedNumber value={Math.round(net)} format={signed} />} tone={net < 0 ? "bad" : "good"} />
          <Row label="About per month" value={<AnimatedNumber value={Math.round(net / 12)} format={signed} />} />
        </div>
        <p className="text-xs text-gray-500">An estimate from the numbers you enter. It excludes tax, fuel (paid by the driver), finance repayments and the cost of the car itself.</p>
      </div>
    </div>
  );
}
