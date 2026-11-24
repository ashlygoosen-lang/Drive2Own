import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Lock, RefreshCw, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Field, selectClass } from "./Fields";
import { api, type Doc, type DocType, type Role } from "../../lib/api";

// ---------------------------------------------------------------------------
// Profile data (identity, address, income, FICA) shared by sign-up and
// "complete your profile". Field names match the API's profile schema.
// ---------------------------------------------------------------------------

export interface ProfileForm {
  idType: "sa_id" | "passport"; idNumber: string; dateOfBirth: string; nationality: string; workPermitNumber: string;
  addressLine1: string; addressLine2: string; suburb: string; city: string; province: string; postalCode: string;
  employmentStatus: string; incomeSource: string; incomeSourceOther: string; monthlyIncomeBand: string; yearsDriving: string;
  companyName: string; companyRegNumber: string; taxNumber: string; sourceOfFunds: string;
  isPep: "" | "yes" | "no"; pepDetails: string;
  actingOnOwnBehalf: boolean; declarationTrue: boolean; consentVerification: boolean; consentPopia: boolean; acceptTerms: boolean; consentMarketing: boolean;
}

export const emptyProfile: ProfileForm = {
  idType: "sa_id", idNumber: "", dateOfBirth: "", nationality: "South African", workPermitNumber: "",
  addressLine1: "", addressLine2: "", suburb: "", city: "Cape Town", province: "Western Cape", postalCode: "",
  employmentStatus: "", incomeSource: "", incomeSourceOther: "", monthlyIncomeBand: "", yearsDriving: "",
  companyName: "", companyRegNumber: "", taxNumber: "", sourceOfFunds: "",
  isPep: "", pepDetails: "",
  actingOnOwnBehalf: false, declarationTrue: false, consentVerification: false, consentPopia: false, acceptTerms: false, consentMarketing: false,
};

export const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"];
export const EMPLOYMENT: [string, string][] = [
  ["e_hailing_full_time", "E-hailing driver (full-time)"], ["e_hailing_part_time", "E-hailing driver (part-time)"],
  ["employed", "Employed"], ["self_employed", "Self-employed"], ["business_owner", "Business owner"],
  ["unemployed", "Not currently earning"], ["retired", "Retired"], ["other", "Other"],
];
export const INCOME_SOURCES: [string, string][] = [
  ["e_hailing_earnings", "E-hailing earnings"], ["salary", "Salary or wages"], ["business_income", "Business income"],
  ["rental_income", "Rental income"], ["investments", "Investments or savings"], ["pension", "Pension or annuity"],
  ["grant", "Government grant"], ["family_support", "Family support"], ["other", "Other"],
];
export const INCOME_BANDS: [string, string][] = [
  ["under_5000", "Under R5 000"], ["5000_10000", "R5 000 – R10 000"], ["10000_20000", "R10 000 – R20 000"],
  ["20000_35000", "R20 000 – R35 000"], ["35000_50000", "R35 000 – R50 000"], ["over_50000", "Over R50 000"],
];

/** Validates a 13-digit SA ID number (Luhn checksum) and returns the date of birth it encodes. */
export function saIdDob(id: string): string | null {
  if (!/^\d{13}$/.test(id)) return null;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = Number(id[12 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  if (sum % 10 !== 0) return null;
  const yy = Number(id.slice(0, 2)), mm = Number(id.slice(2, 4)), dd = Number(id.slice(4, 6));
  const year = yy > new Date().getFullYear() % 100 ? 1900 + yy : 2000 + yy;
  const dt = new Date(Date.UTC(year, mm - 1, dd));
  if (dt.getUTCMonth() !== mm - 1 || dt.getUTCDate() !== dd) return null;
  return dt.toISOString().slice(0, 10);
}
const age = (dob: string) => {
  const b = new Date(dob), n = new Date();
  return n.getFullYear() - b.getFullYear() - (n < new Date(n.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

/** Returns the first problem with a step, or null when the step is complete. */
export function validateIdentity(p: ProfileForm, role: Role): string | null {
  if (p.idType === "sa_id") {
    const dob = saIdDob(p.idNumber.trim());
    if (!dob) return "That South African ID number is not valid. Check the 13 digits.";
    if (p.dateOfBirth && p.dateOfBirth !== dob) return "Your date of birth does not match your ID number";
  } else {
    if (!/^[A-Za-z0-9]{6,20}$/.test(p.idNumber.trim())) return "Enter a valid passport number";
    if (!p.nationality.trim() || p.nationality.trim().toLowerCase() === "south african") return "Enter your nationality as shown on your passport";
    if (role === "driver" && !p.workPermitNumber.trim()) return "Foreign nationals need a valid work permit to drive. Enter your permit number.";
  }
  if (!p.dateOfBirth) return "Enter your date of birth";
  const a = age(p.dateOfBirth);
  if (a < 18) return "You must be at least 18 years old to register";
  if (role === "driver" && a < 21) return "Drivers must be at least 21 years old";
  return null;
}
export function validateAddress(p: ProfileForm): string | null {
  if (p.addressLine1.trim().length < 3) return "Enter your street address";
  if (p.suburb.trim().length < 2) return "Enter your suburb";
  if (p.city.trim().length < 2) return "Enter your city or town";
  if (!/^\d{4}$/.test(p.postalCode.trim())) return "Postal code must be 4 digits";
  return null;
}
export function validateIncome(p: ProfileForm, role: Role): string | null {
  if (!p.employmentStatus) return "Select your employment status";
  if (!p.incomeSource) return "Select your main source of income";
  if (p.incomeSource === "other" && !p.incomeSourceOther.trim()) return "Tell us your other source of income";
  if (!p.monthlyIncomeBand) return "Select your monthly income";
  if (role === "driver" && p.yearsDriving === "") return "Tell us how many years you have held a driving licence";
  if (p.sourceOfFunds.trim().length < 10) return "Briefly describe where the money you will use comes from";
  return null;
}
export function validateFica(p: ProfileForm): string | null {
  if (!p.isPep) return "Answer the question about public positions";
  if (p.isPep === "yes" && !p.pepDetails.trim()) return "Give details of the public position held";
  if (!p.actingOnOwnBehalf) return "Confirm that you are acting on your own behalf";
  if (!p.declarationTrue) return "Confirm that the information you gave is true and correct";
  if (!p.consentVerification) return "We need your consent to verify your identity and documents";
  if (!p.consentPopia) return "We need your consent to process your personal information";
  if (!p.acceptTerms) return "Accept the terms of use, privacy policy and refund policy to continue";
  return null;
}

/** Converts the form to the API payload. */
export function profilePayload(p: ProfileForm) {
  return {
    ...p,
    idNumber: p.idNumber.trim().toUpperCase(),
    yearsDriving: p.yearsDriving === "" ? undefined : Number(p.yearsDriving),
    isPep: p.isPep === "yes",
  };
}

type Setter = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => void;

function Select({ value, onChange, options, placeholder, id }: { value: string; onChange: (v: string) => void; options: [string, string][]; placeholder: string; id?: string }) {
  return (
    <select id={id} className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>{placeholder}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export function SectionNote({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2 rounded-xl bg-white border border-[#e3ebe6] p-3.5 text-xs text-gray-600"><Lock className="w-3.5 h-3.5 mt-0.5 text-[#00873a] shrink-0" /><span>{children}</span></p>;
}

export function IdentityFields({ p, set, role }: { p: ProfileForm; set: Setter; role: Role }) {
  const onId = (v: string) => {
    set("idNumber", v);
    if (p.idType === "sa_id") { const dob = saIdDob(v.trim()); if (dob) set("dateOfBirth", dob); }
  };
  return (
    <div className="space-y-5">
      <Field label="Identity document">
        <div className="grid grid-cols-2 gap-2">
          {([["sa_id", "South African ID"], ["passport", "Passport"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={p.idType === v}
              onClick={() => { set("idType", v); set("nationality", v === "sa_id" ? "South African" : ""); }}
              className={`h-11 rounded-lg border text-sm font-semibold transition-all ${p.idType === v ? "border-[#00873a] bg-[#f1f8f4] text-[#0e3b2e]" : "border-[#d9e4dd] bg-white text-gray-700 hover:border-[#b9cdc1]"}`}>{l}</button>
          ))}
        </div>
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={p.idType === "sa_id" ? "ID number" : "Passport number"} hint={p.idType === "sa_id" ? "13 digits. We fill in your date of birth." : undefined}>
          <Input inputMode={p.idType === "sa_id" ? "numeric" : "text"} maxLength={p.idType === "sa_id" ? 13 : 20} value={p.idNumber} onChange={(e) => onId(e.target.value.replace(p.idType === "sa_id" ? /\D/g : /\s/g, ""))} required />
        </Field>
        <Field label="Date of birth">
          <Input type="date" value={p.dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set("dateOfBirth", e.target.value)} required />
        </Field>
      </div>
      {p.idType === "passport" && (
        <div className="swap-in grid sm:grid-cols-2 gap-4">
          <Field label="Nationality"><Input value={p.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="e.g. Zimbabwean" required /></Field>
          <Field label={role === "driver" ? "Work permit number" : "Work or residence permit (optional)"} hint={role === "driver" ? "Required for foreign nationals who drive" : undefined}>
            <Input value={p.workPermitNumber} onChange={(e) => set("workPermitNumber", e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  );
}

export function AddressFields({ p, set }: { p: ProfileForm; set: Setter }) {
  return (
    <div className="space-y-5">
      <Field label="Street address"><Input autoComplete="address-line1" value={p.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} placeholder="House number and street" required /></Field>
      <Field label="Complex, unit or building (optional)"><Input autoComplete="address-line2" value={p.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Suburb"><Input value={p.suburb} onChange={(e) => set("suburb", e.target.value)} required /></Field>
        <Field label="City or town"><Input autoComplete="address-level2" value={p.city} onChange={(e) => set("city", e.target.value)} required /></Field>
        <Field label="Province">
          <select className={selectClass} value={p.province} onChange={(e) => set("province", e.target.value)}>
            {PROVINCES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Postal code"><Input inputMode="numeric" autoComplete="postal-code" maxLength={4} value={p.postalCode} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} required /></Field>
      </div>
      <SectionNote>This must match your proof of residence, which you'll upload at the end. It should be dated within the last 3 months.</SectionNote>
    </div>
  );
}

export function IncomeFields({ p, set, role }: { p: ProfileForm; set: Setter; role: Role }) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Employment status"><Select value={p.employmentStatus} onChange={(v) => set("employmentStatus", v)} options={EMPLOYMENT} placeholder="Select…" /></Field>
        <Field label="Main source of income"><Select value={p.incomeSource} onChange={(v) => set("incomeSource", v)} options={INCOME_SOURCES} placeholder="Select…" /></Field>
      </div>
      {p.incomeSource === "other" && (
        <div className="swap-in"><Field label="Other source of income"><Input value={p.incomeSourceOther} onChange={(e) => set("incomeSourceOther", e.target.value)} /></Field></div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Monthly income (before deductions)"><Select value={p.monthlyIncomeBand} onChange={(v) => set("monthlyIncomeBand", v)} options={INCOME_BANDS} placeholder="Select…" /></Field>
        {role === "driver"
          ? <Field label="Years holding a driving licence"><Input type="number" min={0} max={60} value={p.yearsDriving} onChange={(e) => set("yearsDriving", e.target.value)} /></Field>
          : <Field label="Income tax number (optional)"><Input inputMode="numeric" maxLength={10} value={p.taxNumber} onChange={(e) => set("taxNumber", e.target.value.replace(/\D/g, ""))} /></Field>}
      </div>
      {role === "owner" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company name (if listing as a business)"><Input value={p.companyName} onChange={(e) => set("companyName", e.target.value)} /></Field>
          <Field label="Company registration number"><Input value={p.companyRegNumber} onChange={(e) => set("companyRegNumber", e.target.value)} placeholder="e.g. 2020/123456/07" /></Field>
        </div>
      )}
      <Field label="Source of funds" hint={role === "driver"
        ? "Where will the money for your deposit and weekly rent come from? e.g. “My Uber earnings and savings from my salary.”"
        : "How did you acquire the car you will list, and where does the money for its running costs come from? e.g. “Bought with savings from my salary; insurance paid from my business account.”"}>
        <Textarea rows={3} maxLength={500} value={p.sourceOfFunds} onChange={(e) => set("sourceOfFunds", e.target.value)} />
      </Field>
      <SectionNote>We ask this to assess affordability and to meet anti-money-laundering standards under the Financial Intelligence Centre Act (FICA). It is kept confidential.</SectionNote>
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className={`flex items-start gap-3 text-sm cursor-pointer rounded-xl border p-4 transition-colors ${checked ? "border-[#9fd3b5] bg-[#f3faf6]" : "border-[#e3ebe6] bg-white hover:border-[#cfddd5]"}`}>
      <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#00873a] shrink-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-gray-700 leading-relaxed">{children}</span>
    </label>
  );
}

export function FicaFields({ p, set }: { p: ProfileForm; set: Setter }) {
  const L = (to: string, t: string) => <Link to={to} target="_blank" className="font-semibold text-[#00873a] hover:underline">{t}</Link>;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[13px] font-semibold">Are you, or are you closely related to or associated with, a prominent public official?</p>
        <p className="text-xs text-gray-500">For example a member of Parliament, a cabinet minister, a judge, a senior government or military official, a head of a state-owned company, or a senior political party official, in South Africa or another country.</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {(["no", "yes"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={p.isPep === v} onClick={() => set("isPep", v)}
              className={`h-11 rounded-lg border text-sm font-semibold capitalize transition-all ${p.isPep === v ? "border-[#00873a] bg-[#f1f8f4] text-[#0e3b2e]" : "border-[#d9e4dd] bg-white text-gray-700 hover:border-[#b9cdc1]"}`}>{v}</button>
          ))}
        </div>
        {p.isPep === "yes" && (
          <div className="swap-in pt-2"><Field label="Position, country and your relationship to the official"><Input value={p.pepDetails} onChange={(e) => set("pepDetails", e.target.value)} /></Field></div>
        )}
      </div>
      <div className="space-y-2.5">
        <Check checked={p.actingOnOwnBehalf} onChange={(v) => set("actingOnOwnBehalf", v)}>I am registering for myself (or for the company I represent) and not on behalf of anyone else.</Check>
        <Check checked={p.declarationTrue} onChange={(v) => set("declarationTrue", v)}>The information and documents I provide are true, complete and my own. I understand that false information may lead to my account being closed and may be reported to the authorities.</Check>
        <Check checked={p.consentVerification} onChange={(v) => set("consentVerification", v)}>I consent to Drive2Own verifying my identity, address, driving licence, PrDP and income, including through identity, credit-bureau and fraud-prevention checks, and to sharing my verification status with car owners I request a car from.</Check>
        <Check checked={p.consentPopia} onChange={(v) => set("consentPopia", v)}>I consent to Drive2Own processing my personal information, including my identity number and financial information, as described in the {L("/privacy", "privacy policy")}, in line with POPIA.</Check>
        <Check checked={p.acceptTerms} onChange={(v) => set("acceptTerms", v)}>I have read and accept the {L("/terms", "terms of use")}, {L("/privacy", "privacy policy")} and {L("/refunds", "refund and cancellation policy")}.</Check>
        <Check checked={p.consentMarketing} onChange={(v) => set("consentMarketing", v)}><span className="text-gray-500">Optional:</span> send me occasional news about new cars and the Drive to Own programme. I can unsubscribe at any time.</Check>
      </div>
    </div>
  );
}

/** Upload panel for every document the account type needs. Calls onChange with (uploadedRequired, totalRequired). */
export function DocumentUploader({ onProgress }: { onProgress?: (done: number, total: number) => void }) {
  const [types, setTypes] = useState<DocType[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    const [t, d] = await Promise.all([api<{ types: DocType[] }>("/documents/types"), api<{ documents: Doc[] }>("/documents")]);
    setTypes(t.types); setDocs(d.documents);
  }, []);
  useEffect(() => { load().catch((e) => toast.error(e.message)); }, [load]);
  useEffect(() => {
    const req = types.filter((t) => t.required);
    onProgress?.(req.filter((t) => docs.some((d) => d.type === t.type)).length, req.length);
  }, [types, docs, onProgress]);

  const upload = async (type: string, file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("That file is larger than 8 MB");
    setBusy(type);
    try {
      const form = new FormData();
      form.append("type", type); form.append("file", file);
      await api("/documents", { method: "POST", form });
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(""); }
  };

  if (!types.length) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="shimmer h-20 !rounded-xl" />)}</div>;
  return (
    <ul className="space-y-3">
      {types.map((t) => {
        const d = docs.find((x) => x.type === t.type);
        return (
          <li key={t.type} className={`rounded-xl border p-4 transition-colors ${d ? "border-[#9fd3b5] bg-[#f3faf6]" : "border-[#e3ebe6] bg-white"}`}>
            <div className="flex items-start gap-3">
              <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${d ? "bg-[#00873a] text-white" : "bg-gray-100 text-gray-400"}`}>
                {d ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{t.label}{t.required ? <span className="text-red-500"> *</span> : <span className="text-gray-400 font-normal"> (optional)</span>}</div>
                {t.hint && <div className="text-xs text-gray-500 mt-0.5">{t.hint}</div>}
                {d && <div className="text-xs text-[#00873a] mt-1 truncate">Uploaded: {d.name}</div>}
              </div>
              <label className="shrink-0">
                <input type="file" className="sr-only" accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => { void upload(t.type, e.target.files?.[0]); e.target.value = ""; }} />
                <span className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${d ? "border border-[#cfddd5] bg-white text-[#0e3b2e] hover:bg-[#f1f6f3]" : "bg-[#00873a] text-white hover:bg-[#006f2f]"}`}>
                  {busy === t.type ? <Loader2 className="w-4 h-4 animate-spin" /> : d ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {busy === t.type ? "Uploading" : d ? "Replace" : "Upload"}
                </span>
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal step indicator. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-1.5 mb-8" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex-1" aria-current={i === current ? "step" : undefined}>
          <div className={`h-1.5 rounded-full transition-colors duration-500 ${i <= current ? "bg-[#00873a]" : "bg-[#e3ebe6]"}`} />
          <div className={`mt-2 text-[11px] font-semibold hidden sm:block ${i === current ? "text-[#0e3b2e]" : i < current ? "text-[#00873a]" : "text-gray-400"}`}>{s}</div>
        </li>
      ))}
    </ol>
  );
}
