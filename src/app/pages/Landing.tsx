import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { VehicleCard } from "../components/Common";
import { Car, FileCheck, Search, Wallet, KeyRound, ShieldCheck } from "lucide-react";
import { api, PLATFORMS, type Vehicle } from "../../lib/api";

const STEPS = [
  { icon: Search, title: "Find a car", text: "Browse vehicles approved for Uber, inDrive or Bolt, with weekly rates and deposits upfront." },
  { icon: FileCheck, title: "Send a request", text: "Upload your ID, licence and PrDP once, then pick your start date and platform." },
  { icon: KeyRound, title: "Get the keys", text: "The owner reviews your request and hands over the car when you're approved." },
  { icon: Wallet, title: "Drive and pay weekly", text: "Earn on the apps and pay a fixed weekly rate. Every payment is tracked in your dashboard." },
];

export function Landing() {
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  useEffect(() => {
    api<{ vehicles: Vehicle[] }>("/vehicles?limit=6").then((r) => setFeatured(r.vehicles)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#00C853] to-[#00a843] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center md:text-left">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">Rent a car. Drive for Uber, inDrive or Bolt.</h1>
            <p className="text-lg md:text-xl text-green-50">
              Drive2Own connects vehicle owners with drivers who need a car to start earning. Owners put their cars to work; drivers get on the road without buying one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/vehicles"><Button size="lg" className="bg-white text-[#00873a] hover:bg-gray-100 w-full sm:w-auto">Find a vehicle</Button></Link>
              <Link to="/join?role=owner"><Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10 w-full sm:w-auto">List my vehicle</Button></Link>
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start pt-2">
              {PLATFORMS.map((p) => (
                <span key={p.id} className="px-3 py-1 rounded-full bg-white/15 text-sm font-medium">{p.label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">How it works for drivers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <Card key={s.title}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-[#00C853]" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">Step {i + 1}</span>
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-bold">Available now</h2>
              <Link to="/vehicles" className="text-[#00873a] hover:underline">View all</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Card className="border-[#00C853]/30">
            <CardContent className="p-8 space-y-4">
              <Car className="w-8 h-8 text-[#00C853]" />
              <h3 className="text-2xl font-bold">Own a car?</h3>
              <p className="text-gray-600">List it, set your weekly rate and deposit, choose which platforms it's approved for, and review every driver before handing over the keys.</p>
              <Link to="/join?role=owner"><Button className="bg-[#00C853] hover:bg-[#00b84a]">List your vehicle</Button></Link>
            </CardContent>
          </Card>
          <Card className="border-[#00C853]/30">
            <CardContent className="p-8 space-y-4">
              <ShieldCheck className="w-8 h-8 text-[#00C853]" />
              <h3 className="text-2xl font-bold">Need a car to drive?</h3>
              <p className="text-gray-600">No dealership, no finance application. Show your PrDP, pick a car and start earning on the platform that suits you.</p>
              <Link to="/join?role=driver"><Button className="bg-[#00C853] hover:bg-[#00b84a]">Sign up as a driver</Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Drive2Own. Drive2Own is an independent marketplace and is not affiliated with Uber, inDrive or Bolt.
      </footer>
    </div>
  );
}
