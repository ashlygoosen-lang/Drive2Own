import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { VehicleCard } from "../components/Common";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { BadgeCheck, CalendarCheck, ChevronRight, FileSignature, KeyRound, Lock, ReceiptText, ShieldCheck } from "lucide-react";
import { api, money, PLATFORMS, type Vehicle } from "../../lib/api";
import { DriverCalculator, OwnerCalculator } from "../components/Calculator";
import { Reveal } from "../components/Reveal";
import { useTitle } from "../../lib/useTitle";

const DRIVER_STEPS = [
  { title: "Create your account", text: "Sign up and upload your ID, driver's licence and PrDP once. We review them so owners can trust who they're renting to." },
  { title: "Choose a car", text: "Filter by platform and weekly rate. Every listing shows the rate, deposit and which platforms the car is approved for." },
  { title: "Agree the terms", text: "When the owner accepts your request, you both read and accept a written agreement covering fines, repairs, insurance and damage." },
  { title: "Collect the car and drive", text: "Pay the deposit and weekly rent on schedule. Every payment is recorded, and you can pay online." },
];
const OWNER_STEPS = [
  { title: "List your car", text: "Add photos, your weekly rate, the deposit and the platforms the car qualifies for." },
  { title: "Review requests", text: "See each driver's request and their verified documents before you decide. You choose who drives your car." },
  { title: "Confirm insurance and sign", text: "Confirm the car is insured for e-hailing, accept the agreement, and hand over the keys once both sides have signed." },
  { title: "Track your income", text: "A weekly payment schedule is created for you. Mark payments received, or let the driver pay online." },
];
const FAQ = [
  ["What do I need to rent a car as a driver?", "A valid South African ID or passport, a driver's licence and a Professional Driving Permit (PrDP). You'll also need an approved driver account on Uber, inDrive or Bolt. Each platform has its own driver and vehicle requirements, so check their current rules before you request a car."],
  ["How much does it cost?", "Each owner sets their own weekly rate and refundable deposit, shown on every listing before you send a request. The total for your rental period is calculated for you on the car's page."],
  ["Who pays for insurance, repairs and fines?", "The owner confirms the car is insured for e-hailing use and pays for scheduled servicing and wear-and-tear repairs. The driver pays for fuel, traffic fines, tolls and damage caused by negligence. These terms are written into the rental agreement both sides accept before handover."],
  ["Can I drive for more than one platform?", "Yes, if the owner has approved the car for them. When you send a request, you choose the platform you will drive on."],
  ["How do payments work?", "Once the car is handed over, a payment schedule is created: the deposit up front, then rent every week. Owners confirm each payment they receive, and drivers can pay online where it is enabled."],
  ["Is Drive2Own part of Uber, inDrive or Bolt?", "No. Drive2Own is an independent marketplace and is not affiliated with those companies. The rental agreement is between the owner and the driver."],
  ["Who can see my documents?", "Only you, Drive2Own's review team, and an owner you have sent a request to. Documents are stored privately and are never shown publicly. See our privacy policy for details."],
];

export function Landing() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [online, setOnline] = useState(false);
  const [tab, setTab] = useState<"drivers" | "owners">("drivers");
  const [calc, setCalc] = useState<"drivers" | "owners">("drivers");
  useTitle();

  useEffect(() => {
    api<{ vehicles: Vehicle[] }>("/vehicles?limit=100").then((r) => setVehicles(r.vehicles)).catch(() => setVehicles([]));
    api<{ onlinePayments: boolean }>("/meta").then((m) => setOnline(m.onlinePayments)).catch(() => {});
  }, []);

  const byPlatform = useMemo(
    () => PLATFORMS.map((p) => {
      const list = (vehicles ?? []).filter((v) => v.platforms.includes(p.id));
      return { ...p, count: list.length, from: list.length ? Math.min(...list.map((v) => v.weeklyRate)) : null };
    }),
    [vehicles],
  );
  const steps = tab === "drivers" ? DRIVER_STEPS : OWNER_STEPS;

  const protections = [
    { icon: BadgeCheck, title: "Documents reviewed", text: "Every driver's ID, licence and PrDP is checked by our team and marked verified or rejected, so owners know who they are dealing with." },
    { icon: FileSignature, title: "A written agreement", text: "Both sides accept a clear agreement before handover, and the owner confirms the car is insured for e-hailing." },
    { icon: ReceiptText, title: "Payments on record", text: online ? "Deposit and weekly rent are scheduled and tracked. Drivers can pay online and owners see each payment as it arrives." : "Deposit and weekly rent are scheduled and tracked, so both sides can see what has been paid and what is due." },
    { icon: Lock, title: "Private by design", text: "Your documents are stored privately and shown only to you, our review team and owners you apply to." },
  ];

  return (
    <div className="min-h-screen bg-white text-[#10201a]">
      <Header />

      {/* Hero */}
      <section className="bg-[#0e3b2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              Rent a car and start earning on Uber, inDrive or Bolt.
            </h1>
            <p className="text-lg text-green-50/90 max-w-xl">
              Drive2Own connects car owners with licensed e-hailing drivers. Choose a car, sign a clear agreement, pay weekly, and keep what you earn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/vehicles" className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Find a car</Link>
              <Link to="/join?role=owner" className="inline-flex items-center justify-center h-12 px-7 rounded-lg border border-white/40 font-semibold hover:bg-white/10">List your car</Link>
            </div>
          </div>

          <div className="bg-white text-[#10201a] rounded-2xl p-6 shadow-xl">
            <h2 className="font-display text-xl font-bold">Cars available now</h2>
            <p className="text-sm text-gray-600 mb-4">Pick the platform you drive on.</p>
            <ul className="divide-y">
              {byPlatform.map((p) => (
                <li key={p.id}>
                  <Link to={`/vehicles?platform=${p.id}`} className="flex items-center justify-between py-4 group">
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-sm text-gray-600">
                        {vehicles === null ? "Loading…" : p.count === 0 ? "No cars listed yet" : `${p.count} ${p.count === 1 ? "car" : "cars"} · from ${money(p.from!)} a week`}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00873a]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-[#f1f6f3] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-[auto_1fr] gap-4 md:gap-10 items-center">
          <h2 className="font-display text-xl font-bold">What drivers need to apply</h2>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {["SA ID or passport", "Valid driver's licence", "Professional Driving Permit (PrDP)", "An approved Uber, inDrive or Bolt driver account"].map((x) => (
              <li key={x} className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00873a] shrink-0" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-20 scroll-mt-16">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold max-w-xl">From sign-up to the driver's seat in four steps</h2>
            <div role="tablist" className="inline-flex rounded-lg border p-1 bg-gray-50">
              {(["drivers", "owners"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-md text-sm font-medium ${tab === t ? "bg-[#0e3b2e] text-white" : "text-gray-700"}`}>
                  {t === "drivers" ? "I'm a driver" : "I own a car"}
                </button>
              ))}
            </div>
          </div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-[#00873a] pt-4">
                <div className="font-display text-3xl font-bold text-[#00873a] mb-2">{i + 1}</div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Calculators */}
      <section id="calculator" className="py-16 md:py-20 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Run the numbers first</h2>
                <p className="text-gray-600 max-w-xl">Work out what a rental could mean for you. Change any figure to match your own situation.</p>
              </div>
              <div role="tablist" className="inline-flex rounded-lg border p-1 bg-gray-50">
                {(["drivers", "owners"] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={calc === t} onClick={() => setCalc(t)}
                    className={`px-5 py-2 rounded-md text-sm font-medium ${calc === t ? "bg-[#0e3b2e] text-white" : "text-gray-700"}`}>
                    {t === "drivers" ? "Driver earnings" : "Owner income"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border p-6 md:p-8">{calc === "drivers" ? <DriverCalculator /> : <OwnerCalculator />}</div>
          </Reveal>
        </div>
      </section>

      {/* Available now */}
      {vehicles && vehicles.length > 0 && (
        <section className="py-16 bg-[#f1f6f3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-display text-3xl font-bold">Available now</h2>
              <Link to="/vehicles" className="text-[#00873a] font-medium hover:underline">View all cars</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.slice(0, 6).map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          </div>
        </section>
      )}

      {/* Protections */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold max-w-2xl mb-3">Clear terms for owners and drivers</h2>
          <p className="text-gray-600 max-w-2xl mb-10">Renting a car for e-hailing works best when everyone knows what to expect. Drive2Own puts the important things in writing.</p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {protections.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="w-11 h-11 shrink-0 rounded-lg bg-[#e3f1e9] flex items-center justify-center"><p.icon className="w-5 h-5 text-[#00873a]" /></div>
                <div>
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-[#f1f6f3] scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="bg-white rounded-xl border px-5">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#0e3b2e] text-white p-8 md:p-10 space-y-4">
            <CalendarCheck className="w-8 h-8 text-[#ffc72c]" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">Ready to drive?</h2>
            <p className="text-green-50/90">Create an account, upload your documents once, and send a request to any owner.</p>
            <Link to="/join?role=driver" className="inline-flex h-11 items-center px-6 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Sign up as a driver</Link>
          </div>
          <div className="rounded-2xl border-2 border-[#0e3b2e] p-8 md:p-10 space-y-4">
            <KeyRound className="w-8 h-8 text-[#00873a]" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">Put your car to work</h2>
            <p className="text-gray-600">List your car, set your weekly rate, and choose which drivers you hand the keys to.</p>
            <Link to="/join?role=owner" className="inline-flex h-11 items-center px-6 rounded-lg bg-[#0e3b2e] text-white font-semibold hover:bg-[#0a2c22]">List your car</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
