import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  AlertTriangle, BadgeCheck, Building2, Check, FileSignature, Landmark, Minus,
  ReceiptText, ShieldCheck, Users, Wrench, X,
} from "lucide-react";
import { useTitle } from "../../lib/useTitle";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
const interestHref = CONTACT
  ? `mailto:${CONTACT}?subject=${encodeURIComponent("Drive to Own: register my interest")}`
  : "/join?role=driver";

const STEPS = [
  { title: "Apply and get verified", text: "We check your ID, driver's licence, PrDP, e-hailing history and affordability. Every driver in your group passes the same checks you do." },
  { title: "Join a driver group", text: "You and a small group of other approved drivers each pay the same fixed monthly contribution into a dedicated group account." },
  { title: "Get your vehicle", text: "When your turn comes, Drive2Own buys an inspected vehicle, registers it, insures it and fits a tracker. You start driving under a written rent-to-own agreement." },
  { title: "Drive and pay", text: "You pay a fixed weekly or monthly amount. Your agreement states exactly how much of each payment counts toward owning the car." },
  { title: "Own it", text: "When every payment in your agreement is made, ownership moves into your name. We prepare the change-of-ownership paperwork." },
];

const COSTS = [
  { item: "Group contribution", note: "Same amount for every member of your group" },
  { item: "Vehicle rental and ownership credit", note: "The share credited toward ownership is written into your agreement" },
  { item: "Comprehensive insurance", note: "Covers e-hailing use" },
  { item: "Tracker and monitoring", note: "Fitted before handover" },
  { item: "Scheduled servicing", note: "With service reminders and a maintenance record" },
  { item: "Tyres and licence renewal", note: "Shown as a line item, whether included or extra" },
];

const PROTECTIONS = [
  {
    icon: Landmark, title: "Your contributions",
    points: [
      "Held in a dedicated account, separate from Drive2Own's operating money",
      "Payments out of the group account need two authorised people to approve them",
      "A monthly statement showing what came in, what vehicles were bought and the balance",
      "Independent review of the group account",
    ],
  },
  {
    icon: Wrench, title: "The vehicle",
    points: [
      "Independent pre-purchase inspection on every car",
      "NaTIS and outstanding-finance checks before we buy",
      "Comprehensive insurance, GPS tracking and recovery",
      "Service reminders and a full maintenance record",
    ],
  },
  {
    icon: FileSignature, title: "You, as a driver",
    points: [
      "A plain-language agreement with a one-page summary of the key terms",
      "Your cancellation rights explained before you sign",
      "Every fee on a published fee schedule, with no hidden charges",
      "A formal complaints process with set response times",
    ],
  },
  {
    icon: Users, title: "The whole group",
    points: [
      "Every member is verified before joining",
      "Clear rules on missed payments, so one person's default doesn't quietly hurt everyone",
      "A reserve and a replacement-member process for when someone leaves",
      "A registered company behind the group, with directors you can contact",
    ],
  },
];

const IF_WRONG = [
  ["You miss a payment", "We contact you quickly, offer a payment arrangement where we can, and only then apply the late-payment steps in your agreement."],
  ["You can't continue", "Your agreement sets out what is refunded, what is kept and why, depending on how far along you are."],
  ["Accident or theft", "The insurance policy applies, and we guide you through the claim."],
  ["Another member stops paying", "The group reserve and replacement-member process apply, as set out in the group rules."],
  ["You have a dispute", "Our internal complaints process first, then mediation or the relevant ombud."],
];

type Cell = boolean | string | null;
const COMPARE: { label: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { label: "Registered company behind it", cells: [true, false, true, null] },
  { label: "Written terms", cells: [true, "Often not", true, null] },
  { label: "Money kept separate", cells: [true, "Depends on the group", true, "Your own account"] },
  { label: "Perfect credit record needed", cells: [false, false, "Usually", false] },
  { label: "How soon you get a car", cells: ["Group schedule", "Slow", "Fast, if approved", "Slowest"] },
  { label: "Full monthly cost shown up front", cells: [true, false, "Often partly", null] },
];

const FAQ = [
  ["Is this a stokvel?", "No. A stokvel is an informal savings group that runs on trust, usually with no standard contract. Drive to Own uses a group contribution model, but run by a registered company, with verified members, written agreements and money kept separate from company funds."],
  ["How is this different from renting a car on Drive2Own?", "On the marketplace, you rent a car from a private owner week by week and the car stays theirs. On Drive to Own, Drive2Own buys the car and part of every payment you make counts toward owning it."],
  ["Who owns the car while I'm paying?", "Drive2Own holds ownership until your agreement is complete. You have the right to use the car under your agreement, and ownership transfers to you once you have met its terms."],
  ["Is my money safe?", "Contributions are kept in a dedicated account, separate from our operating money, with monthly statements and independent review. No arrangement is completely without risk, and we set out the main risks in your agreement."],
  ["What if I lose access to my e-hailing account?", "Talk to us straight away. Your agreement explains the grace period, the option to move to another platform, and your exit terms."],
  ["Can I pay off early?", "Your agreement states whether early settlement is possible and exactly how the settlement amount is worked out."],
  ["Do you do credit checks?", "Yes, as part of verification and the affordability assessment. A thin or imperfect credit record doesn't rule you out on its own, and you can ask us for the outcome."],
  ["Is Drive2Own part of Uber, Bolt or inDrive?", "No. Drive2Own is independent and is not affiliated with, endorsed by or sponsored by any e-hailing platform."],
];

function CellView({ v }: { v: Cell }) {
  if (v === true) return <Check className="w-5 h-5 text-[#00873a] mx-auto" aria-label="Yes" />;
  if (v === false) return <X className="w-5 h-5 text-gray-400 mx-auto" aria-label="No" />;
  if (v === null) return <Minus className="w-5 h-5 text-gray-300 mx-auto" aria-label="Not applicable" />;
  return <span className="text-sm text-gray-700">{v}</span>;
}

export function DriveToOwn() {
  useTitle("Drive to Own: rent-to-own cars for e-hailing drivers");

  return (
    <div className="min-h-screen bg-white text-[#10201a]">
      <Header />

      {/* Hero */}
      <section className="bg-[#0e3b2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-[#ffc72c] text-[#10201a] text-xs font-semibold px-3 py-1">By application · Opening in phases</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">Drive today. Own tomorrow.</h1>
            <p className="text-lg text-green-50/90 max-w-xl">
              Drive to Own is our rent-to-own programme for Uber, Bolt and inDrive drivers. You join a small group of verified drivers,
              we buy the car, and every payment you make moves you closer to a vehicle registered in your name.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={interestHref} className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Register your interest</a>
              <a href="#how" className="inline-flex items-center justify-center h-12 px-7 rounded-lg border border-white/40 font-semibold hover:bg-white/10">See how it works</a>
            </div>
          </div>
          <div className="bg-white/5 border border-white/15 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold">What makes it different</h2>
            {[
              [ReceiptText, "The full monthly cost before you sign, not just a headline instalment"],
              [ShieldCheck, "Every car inspected, insured and tracked"],
              [FileSignature, "Everything in a plain-language written agreement"],
              [Building2, "Run by a registered company you can find and hold to its word"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Check;
              return (
                <div key={text as string} className="flex gap-3 text-sm text-green-50/90">
                  <I className="w-5 h-5 text-[#ffc72c] shrink-0" />{text as string}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 md:py-20">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Most drivers can't get finance. Informal groups carry real risk.</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>Most e-hailing drivers don't have a deposit, a perfect credit record or cash to buy a car. Bank finance, when it's approved, means a monthly instalment with insurance, servicing, tyres and licensing on top.</p>
            <p>Savings groups can work, but they run on trust alone, usually with no written terms and no one accountable when something goes wrong.</p>
            <p className="font-medium text-[#10201a]">Drive to Own keeps the strength of a group and adds the structure of a company: verification, written agreements, separate accounts and regular statements.</p>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-20 bg-[#f1f6f3] scroll-mt-16">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How it works</h2>
          <p className="text-gray-600 max-w-2xl mb-10">You'll know your group size, your monthly contribution and your expected turn window before you join. Turns are allocated by a published schedule or a recorded draw that members can witness.</p>
          <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-[#00873a] pt-4">
                <div className="font-display text-3xl font-bold text-[#00873a] mb-2">{i + 1}</div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Costs */}
      <section className="py-16 md:py-20">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">One all-in monthly figure</h2>
            <p className="text-gray-600 mb-6">Before you sign, you get a Total Monthly Cost Summary that lists every item below, with its amount and whether it's included. Use it to compare us honestly with any other offer.</p>
            <div className="rounded-2xl bg-[#0e3b2e] text-white p-6 space-y-2">
              <div className="text-xs uppercase tracking-wide text-[#ffc72c] font-semibold">Why this matters</div>
              <p className="text-green-50/90 text-sm leading-relaxed">
                A finance offer advertised at R6,000 a month can come closer to R11,000 once insurance, servicing, tyres and licence costs are added.
                That's why we show the all-in figure first. <span className="text-green-50/60">(Illustrative example only. Your figures are in your own agreement.)</span>
              </p>
            </div>
          </div>
          <ul className="divide-y border rounded-2xl">
            {COSTS.map((c) => (
              <li key={c.item} className="flex gap-4 p-5">
                <Check className="w-5 h-5 text-[#00873a] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{c.item}</div>
                  <div className="text-sm text-gray-600">{c.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Protections */}
      <section id="protection" className="py-16 md:py-20 bg-[#f1f6f3] scroll-mt-16">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 max-w-2xl">How we protect you</h2>
          <p className="text-gray-600 max-w-2xl mb-10">You're trusting us with your money and your income, so we're open about how the programme reduces risk.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {PROTECTIONS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#e3f1e9] flex items-center justify-center"><p.icon className="w-5 h-5 text-[#00873a]" /></div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                </div>
                <ul className="space-y-2">
                  {p.points.map((x) => (
                    <li key={x} className="flex gap-2 text-sm text-gray-700"><BadgeCheck className="w-4 h-4 text-[#00873a] shrink-0 mt-0.5" />{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* If something goes wrong */}
      <section className="py-16 md:py-20">
        <Reveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">If something goes wrong</h2>
          <dl className="divide-y border rounded-2xl">
            {IF_WRONG.map(([s, w]) => (
              <div key={s} className="grid sm:grid-cols-[14rem_1fr] gap-1 sm:gap-6 p-5">
                <dt className="font-semibold">{s}</dt>
                <dd className="text-gray-700 text-sm leading-relaxed">{w}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">The honest limits</h3>
              <p className="text-sm text-gray-700 leading-relaxed">No model is risk-free. Turns can be delayed, vehicle prices can change, and e-hailing income goes up and down. Drive to Own is designed to reduce these risks and explain them clearly, not to pretend they don't exist.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Compare */}
      <section className="py-16 md:py-20 bg-[#f1f6f3]">
        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Compare your options</h2>
          <p className="text-gray-600 max-w-2xl mb-8">No single option suits everyone. Whatever you choose, compare them with the full monthly cost in front of you.</p>
          <div className="overflow-x-auto bg-white rounded-2xl border">
            <table className="w-full min-w-[640px] text-center">
              <thead>
                <tr className="border-b text-sm">
                  <th className="text-left p-4 font-semibold"></th>
                  <th className="p-4 font-semibold bg-[#e3f1e9] text-[#0e3b2e]">Drive to Own</th>
                  <th className="p-4 font-semibold">Informal stokvel</th>
                  <th className="p-4 font-semibold">Bank finance</th>
                  <th className="p-4 font-semibold">Saving cash alone</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {COMPARE.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="text-left p-4 text-sm font-medium">{r.label}</th>
                    {r.cells.map((c, i) => <td key={i} className={`p-4 ${i === 0 ? "bg-[#f4faf6]" : ""}`}><CellView v={c} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Who it's for */}
      <section className="py-16 md:py-20">
        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">Is it right for you?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-[#00873a] p-6">
              <h3 className="font-semibold text-lg mb-4">A good fit if you</h3>
              <ul className="space-y-2">
                {["Drive full-time or regularly on Uber, Bolt, inDrive or similar", "Want to own a car, not rent one forever", "Can commit to the same amount every month", "Are comfortable in a group where everyone relies on on-time payments"].map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-[#00873a] shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold text-lg mb-4">Probably not right if you</h3>
              <ul className="space-y-2">
                {["Need a car immediately. Our marketplace may suit you better", "Have income too low or irregular to cover the monthly commitment", "Plan to stop driving or leave the country soon"].map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-gray-700"><X className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Link to="/vehicles" className="inline-block mt-4 text-sm font-medium text-[#00873a] hover:underline">Rent a car now instead →</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#f1f6f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold mb-8">Drive to Own questions</h2>
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

      {/* Apply */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0e3b2e] text-white p-8 md:p-12 grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-bold">Ready to start?</h2>
              <p className="text-green-50/90">Register your interest and we'll contact you when a group opens in your area. Creating a driver account now and uploading your documents gets you verified sooner.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={interestHref} className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#ffc72c] text-[#10201a] font-semibold hover:bg-[#ffd25a]">Register your interest</a>
                <Link to="/join?role=driver" className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-white/40 font-semibold hover:bg-white/10">Create a driver account</Link>
              </div>
            </div>
            <div className="bg-white/5 border border-white/15 rounded-xl p-5">
              <div className="flex items-center gap-2 font-semibold mb-3"><BadgeCheck className="w-4 h-4 text-[#ffc72c]" />Documents to have ready</div>
              <ul className="space-y-1.5 text-sm text-green-50/90">
                {["SA ID or valid work permit", "Driver's licence and PrDP", "Proof of address", "3 to 6 months of e-hailing earnings or bank statements"].map((x) => <li key={x}>• {x}</li>)}
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            Drive to Own is subject to verification, an affordability assessment and acceptance. Figures on this page are illustrative; your amounts and terms are those in your signed agreement.
            This page is general information, not financial advice. Read your agreement carefully and get independent advice if you're unsure.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
