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
import { Eyebrow } from "../components/Layout";
import { CountUp, HeroAmbient, Magnetic, ScrollRoad, SplitWords, TiltStage } from "../components/Motion";
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
const FAQ_GROUPS: { id: string; label: string; items: [string, string][] }[] = [
  { id: "drivers", label: "For drivers", items: [
    ["What do I need to rent a car?", "You must be at least 21 and hold a valid South African ID or passport (with a valid work permit if you are not a South African citizen or permanent resident), a valid driver's licence and a Professional Driving Permit (PrDP). You also need an active driver account on Uber, Bolt or inDrive. At sign-up you upload your ID, licence, PrDP, proof of residence, 3 months of bank or earnings statements and a screenshot of your driver profile."],
    ["How long does verification take?", "Our team reviews documents as they arrive, usually within 1 to 2 business days. You'll get a notification when each document is verified, or a clear reason if it needs replacing. You can browse cars and save favourites while you wait."],
    ["How do I rent a car?", "Find a car approved for your platform, choose a start date and rental length, and send the owner a request. If the owner approves, you both read and accept a written rental agreement. You pay the deposit, collect the car and pay rent weekly. Every payment is recorded on your dashboard."],
    ["Can I drive for more than one platform?", "Yes, if the owner has approved the car for each platform. You choose the platform you'll drive on when you send a request, and the rental agreement records which platforms are allowed."],
    ["Who pays for fuel, fines and tolls?", "The driver pays for fuel, traffic fines, AARTO penalties, tolls and e-tolls incurred during the rental, and must nominate themselves as the driver if a fine is issued in the owner's name. The owner pays for scheduled servicing and wear-and-tear repairs. The rental agreement sets this out in writing before handover."],
    ["What happens if I have an accident or the car is stolen?", "Make sure everyone is safe, report it to the police where required, and tell the owner within 24 hours. The owner's e-hailing insurance applies according to its terms. You may be liable for the excess or for damage caused by negligence, as set out in your rental agreement."],
    ["Can someone else drive the car?", "No. Only the verified driver named in the rental agreement may drive the car. Letting someone else drive, or sub-letting the car, is a serious breach of the agreement and of our terms."],
    ["Can I own the car I rent?", "Not through a marketplace rental: those cars belong to their owners. If owning a car is your goal, our Drive to Own programme is built for it. You join a verified driver group, Drive2Own buys the car, and part of each payment counts toward ownership."],
  ] },
  { id: "owners", label: "For owners", items: [
    ["What does it cost to list my car?", "Listing is currently free. You set your own weekly rate and refundable deposit. If we ever introduce a fee, we'll tell you the amount before you pay anything."],
    ["What do I need to list a car?", "Your ID or passport (or company registration), proof of residence, a bank confirmation letter for rent payments, the vehicle's registration certificate and an insurance schedule showing comprehensive cover that includes e-hailing use."],
    ["How do I choose a driver?", "You see each driver's request, their chosen platform and their verified documents before you decide. You approve or decline every request yourself, and the car is only handed over once you've both accepted the rental agreement."],
    ["Does my insurance need to cover e-hailing?", "Yes. Most standard private policies exclude e-hailing. Before handover you confirm on the platform that the car is comprehensively insured for e-hailing use. You're also responsible for any operating licence required for the car."],
    ["How do I get paid?", "A weekly payment schedule is created when you hand over the car. Drivers pay you directly or online through the platform where enabled. You confirm payments you receive directly, and online payments are recorded automatically."],
    ["What if a driver damages the car or stops paying?", "Your rental agreement covers late payment, damage, fines and early termination. You may deduct amounts the driver is liable for from the deposit, with an itemised statement and evidence. Our complaints process can help where you and the driver disagree."],
  ] },
  { id: "payments", label: "Payments & deposits", items: [
    ["How are payments made?", "The deposit is paid at handover and rent is paid weekly in advance, either directly to the owner or online through PayFast where enabled. All amounts are in rand and every payment is recorded on the platform."],
    ["When do I get my deposit back?", "Within 7 business days of returning the car, less any lawful deductions such as unpaid rent, fines incurred during the rental or damage beyond fair wear and tear. Every deduction must come with an itemised statement and evidence. See our refund and cancellation policy for details."],
    ["Can I cancel a request?", "Yes, free of charge, at any time before the car is handed over. Anything you've paid is refunded in full within 7 business days."],
    ["Can I end a rental early?", "Yes, by giving the notice in your rental agreement and returning the car. Rent for the current week isn't refundable, but rent you've paid for later full weeks is refunded within 7 business days, less any reasonable cancellation penalty the law allows."],
    ["What if the car breaks down?", "If the car can't be used for more than 48 hours through no fault of yours, and no replacement is provided, you're entitled to a pro rata refund or credit of rent for each full day."],
  ] },
  { id: "verification", label: "Verification & privacy", items: [
    ["Why do you ask for my ID number, income and source of funds?", "To verify every member, assess affordability, and apply anti-money-laundering standards consistent with the Financial Intelligence Centre Act (FICA). This protects owners, drivers and Drive2Own from fraud. Your information is kept confidential and handled under POPIA."],
    ["Who can see my documents?", "Only you, Drive2Own's review team and an owner you've sent a rental request to. Documents are stored privately and are never public. Phone numbers are shared between owner and driver only after a request is approved."],
    ["Do you run credit checks?", "With your consent, we may verify your identity and run credit-bureau and fraud-prevention checks, in line with the National Credit Act. A thin or imperfect credit record doesn't automatically rule you out."],
    ["What is a “prominent public official” and why do you ask?", "FICA guidance requires extra care where someone holds, or is closely linked to someone who holds, a senior public position, such as a member of Parliament, a judge or a head of a state-owned company. Answering yes doesn't stop you joining; it means we may ask a few more questions."],
    ["How do I access, correct or delete my information?", "Email us and we'll respond within the times set by POPIA and PAIA. Some records must be kept for 5 years after your account closes to meet legal obligations. Full details are in our privacy policy."],
  ] },
  { id: "account", label: "Account & support", items: [
    ["Is Drive2Own part of Uber, Bolt or inDrive?", "No. Drive2Own is independent and is not affiliated with, endorsed by or sponsored by any e-hailing platform. On the marketplace, the rental agreement is between the owner and the driver."],
    ["I forgot my password. What now?", "Use “Forgot password?” on the sign-in page. We'll send a 6-digit code to your registered phone number, valid for 15 minutes."],
    ["How do I make a complaint?", "Email our support team with your name, phone number and the details. We acknowledge complaints within 2 business days and aim to resolve them within 10 business days. If we can't resolve it, you can refer it to the relevant ombud."],
    ["Can I close my account?", "Yes, once any active rental or agreement has been completed or properly ended. Contact us and we'll close it. We keep certain records afterwards where the law requires it."],
  ] },
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
  const [faqTab, setFaqTab] = useState("drivers");
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
          <div className="scroll-out space-y-6">
            <div className="enter"><Eyebrow dark>E-hailing car rental · South Africa</Eyebrow></div>
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
            <div className="enter flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm text-green-50/70" style={{ ["--d" as string]: 1000 }}>
              <span>Cars approved for</span>
              {["Uber", "Bolt", "inDrive"].map((p) => <span key={p} className="rounded-full border border-white/20 px-3 py-1 font-semibold text-white/90">{p}</span>)}
            </div>
          </div>

          <TiltStage className="scroll-out-slow lg:mx-6">
          {/* Floating feature chips, layered at different depths (desktop only) */}
          <div className="hero-chip hidden lg:block -left-12 -top-14" data-depth style={{ ["--dx" as string]: "18px" }}>
            <span style={{ ["--d" as string]: 1250 }}><i><BadgeCheck className="w-4 h-4" /></i><span>Documents verified<small>ID · licence · PrDP</small></span></span>
          </div>
          <div className="hero-chip hidden lg:block -right-8 -bottom-16" data-depth style={{ ["--dx" as string]: "18px" }}>
            <span style={{ ["--d" as string]: 1450 }}><i><FileSignature className="w-4 h-4" /></i><span>Agreement accepted<small>by owner and driver</small></span></span>
          </div>
          <div className="tilt-card enter-card relative bg-white text-[#10201a] rounded-2xl p-6 shadow-2xl shadow-black/30" style={{ ["--d" as string]: 550 }}>
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
          </TiltStage>
        </div>
      </section>

      {/* At a glance */}
      <section aria-label="At a glance" className="bg-white border-b border-[#e3ebe6]">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4">
          {[
            ["3 platforms", "Cars approved for Uber, Bolt and inDrive"],
            ["Weekly", "Rent paid weekly, with every payment on record"],
            ["Upload once", "ID, licence and PrDP reviewed by our team"],
            ["In writing", "Agreement accepted by both sides before handover"],
          ].map(([k, v]) => (
            <div key={k} className="py-6 md:py-8 pr-4 odd:pl-0 even:pl-4 even:border-l border-[#e3ebe6] lg:px-6 lg:border-l lg:even:pl-6 lg:first:pl-0 lg:first:border-l-0">
              <div className="font-display text-2xl md:text-3xl font-extrabold text-[#0e3b2e]">{k}</div>
              <div className="mt-1 text-sm text-gray-600 max-w-[16rem]">{v}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Requirements */}
      <section className="bg-[#f1f6f3] border-b border-[#e3ebe6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 grid md:grid-cols-[auto_1fr] gap-4 md:gap-10 items-center">
          <h2 className="font-display text-lg font-bold">What drivers need to apply</h2>
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
            <div><Eyebrow className="mb-3">How it works</Eyebrow><h2 className="h-reveal font-display text-3xl md:text-4xl font-bold max-w-xl">From sign-up to the driver's seat in four steps</h2></div>
            <Seg value={tab} onChange={setTab} options={[["drivers", "I'm a driver"], ["owners", "I own a car"]]} />
          </div>
          <div className="hidden lg:block"><ScrollRoad steps={4} /></div>
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
                <Eyebrow className="mb-3">Plan with confidence</Eyebrow><h2 className="h-reveal font-display text-3xl md:text-4xl font-bold mb-2">Run the numbers first</h2>
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
              <div><Eyebrow className="mb-3">Marketplace</Eyebrow><h2 className="h-reveal font-display text-3xl md:text-4xl font-bold">Available now</h2></div>
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
          <Reveal><Eyebrow className="mb-3">Why Drive2Own</Eyebrow><h2 className="h-reveal font-display text-3xl md:text-4xl font-bold max-w-2xl mb-3">Clear terms for owners and drivers</h2>
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
            <h2 className="h-reveal font-display text-3xl md:text-4xl font-bold">Stop renting forever. Drive to Own.</h2>
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
      <section id="faq" className="py-16 md:py-24 bg-[#f1f6f3] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
          <Reveal className="lg:sticky lg:top-28 space-y-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="h-reveal font-display text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
            <p className="text-gray-600">Straight answers about renting, listing, payments, deposits and how we protect your information.</p>
            <div role="tablist" aria-label="FAQ topics" className="flex flex-wrap lg:flex-col gap-2 pt-2">
              {FAQ_GROUPS.map((g) => (
                <button key={g.id} role="tab" aria-selected={faqTab === g.id} onClick={() => setFaqTab(g.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${faqTab === g.id ? "bg-[#0e3b2e] text-white shadow-[0_10px_24px_-16px_rgba(14,59,46,0.9)]" : "bg-white border border-[#e3ebe6] text-gray-700 hover:border-[#b9cdc1]"}`}>
                  {g.label} <span className={faqTab === g.id ? "text-white/60" : "text-gray-400"}>· {g.items.length}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 pt-2">Read the full <Link to="/terms" className="text-[#00873a] font-medium hover:underline">terms</Link>, <Link to="/privacy" className="text-[#00873a] font-medium hover:underline">privacy policy</Link> and <Link to="/refunds" className="text-[#00873a] font-medium hover:underline">refund policy</Link>.</p>
          </Reveal>
          <div key={faqTab} className="swap-in">
            <Accordion type="single" collapsible defaultValue="q0" className="bg-white rounded-2xl border border-[#e3ebe6] px-5 sm:px-7 shadow-[0_24px_48px_-36px_rgba(14,59,46,0.35)]">
              {FAQ_GROUPS.find((g) => g.id === faqTab)!.items.map(([q, a], i) => (
                <AccordionItem key={q} value={`q${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold py-5 hover:no-underline hover:text-[#00873a]">{q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-[15px]">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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

      <Footer cta={false} />
    </div>
  );
}
