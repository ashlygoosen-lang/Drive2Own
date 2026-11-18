import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { VehicleImage } from "../components/Common";
import { Field, PlatformPicker, selectClass } from "../components/Fields";
import { api, type Platform, type Vehicle } from "../../lib/api";

const empty = {
  make: "", model: "", year: new Date().getFullYear() - 3, plate: "", color: "", seats: 5,
  fuel: "petrol", transmission: "manual", city: "Cape Town", weeklyRate: 2800, deposit: 3000, description: "",
};

export function VehicleForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const [f, setF] = useState(empty);
  const [platforms, setPlatforms] = useState<Platform[]>(["uber", "indrive", "bolt"]);
  const [image, setImage] = useState<File | null>(null);
  const [existing, setExisting] = useState<Vehicle | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<{ vehicle: Vehicle }>(`/vehicles/${id}/manage`).then(({ vehicle: v }) => {
      setExisting(v);
      setPlatforms(v.platforms);
      setF({ ...empty, ...v, plate: v.plate ?? "", weeklyRate: v.weeklyRate, deposit: v.deposit });
    }).catch((e) => { toast.error(e.message); navigate("/dashboard"); });
  }, [id, navigate]);

  const str = (k: keyof typeof empty) => ({
    value: String(f[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (platforms.length === 0) return toast.error("Pick at least one platform");
    setBusy(true);
    try {
      const body = { ...f, platforms, year: Number(f.year), seats: Number(f.seats), weeklyRate: Number(f.weeklyRate), deposit: Number(f.deposit) };
      const { vehicle } = await api<{ vehicle: Vehicle }>(editing ? `/vehicles/${id}` : "/vehicles", { method: editing ? "PUT" : "POST", body });
      if (image) {
        const form = new FormData();
        form.append("image", image);
        await api(`/vehicles/${vehicle.id}/image`, { method: "POST", form });
      }
      toast.success(editing ? "Listing updated" : "Vehicle listed!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save vehicle");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit vehicle" : "List a vehicle"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Make"><Input required {...str("make")} placeholder="Toyota" /></Field>
                <Field label="Model"><Input required {...str("model")} placeholder="Corolla Quest" /></Field>
                <Field label="Year"><Input type="number" required {...str("year")} /></Field>
                <Field label="Registration plate"><Input required {...str("plate")} placeholder="CA 123-456" /></Field>
                <Field label="Colour"><Input required {...str("color")} /></Field>
                <Field label="Seats"><Input type="number" min={2} max={9} required {...str("seats")} /></Field>
                <Field label="Fuel">
                  <select className={selectClass} {...str("fuel")}>
                    {["petrol", "diesel", "hybrid", "electric"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Transmission">
                  <select className={selectClass} {...str("transmission")}>
                    <option>manual</option><option>automatic</option>
                  </select>
                </Field>
                <Field label="Weekly rate (R)"><Input type="number" min={100} required {...str("weeklyRate")} /></Field>
                <Field label="Deposit (R)"><Input type="number" min={0} required {...str("deposit")} /></Field>
              </div>
              <Field label="City"><Input required {...str("city")} /></Field>
              <Field label="Approved for these platforms" hint="Only tick platforms where this vehicle meets the vehicle requirements.">
                <PlatformPicker value={platforms} onChange={setPlatforms} />
              </Field>
              <Field label="Description"><Textarea rows={4} maxLength={1000} {...str("description")} /></Field>
              <Field label="Photo (JPG, PNG or WebP, max 5 MB)">
                {existing && !image && <VehicleImage src={existing.imageUrl} className="w-full h-40 rounded-lg mb-2" />}
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
              </Field>
              <div className="flex gap-3">
                <Button type="submit" disabled={busy} className="bg-[#00C853] hover:bg-[#00b84a]">{busy ? "Saving…" : editing ? "Save changes" : "List vehicle"}</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
