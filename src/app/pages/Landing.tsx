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
import { CountUp, HeroAmbient, Magnetic, SplitWords } from "../components/Motion";
import { useTitle } from "../../lib/useTitle";

const DRIVER_STEPS = [
  { title: "Create your account", text: "Sign up and upload your ID, driver's licence and PrDP once. Our team reviews them, so owners know exactly who they're renting to." },
  { title: "Choose a car", text: "Filter by platform and weekly rate. Every listing shows the rate, deposit and which platforms the car is approved for." },
  { title: "Agree the terms", text: "When the owner accepts your request, you both read and accept a written agreement covering fines, repairs, insurance and damage." },
  { title: "Collect the car and drive", text: "Pay the deposit, then weekly rent on schedule. Every payment is recorded, so there's never an argument about what's been paid." },
];
const OWNER_STEPS = [
  { title: "List your car", text: "Add photos, your weekly rate, the deposit and the platforms the car qualifies for." },
  { title: "Review requests", text: "See each driver's request, platform and verified documents before you decide. You choose who drives your car." },
  { title: "Confirm insurance and sign", text: "Confirm the car is insured for e-hailing, accept the agreement, and hand over the keys once both sides have signed." },
  { title: "Track your income", text: "A weekly payment schedule is created for you. Mark payments received, or let the driver pay online." },
];
const FAQ = [
  ["What do I need to rent a car as a driver?", "A valid South African ID or passport, a driver's licence and a Professional Driving Permit (PrDP). You'll also need an approved driver account on Uber, inDrive or Bolt. Each platform has its own driver and vehicle requirements, so check their current rules before you request a car."],
  ["How much does it cost?", "Each owner sets their own weekly rate and refundable deposit, shown on every listing before you send a request. The total for your rental period is calculated for you on the car's page."],
  ["Who pays for insurance, repairs and fines?", "The owner confirms the car is insured for e-hailing use and pays for scheduled servicing and wear-and-tear repairs. The driver pays for fuel, traffic fines, tolls and damage caused by negligence. These terms are written into the rental agreement both sides accept before handover."],
  ["Can I end up owning the car?", "Not through a normal rental: a car you rent on the marketplace stays the owner's. If ownership is your goal, our Drive to Own programme is built for it. You join a verified driver group, we buy the car, and part of each payment counts toward owning it."],
  ["Can I drive for more than one platform?", "Yes, if the owner has approved the car for them. When you send a request, you choose the platform you will drive on."],
  ["How do payments work?", "Once the car is handed over, a payment schedule is created: the deposit up front, then rent every week. Owners confirm each payment they receive, and drivers can pay online where it is enabled."],
  ["Is Drive2Own part of Uber, inDrive or Bolt?", "No. Drive2Own is independent and is not affiliated with, endorsed by or sponsored by Uber, Bolt or inDrive. On the marketplace, the rental agreement is between the owner and the driver."],
  ["Who can see my documents?", "Only you, Drive2Own's review team, and an owner you have sent a request to. Documents are stored privately and are never shown publicly. See our privacy policy for details."],
];

/** Two-option segmented control with a sliding pill. */
function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const idx = options.findIndex(([k]) => k === value);
  return (
    <div role="tablist" className="seg rounded-lg border p-1 bg-gray-50" data-active={idx}>
      <span className="seg-pill" aria-hidden />
      {options.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`px-5 py-2 rounded-md text-sm font-medium ${value === k ? "text-white" : "text-gray-700 hover:text-[#0e3b2e]"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

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
      <section className="hero-ambient bg-[#0e3b2e] text-white">
        <HeroAmbient />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              <SplitWords text="Rent a car this week." delay={80} />{" "}
              <SplitWords text="Work toward owning one." delay={380} wordClassName="text-shimmer" />
            </h1>
            <p className="enter text-lg text-green-50/90 max-w-xl" style={{ ["--d" as string]: 700 }}>
              Rent a car from a verified owner and start driving on Uber, Bolt or inDrive, with the weekly rate, deposit and terms in writing before you commit. When you're ready, our Drive to Own programme gives you a structured path to a car in your own name.
            </p>
            <div className="enter flex flex-col sm:flex-row gap-3" style={{ ["--d" as string]: 850 }}>
              <Magnetic><Link to="/vehicles" className="btn-premium w-full inline-flex items-center justify-center h-12 px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Find a car</Link></Magnetic>
              <Magnetic><Link to="/drive-to-own" className="btn-ghost-premium w-full inline-flex items-center justify-center h-12 px-7 rounded-lg border border-white/40 font-semibold hover:bg-white/10">Explore Drive to Own</Link></Magnetic>
            </div>
          </div>

          <div className="enter-card bg-white text-[#10201a] rounded-2xl p-6 shadow-2xl shadow-black/30" style={{ ["--d" as string]: 550 }}>
            <h2 className="font-display text-xl font-bold">Cars available now</h2>
            <p className="text-sm text-gray-600 mb-4">Pick the platform you drive on.</p>
            <ul className="divide-y">
              {byPlatform.map((p) => (
                <li key={p.id}>
                  <Link to={`/vehicles?platform=${p.id}`} className="flex items-center justify-between py-4 group -mx-2 px-2 rounded-lg transition-colors hover:bg-[#f1f6f3]">
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-sm text-gray-600">
                        {vehicles === null ? <span className="shimmer inline-block h-3.5 w-36 align-middle" aria-label="Loading" />
                          : p.count === 0 ? "No cars listed yet"
                          : <><CountUp value={p.count} /> {p.count === 1 ? "car" : "cars"} · from <CountUp value={p.from!} format={money} /> a week</>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#00873a]" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/join?role=owner" className="link-arrow block text-center text-sm font-medium text-[#00873a] pt-3 border-t">Own a car? List it and earn weekly <span className="arr">→</span></Link>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-[#f1f6f3] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-[auto_1fr] gap-4 md:gap-10 items-center">
          <h2 className="font-display text-xl font-bold">What drivers need to apply</h2>
          <Reveal as="ul" stagger className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {["SA ID or passport", "Valid driver's licence", "Professional Driving Permit (PrDP)", "An approved Uber, inDrive or Bolt driver account"].map((x) => (
              <li key={x} className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00873a] shrink-0" />{x}</li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-20 scroll-mt-16">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold max-w-xl">From sign-up to the driver's seat in four steps</h2>
            <Seg value={tab} onChange={setTab} options={[["drivers", "I'm a driver"], ["owners", "I own a car"]]} />
          </div>
          <Reveal as="ol" stagger key={tab} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="step-rule border-t-2 border-[#e3f1e9] pt-4">
                <div className="font-display text-3xl font-bold text-[#00873a] mb-2">{i + 1}</div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
              </li>
            ))}
          </Reveal>
        </Reveal>
      </section>

      {/* Calculators */}
      <section id="calculator" className="py-16 md:py-20 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Run the numbers first</h2>
                <p className="text-gray-600 max-w-xl">See what a rental could mean for you before you commit. The figures are examples, so change any of them to match your own situation.</p>
              </div>
              <Seg value={calc} onChange={setCalc} options={[["drivers", "Driver earnings"], ["owners", "Owner income"]]} />
            </div>
            <div className="rounded-2xl border p-6 md:p-8 transition-shadow duration-500 hover:shadow-[0_24px_60px_-36px_rgba(14,59,46,0.45)]"><div key={calc} className="swap-in">{calc === "drivers" ? <DriverCalculator /> : <OwnerCalculator />}</div></div>
          </Reveal>
        </div>
      </section>

      {/* Available now */}
      {vehicles && vehicles.length > 0 && (
        <section className="py-16 bg-[#f1f6f3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-display text-3xl font-bold">Available now</h2>
              <Link to="/vehicles" className="link-arrow text-[#00873a] font-medium">View all cars <span className="arr">→</span></Link>
            </div>
            <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.slice(0, 6).map((v) => <VehicleCard key={v.id} v={v} />)}
            </Reveal>
          </div>
        </section>
      )}

      {/* Protections */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal><h2 className="font-display text-3xl md:text-4xl font-bold max-w-2xl mb-3">Clear terms for owners and drivers</h2>
          <p className="text-gray-600 max-w-2xl mb-10">Renting a car for e-hailing works best when nobody is guessing. Drive2Own puts who pays for what, and what happens if something goes wrong, in writing before the keys change hands.</p></Reveal>
          <Reveal stagger className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            {protections.map((p) => (
              <div key={p.title} className="group spotlight flex gap-4 rounded-2xl p-5 -m-1 border border-transparent transition-colors duration-500 hover:border-[#e3f1e9]">
                <div className="icon-pop w-11 h-11 shrink-0 rounded-lg bg-[#e3f1e9] flex items-center justify-center"><p.icon className="w-5 h-5 text-[#00873a]" /></div>
                <div>
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Drive to Own */}
      <section className="hero-ambient py-16 md:py-24 bg-[#0e3b2e] text-white">
        <HeroAmbient />
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-block rounded-full bg-[#ffc72c] text-[#10201a] text-xs font-semibold px-3 py-1">New · By application</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Stop renting forever. Drive to Own.</h2>
            <p className="text-green-50/90 max-w-xl">
              Join a small group of verified drivers who each pay a fixed monthly contribution. When your turn comes, we buy an inspected, insured and tracked car,
              and every payment you make after that counts toward owning it.
            </p>
            <Magnetic><Link to="/drive-to-own" className="btn-premium inline-flex h-12 items-center px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">How Drive to Own works</Link></Magnetic>
          </div>
          <Reveal as="ul" stagger className="grid sm:grid-cols-2 gap-4">
            {[
              ["All-in cost up front", "Insurance, tracking and servicing shown before you sign."],
              ["Money kept separate", "Group contributions are never mixed with company funds."],
              ["Written agreement", "A plain-language contract with a one-page summary."],
              ["Ownership in your name", "We handle the paperwork when your last payment clears."],
            ].map(([t, d]) => (
              <li key={t} className="spotlight on-dark lift rounded-xl bg-white/5 border border-white/15 hover:border-white/30 p-5 backdrop-blur-sm">
                <div className="font-semibold mb-1">{t}</div>
                <div className="text-sm text-green-50/80">{d}</div>
              </li>
            ))}
          </Reveal>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-[#f1f6f3] scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal><h2 className="font-display text-3xl font-bold mb-8">Frequently asked questions</h2></Reveal>
          <Reveal variant="fade"><Accordion type="single" collapsible className="bg-white rounded-xl border px-5">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion></Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 md:py-20">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="group spotlight on-dark lift rounded-2xl bg-[#0e3b2e] text-white p-8 md:p-10 space-y-4">
            <CalendarCheck className="icon-pop w-8 h-8 text-[#ffc72c]" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">Ready to drive?</h2>
            <p className="text-green-50/90">Create an account, upload your documents once, and send a request to any owner.</p>
            <Link to="/join?role=driver" className="btn-premium inline-flex h-11 items-center px-6 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Sign up as a driver</Link>
          </div>
          <div className="group spotlight lift rounded-2xl border-2 border-[#0e3b2e] p-8 md:p-10 space-y-4">
            <KeyRound className="icon-pop w-8 h-8 text-[#00873a]" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">Put your car to work</h2>
            <p className="text-gray-600">List your car, set your weekly rate, and choose which drivers you hand the keys to.</p>
            <Link to="/join?role=owner" className="btn-premium inline-flex h-11 items-center px-6 rounded-lg bg-[#0e3b2e] text-white font-semibold hover:bg-[#0a2c22]">List your car</Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
