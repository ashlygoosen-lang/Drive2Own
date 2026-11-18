import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { StatusBadge, fmtDate } from "../components/Common";
import { CheckCircle2, FileText, Trash2, Upload } from "lucide-react";
import { api, openDocument, type Doc, type DocType } from "../../lib/api";

export function Documents() {
  const [types, setTypes] = useState<DocType[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState("");

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your documents</h1>
          <p className="text-gray-600">
            {required.length > 0 && `${done} of ${required.length} required documents uploaded. `}
            PDF, JPG, PNG or WebP, up to 8 MB each. Only you, and owners you've requested a vehicle from, can see these.
          </p>
        </div>
        {types.map((t) => {
          const d = docs.find((x) => x.type === t.type);
          return (
            <Card key={t.type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {d ? <CheckCircle2 className="w-5 h-5 text-[#00C853]" /> : <FileText className="w-5 h-5 text-gray-400" />}
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
                  <span className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[#00C853] hover:bg-[#00b84a] text-white text-sm cursor-pointer">
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
    </div>
  );
}
