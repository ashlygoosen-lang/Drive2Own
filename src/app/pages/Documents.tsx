import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHero, PageShell } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { StatusBadge, fmtDate } from "../components/Common";
import { BadgeCheck, CheckCircle2, Clock, FileText, Lock, Trash2, Upload } from "lucide-react";
import { api, openDocument, type Doc, type DocType } from "../../lib/api";

export function Documents() {
  const [types, setTypes] = useState<DocType[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState("");
  useTitle("Your documents");

  const load = useCallback(async () => {
    const [t, d] = await Promise.all([
      api<{ types: DocType[] }>("/documents/types"),
      api<{ documents: Doc[] }>("/documents"),
    ]);
    setTypes(t.types);
    setDocs(d.documents);
  }, []);
  useEffect(() => { load().catch((e) => toast.error(e.message)); }, [load]);

  const upload = async (type: string, file: File | undefined) => {
    if (!file) return;
    setUploading(type);
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      await api("/documents", { method: "POST", form });
      toast.success("Document uploaded");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading("");
    }
  };

  const remove = async (d: Doc) => {
    try { await api(`/documents/${d.id}`, { method: "DELETE" }); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not delete"); }
  };

  const required = types.filter((t) => t.required);
  const done = required.filter((t) => docs.some((d) => d.type === t.type)).length;

  return (
    <PageShell cta={false} hero={
      <PageHero compact eyebrow="Verification" crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Documents" }]}
        title="Your documents" subtitle="Upload once. Our team reviews them, and owners you request a car from can see that you're verified.">
        {required.length > 0 && (
          <div className="enter mt-8 max-w-xl" style={{ ["--d" as string]: 300 }}>
            <div className="flex justify-between text-sm mb-2"><span className="text-green-50/85">{done} of {required.length} required documents uploaded</span><span className="font-semibold text-[#ffc72c]">{Math.round((done / required.length) * 100)}%</span></div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#3fbf7f] to-[#ffc72c] transition-[width] duration-700" style={{ width: `${(done / required.length) * 100}%` }} /></div>
          </div>
        )}
      </PageHero>
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="space-y-4">
        <p className="flex items-start gap-2 text-sm text-gray-600 rounded-xl bg-white border border-[#e3ebe6] p-4">
          <Lock className="w-4 h-4 text-[#00873a] shrink-0 mt-0.5" />
          PDF, JPG, PNG or WebP, up to 8 MB each. Stored privately: only you, our review team and owners you've requested a car from can see them.
        </p>
        {types.map((t) => {
          const d = docs.find((x) => x.type === t.type);
          return (
            <Card key={t.type} className={`lift gap-4 ${d?.status === "rejected" ? "border-red-200" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${d ? "bg-[#e3f1e9]" : "bg-gray-100"}`}>{d ? <CheckCircle2 className="w-5 h-5 text-[#00873a]" /> : <FileText className="w-5 h-5 text-gray-400" />}</span>
                  {t.label}
                  {t.required && <span className="text-red-500">*</span>}
                  {d && <StatusBadge status={d.status === "uploaded" ? "pending" : d.status === "verified" ? "paid" : "declined"} label={d.status === "uploaded" ? "awaiting review" : d.status} />}
                </CardTitle>
                {d && <CardDescription>{d.name} · uploaded {fmtDate(d.uploadedAt)}</CardDescription>}
                {d?.status === "rejected" && d.note && <p className="text-sm text-red-600">Rejected: {d.note}. Please upload a corrected copy.</p>}
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <label>
                  <input type="file" className="hidden" accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => { void upload(t.type, e.target.files?.[0]); e.target.value = ""; }} />
                  <span className="btn-premium inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#00873a] hover:bg-[#006f2f] text-white text-sm font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />{uploading === t.type ? "Uploading…" : d ? "Replace" : "Upload"}
                  </span>
                </label>
                {d && <Button variant="outline" onClick={() => openDocument(d.id).catch((e) => toast.error(e.message))}>View</Button>}
                {d && <Button variant="ghost" onClick={() => remove(d)} aria-label="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <aside className="lg:sticky lg:top-24 space-y-4">
        <div className="rounded-2xl bg-[#0e3b2e] text-white p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">How verification works</h2>
          <ol className="space-y-3 text-sm text-green-50/85">
            {([[Upload, "Upload a clear photo or PDF of each document."], [Clock, "Our team reviews it and marks it verified, or tells you what to fix."], [BadgeCheck, "Owners see your verified status when you request a car."]] as const).map(([Icon, t]) => (
              <li key={t} className="flex gap-3"><Icon className="w-4 h-4 text-[#ffc72c] shrink-0 mt-0.5" />{t}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-[#e3ebe6] bg-white p-5 text-sm text-gray-600">
          <div className="font-semibold text-[#10201a] mb-1">Tips for a quick review</div>
          Make sure all four corners are visible, the text is sharp, and the document hasn't expired.
        </div>
      </aside>
      </div>
    </PageShell>
  );
}
