import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { Link } from "react-router";
import { FileText, Printer } from "lucide-react";
import { PageHero, PageShell } from "../components/Layout";
import { useTitle } from "../../lib/useTitle";

const CONTACT = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? null;
const EMAIL = CONTACT ?? "the support email address published on this website";
const UPDATED = "24 November 2026";
const COMPANY = "VINK Group (Pty) Ltd";
const REG = "2018/079316/07";

// ---------------------------------------------------------------------------
// Layout: numbered sections with a sticky table of contents.
// ---------------------------------------------------------------------------

function S({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Doc({ title, intro, children, related }: { title: string; intro: string; children: ReactNode; related: [string, string][] }) {
  useTitle(title);
  const sections = Children.toArray(children).filter(isValidElement) as ReactElement<{ id: string; title: string }>[];
  return (
    <PageShell hero={<PageHero compact eyebrow="Legal" crumbs={[{ label: title }]} title={title} subtitle={`Effective and last updated ${UPDATED}`} />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid lg:grid-cols-[260px_1fr] gap-10 items-start">
        <aside className="lg:sticky lg:top-24 space-y-5">
          <nav aria-label="Contents" className="rounded-2xl border border-[#e3ebe6] bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00873a] mb-3">Contents</div>
            <ol className="space-y-1.5 text-sm max-h-[50vh] overflow-y-auto pr-1">
              {sections.map((s) => (
                <li key={s.props.id}><a href={`#${s.props.id}`} className="block text-gray-600 hover:text-[#0e3b2e] transition-colors leading-snug py-0.5">{s.props.title}</a></li>
              ))}
            </ol>
          </nav>
          <div className="rounded-2xl border border-[#e3ebe6] bg-white p-5 space-y-2 text-sm">
            <div className="font-semibold">Related policies</div>
            {related.map(([to, l]) => <Link key={to} to={to} className="flex items-center gap-2 text-[#00873a] hover:underline"><FileText className="w-4 h-4" />{l}</Link>)}
            <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-600 hover:text-[#0e3b2e] pt-1"><Printer className="w-4 h-4" />Print or save as PDF</button>
          </div>
        </aside>
        <article className="legal rounded-3xl border border-[#e3ebe6] bg-white p-6 sm:p-10 lg:p-12">
          <p className="lead">{intro}</p>
          {children}
        </article>
      </div>
    </PageShell>
  );
}

function CompanyBlock() {
  return (
    <dl className="info">
      <div><dt>Trading name</dt><dd>Drive2Own</dd></div>
      <div><dt>Legal entity</dt><dd>{COMPANY}, a private company incorporated in South Africa (Drive2Own is a division)</dd></div>
      <div><dt>Registration number</dt><dd>{REG}</dd></div>
      <div><dt>Location</dt><dd>Cape Town, Western Cape, South Africa</dd></div>
      <div><dt>Email</dt><dd>{EMAIL}</dd></div>
      <div><dt>Website</dt><dd>{typeof window !== "undefined" ? window.location.host : "drive2own"}</dd></div>
    </dl>
  );
}

// ===========================================================================
// TERMS OF USE
// ===========================================================================

export function Terms() {
  return (
    <Doc title="Terms of use" related={[["/privacy", "Privacy policy"], ["/refunds", "Refund and cancellation policy"]]}
      intro="These terms of use form a legally binding agreement between you and Drive2Own. Please read them carefully, and in particular the clauses printed in bold, which limit our liability, place risk on you, or require you to indemnify us. By creating an account or using the platform, you confirm that you have read, understood and accept these terms.">

      <S id="t1" title="1. About us and these terms">
        <p>1.1 The Drive2Own platform, comprising the website, web application and related services (the <strong>“platform”</strong>), is operated by Drive2Own, a division of {COMPANY}, registration number {REG} (<strong>“Drive2Own”</strong>, <strong>“we”</strong>, <strong>“us”</strong> or <strong>“our”</strong>).</p>
        <p>1.2 The information below is provided in accordance with section 43 of the Electronic Communications and Transactions Act 25 of 2002 (<strong>“ECTA”</strong>):</p>
        <CompanyBlock />
        <p>1.3 These terms must be read together with our <Link to="/privacy">privacy policy</Link> and our <Link to="/refunds">refund and cancellation policy</Link>, which form part of these terms. Where you conclude a rental agreement, group agreement or rent-to-own agreement (each defined below), that agreement governs the transaction it covers. If there is a conflict between these terms and such an agreement, the agreement prevails in respect of that transaction.</p>
        <p>1.4 Nothing in these terms is intended to limit or exclude any right you have under the Consumer Protection Act 68 of 2008 (<strong>“CPA”</strong>), ECTA, the National Credit Act 34 of 2005 (<strong>“NCA”</strong>) or any other law that cannot lawfully be limited or excluded. Every provision must be read so as to comply with those laws.</p>
      </S>

      <S id="t2" title="2. Definitions">
        <p>In these terms, unless the context indicates otherwise:</p>
        <ul>
          <li><strong>“Account”</strong> means the account you register on the platform.</li>
          <li><strong>“Driver”</strong> means a user registered to rent a vehicle for use on an e-hailing platform.</li>
          <li><strong>“E-hailing platform”</strong> means a third-party ride-hailing service such as Uber, Bolt or inDrive.</li>
          <li><strong>“Owner”</strong> means a user registered to list a vehicle for rent, whether an individual or a juristic person.</li>
          <li><strong>“Rental agreement”</strong> means the written agreement between an owner and a driver for the rental of a vehicle, which both accept on the platform before handover.</li>
          <li><strong>“Drive to Own programme”</strong> means the rent-to-own programme operated by Drive2Own, described in clause 12.</li>
          <li><strong>“Group agreement”</strong> and <strong>“rent-to-own agreement”</strong> mean the written agreements you conclude when you join the Drive to Own programme.</li>
          <li><strong>“Verification documents”</strong> means the identity, residence, licensing, income, banking, vehicle and insurance documents we request under clause 5.</li>
          <li><strong>“Business day”</strong> means any day other than a Saturday, Sunday or South African public holiday.</li>
        </ul>
      </S>

      <S id="t3" title="3. What Drive2Own does, and does not do">
        <p>3.1 <strong>Marketplace.</strong> The platform enables owners to list vehicles and drivers to request them. When an owner approves a driver’s request, the owner and the driver conclude a rental agreement directly with each other.</p>
        <p>3.2 <strong>Drive2Own is not a party to rental agreements.</strong> Unless we expressly agree otherwise in writing, Drive2Own does not own, rent, insure, inspect or control the vehicles listed on the marketplace, and is not a party to any rental agreement. Each owner is solely responsible for its vehicle and listing, and each driver for their use of the vehicle.</p>
        <p>3.3 <strong>Verification is not a guarantee.</strong> We review verification documents to reduce risk. A verified status confirms only that a document was submitted and appeared genuine and current when reviewed. It is not a guarantee of any user’s identity, character, conduct, creditworthiness or driving ability.</p>
        <p>3.4 <strong>Independence.</strong> Drive2Own is independent and is not affiliated with, endorsed by or sponsored by Uber, Bolt, inDrive or any other e-hailing platform. Acceptance as a driver on any e-hailing platform is decided solely by that platform under its own terms.</p>
        <p>3.5 <strong>No earnings guarantee.</strong> Earnings estimates and calculators on the platform are illustrations based on figures you enter. They are not a promise or forecast of income.</p>
      </S>

      <S id="t4" title="4. Eligibility">
        <p>4.1 To register you must be at least 18 years old, have full legal capacity, and hold a valid South African identity document or a valid passport.</p>
        <p>4.2 To register as a driver you must, in addition, be at least 21 years old; hold a valid driving licence of the correct code and a valid Professional Driving Permit (<strong>“PrDP”</strong>) as required by the National Road Traffic Act 93 of 1996; where you are not a South African citizen or permanent resident, hold a valid work permit that allows you to work as a driver; and hold, or be in the process of obtaining, an active driver account on at least one e-hailing platform.</p>
        <p>4.3 To register as an owner you must be the registered owner or titleholder of the vehicle you list, or be lawfully authorised in writing by them and, where the vehicle is financed, by the credit provider. Where you register on behalf of a company, close corporation or trust, you warrant that you are authorised to bind it.</p>
        <p>4.4 We may refuse any registration, or ask for further information, at our discretion, acting reasonably and lawfully. We will never refuse a registration on a ground of unfair discrimination prohibited by section 9 of the Constitution or the CPA.</p>
      </S>

      <S id="t5" title="5. Registration, verification and FICA">
        <p>5.1 <strong>Information you provide.</strong> When you register you must provide accurate, current and complete information, including your full name, identity or passport number, date of birth, residential address, contact details, employment and income details, source of funds, and the declarations requested, and you must upload the verification documents required for your account type.</p>
        <p>5.2 <strong>Customer due diligence.</strong> We apply customer due diligence measures consistent with the Financial Intelligence Centre Act 38 of 2001 (<strong>“FICA”</strong>) and its guidance. These include verifying your identity and address, establishing your source of income and funds, screening for prominent influential persons and domestic prominent influential persons (together, <strong>“PEPs”</strong>) and against applicable sanctions lists, and ongoing monitoring of the business relationship.</p>
        <p>5.3 <strong>Reporting obligations.</strong> You acknowledge that, under section 29 of FICA, any person who carries on a business must report suspicious and unusual transactions to the Financial Intelligence Centre, and that we are prohibited by law from informing you that a report has been made. We may also be required to freeze, delay or decline a transaction, or end a relationship, where the law requires it.</p>
        <p>5.4 <strong>Verification checks.</strong> With your consent, given at registration, we may verify your information against government, credit-bureau, fraud-prevention and other lawful databases, and with e-hailing platforms where you have given them permission to share it. We will treat any credit enquiry in accordance with the NCA and its regulations.</p>
        <p>5.5 <strong>Keeping your information up to date.</strong> You must update your information within 7 days of any change, including a change of address, licence status, PrDP status, work permit status or e-hailing account status. We may ask you to re-verify periodically or where we reasonably suspect information is inaccurate.</p>
        <p>5.6 <strong>False information.</strong> <strong>Providing false, misleading or another person’s information or documents is a material breach of these terms. It entitles us to suspend or close your account immediately and may be reported to the South African Police Service and other authorities.</strong></p>
      </S>

      <S id="t6" title="6. Your account and security">
        <p>6.1 Your account is personal to you and may not be transferred, shared or sold. You may hold only one account per role.</p>
        <p>6.2 You are responsible for keeping your password confidential and for all activity on your account. Notify us immediately at {EMAIL} if you suspect unauthorised use. Drive2Own will never ask you for your password.</p>
        <p>6.3 We may rely on any instruction given through your account as having been given by you, unless you notified us of unauthorised access before the instruction was given.</p>
      </S>

      <S id="t7" title="7. Owners’ obligations">
        <p>7.1 Each owner warrants, for every listed vehicle and for the full period of every rental, that:</p>
        <ul>
          <li>(a) the vehicle is lawfully registered and licensed, roadworthy, and meets the vehicle requirements of each e-hailing platform for which it is listed;</li>
          <li>(b) the vehicle is covered by a comprehensive motor insurance policy that expressly covers use for e-hailing, and any operating licence or permit required for that use under the National Land Transport Act 5 of 2009 has been obtained, or the owner has disclosed in the listing which party is responsible for obtaining it;</li>
          <li>(c) the listing is accurate and complete, including the weekly rate, deposit, mileage limits, permitted platforms and any known defects;</li>
          <li>(d) the vehicle is maintained and serviced according to the manufacturer’s schedule, and any defect affecting safety is repaired before the vehicle is used; and</li>
          <li>(e) where a tracking device is fitted, the driver is told about it in the rental agreement before handover.</li>
        </ul>
        <p>7.2 Owners must review each driver’s request and verification status before approving it, and must not approve a driver they know or suspect is not properly licensed.</p>
        <p>7.3 Owners must return a driver’s deposit, and refund any rent paid for a period in which the vehicle was not made available, in accordance with the rental agreement and our <Link to="/refunds">refund and cancellation policy</Link>.</p>
        <p>7.4 Owners are responsible for declaring and paying any income tax and VAT due on rental income.</p>
      </S>

      <S id="t8" title="8. Drivers’ obligations">
        <p>8.1 Each driver must:</p>
        <ul>
          <li>(a) use the vehicle only personally, only for the purposes and on the e-hailing platforms permitted in the rental agreement, and in compliance with all laws, including the National Road Traffic Act and the rules of the e-hailing platform;</li>
          <li>(b) not allow any other person to drive the vehicle, and not sub-let, lend, pledge or sell it;</li>
          <li>(c) pay the deposit and weekly rent on time and in full;</li>
          <li>(d) pay all traffic fines, AARTO infringement penalties, tolls and e-toll charges incurred during the rental, and nominate themselves as the driver where a fine is issued in the owner’s name;</li>
          <li>(e) report any accident, theft, hijacking or damage to the owner and, where required, to the police, within 24 hours, and cooperate with any insurance claim;</li>
          <li>(f) keep the vehicle clean, secure and in the condition received, fair wear and tear excepted, and not tamper with any tracking device; and</li>
          <li>(g) return the vehicle at the end of the rental, at the agreed place and time, with the agreed fuel level.</li>
        </ul>
        <p>8.2 <strong>The driver is liable for loss of or damage to the vehicle caused by the driver’s negligence, wilful conduct or breach of the rental agreement, including any insurance excess, to the extent set out in the rental agreement.</strong></p>
      </S>

      <S id="t9" title="9. Rental agreements">
        <p>9.1 A rental agreement is concluded when the owner approves a request and both parties accept the written agreement on the platform. Acceptance by electronic means is legally binding in terms of ECTA.</p>
        <p>9.2 The rental agreement records, among other things, the vehicle, rental period, weekly rate, deposit, payment schedule, permitted use, insurance responsibilities, the allocation of fines, damage and repairs, and the process on return.</p>
        <p>9.3 The vehicle may be handed over only once both parties have accepted the rental agreement and, where applicable, the owner has confirmed e-hailing insurance cover.</p>
        <p>9.4 Disputes about the performance of a rental agreement are between the owner and the driver. We may, at our discretion, assist through our complaints process (clause 20), but are not obliged to resolve them.</p>
      </S>

      <S id="t10" title="10. Payments, deposits and fees">
        <p>10.1 All amounts are in South African rand and, where VAT is payable, include VAT unless stated otherwise.</p>
        <p>10.2 Rent and deposits may be paid directly to the owner, or through the platform’s online payment facility where available. Online payments are processed by a third-party payment service provider (currently PayFast). Where you pay through the platform, Drive2Own receives the payment as the owner’s limited agent for the purpose of collection only, and the driver’s obligation to the owner is discharged to the extent of the amount Drive2Own receives.</p>
        <p>10.3 The payment schedule is generated when the vehicle is handed over. Each payment is recorded on the platform. Owners must confirm payments received directly within 2 business days.</p>
        <p>10.4 Where Drive2Own charges a fee for any service, the fee, when it is payable and whether it is refundable will be disclosed to you before you incur it. We will not charge any fee that has not been disclosed in advance.</p>
        <p>10.5 Late payment may lead to the consequences set out in the rental agreement, which may include termination and the return of the vehicle. Drive2Own does not charge interest on late rent unless an agreement concluded with you in compliance with the NCA expressly provides for it.</p>
        <p>10.6 Refunds and the return of deposits are governed by our <Link to="/refunds">refund and cancellation policy</Link>.</p>
      </S>

      <S id="t11" title="11. Insurance, accidents and fines">
        <p>11.1 Owners are responsible for insuring vehicles for e-hailing use. Drivers should satisfy themselves about the scope of cover, the excess and any exclusions before taking a vehicle, and may arrange additional cover at their own cost.</p>
        <p>11.2 <strong>Drive2Own does not provide insurance on the marketplace and is not liable for any uninsured loss, excess, or claim repudiated by an insurer.</strong></p>
        <p>11.3 Fines and infringements are dealt with as set out in clause 8.1(d) and the rental agreement.</p>
      </S>

      <S id="t12" title="12. Drive to Own programme">
        <p>12.1 The Drive to Own programme is a rent-to-own programme operated by Drive2Own, in which approved drivers contribute to a ring-fenced group account. Vehicles are bought by Drive2Own and allocated to members in turn under a rent-to-own agreement, with ownership transferring once all amounts due have been paid.</p>
        <p>12.2 Participation is by application only, and is subject to verification, an affordability assessment and acceptance. We may decline an application, acting reasonably and lawfully.</p>
        <p>12.3 The amounts, the allocation method, the treatment of contributions, ownership credits, early settlement, default, withdrawal and refunds are set out in the group agreement, the rent-to-own agreement and the pre-agreement disclosure you receive before signing. To the extent that the NCA applies to any agreement, it will comply with the NCA, and you will have all the rights the NCA gives you.</p>
        <p>12.4 Figures on the platform about the programme are illustrative only. <strong>We do not guarantee that a vehicle will be allocated by a particular date, or the value of any vehicle at the end of an agreement.</strong></p>
      </S>

      <S id="t13" title="13. Vehicle tracking and data">
        <p>13.1 Vehicles may be fitted with tracking devices. Location data is processed to protect the vehicle, for recovery after theft or hijacking, and to enforce the rental or rent-to-own agreement, as described in our <Link to="/privacy">privacy policy</Link>.</p>
      </S>

      <S id="t14" title="14. Prohibited conduct">
        <p>You may not:</p>
        <ul>
          <li>(a) use the platform for any unlawful, fraudulent or misleading purpose, including money laundering or the financing of terrorism;</li>
          <li>(b) impersonate any person, or use another person’s identity, documents or account;</li>
          <li>(c) arrange or complete a rental found on the platform outside it in order to avoid these terms or any fee;</li>
          <li>(d) post false, defamatory, discriminatory or offensive content, or harass any user;</li>
          <li>(e) scrape, copy, reverse-engineer, overload or interfere with the platform or its security; or</li>
          <li>(f) send unsolicited marketing to other users.</li>
        </ul>
      </S>

      <S id="t15" title="15. Content and intellectual property">
        <p>15.1 All intellectual property in the platform, including its software, design, text and the Drive2Own name and logo, belongs to {COMPANY} or its licensors.</p>
        <p>15.2 You keep ownership of content you upload, such as vehicle photographs and descriptions. You grant us a non-exclusive, royalty-free licence to use it for operating and promoting the platform while it is listed, and you warrant that you are entitled to grant this licence.</p>
      </S>

      <S id="t16" title="16. Suspension and termination">
        <p>16.1 You may close your account at any time by notifying us, subject to completing or properly ending any active rental or agreement, and to our legal record-keeping obligations.</p>
        <p>16.2 We may suspend or close your account, remove a listing, or withhold access to a feature, on reasonable notice or, where reasonably necessary, immediately, if you breach these terms or an agreement; if we reasonably suspect fraud, unlawful activity or a risk to any person’s safety; if your verification documents expire or are rejected; or if the law requires it.</p>
        <p>16.3 Termination does not affect rights and obligations that arose before it, including obligations under any rental, group or rent-to-own agreement.</p>
      </S>

      <S id="t17" title="17. Disclaimers and limitation of liability">
        <p className="caps">17.1 To the extent permitted by law, including section 48 of the CPA, the platform is provided “as is” and “as available”. Drive2Own does not warrant that the platform will be uninterrupted, error-free or free of harmful components.</p>
        <p className="caps">17.2 To the extent permitted by law, Drive2Own will not be liable for any loss, damage, injury, death, fine, penalty, claim or expense arising from: (a) any vehicle, listing or rental agreement on the marketplace; (b) the acts or omissions of any owner, driver or third party; (c) any e-hailing platform’s decision about your driver account; or (d) any indirect, consequential or special loss, or loss of income or profit. This exclusion does not apply to loss caused by Drive2Own’s gross negligence or wilful misconduct, or where liability cannot be excluded under section 61 of the CPA or any other law.</p>
        <p className="caps">17.3 Where Drive2Own is liable to you, and to the extent permitted by law, its total liability in respect of any claim is limited to the fees you paid to Drive2Own in the 6 months before the event giving rise to the claim.</p>
      </S>

      <S id="t18" title="18. Indemnity">
        <p className="caps">To the extent permitted by law, you indemnify Drive2Own, {COMPANY} and their directors, employees and agents against any claim, loss, liability or expense (including reasonable legal costs on the attorney-and-client scale) arising from your breach of these terms or of any agreement concluded through the platform, your use of a vehicle, or your violation of any law or third-party right.</p>
      </S>

      <S id="t19" title="19. Your consumer rights">
        <p>19.1 Where you are a consumer as defined in the CPA or ECTA, you have the rights those Acts give you, including, where applicable, the right to cancel an electronic transaction within the cooling-off period in section 44 of ECTA, and the right to cancel a fixed-term agreement on 20 business days’ notice under section 14 of the CPA, subject to a reasonable cancellation charge where the law allows it.</p>
        <p>19.2 Details of how to cancel, and how refunds are handled, are in our <Link to="/refunds">refund and cancellation policy</Link>.</p>
      </S>

      <S id="t20" title="20. Complaints and disputes">
        <p>20.1 Please send any complaint to {EMAIL} with your name, phone number and the details of the complaint. We will acknowledge it within 2 business days and aim to resolve it within 10 business days, or tell you why more time is needed.</p>
        <p>20.2 If a complaint is not resolved, either party may refer it to mediation by an accredited mediator agreed between the parties, or to the relevant ombud, such as the Consumer Goods and Services Ombud or, for vehicle-related matters, the Motor Industry Ombudsman of South Africa. You may also approach the National Consumer Commission or, for credit matters, the National Credit Regulator or the National Consumer Tribunal.</p>
        <p>20.3 Nothing in this clause prevents either party from seeking urgent relief from a court of competent jurisdiction.</p>
      </S>

      <S id="t21" title="21. Notices and electronic communications">
        <p>21.1 You agree that we may communicate with you electronically, by email, SMS and in-app notification, and that such communications satisfy any legal requirement that they be in writing, in terms of ECTA.</p>
        <p>21.2 You choose the residential address you provided at registration as the address at which legal notices and court documents may be delivered to you (your <em>domicilium citandi et executandi</em>). We choose the address set out in clause 1.2, as updated on the platform from time to time.</p>
      </S>

      <S id="t22" title="22. Changes to these terms">
        <p>We may amend these terms to reflect changes in the law, our services or our practices. We will give you at least 20 business days’ notice of a material change by email or in-app notification, except where a change is required urgently by law. If you do not accept a change, you may close your account before it takes effect. Continued use after the effective date constitutes acceptance.</p>
      </S>

      <S id="t23" title="23. General">
        <p>23.1 These terms, together with the policies and agreements referred to in them, are the entire agreement between you and Drive2Own about the platform.</p>
        <p>23.2 If any provision is found to be unlawful or unenforceable, it will be severed, and the remaining provisions will continue in force.</p>
        <p>23.3 No indulgence or delay by us in enforcing any right is a waiver of that right.</p>
        <p>23.4 You may not cede or assign your rights or delegate your obligations without our written consent. We may cede and assign our rights and obligations to another company in the VINK Group, or to a successor in title, on written notice to you, provided that your rights are not diminished.</p>
        <p>23.5 These terms are governed by the laws of the Republic of South Africa. Subject to clause 20 and your rights under the CPA, you consent to the jurisdiction of the Magistrates’ Court having jurisdiction, in terms of section 45 of the Magistrates’ Courts Act 32 of 1944, even where the amount in dispute exceeds its monetary jurisdiction.</p>
      </S>
    </Doc>
  );
}

// ===========================================================================
// PRIVACY POLICY (POPIA)
// ===========================================================================

export function Privacy() {
  return (
    <Doc title="Privacy policy" related={[["/terms", "Terms of use"], ["/refunds", "Refund and cancellation policy"]]}
      intro="Drive2Own is committed to protecting your personal information. This policy explains what personal information we collect, why we collect it, who we share it with, how we protect it and the rights you have, in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and the Promotion of Access to Information Act 2 of 2000 (PAIA).">

      <S id="p1" title="1. Who is responsible for your information">
        <p>1.1 The responsible party for personal information processed through the platform is {COMPANY}, registration number {REG}, trading through its division Drive2Own (<strong>“Drive2Own”</strong>, <strong>“we”</strong>, <strong>“us”</strong>).</p>
        <p>1.2 Our Information Officer, appointed under POPIA and PAIA, can be contacted at {EMAIL}, marked “For the attention of the Information Officer”.</p>
        <CompanyBlock />
      </S>

      <S id="p2" title="2. Scope">
        <p>This policy applies to everyone whose personal information we process through the platform, including drivers, owners, Drive to Own applicants and members, people who contact us, and visitors to our website. Terms not defined here have the meaning given in POPIA.</p>
      </S>

      <S id="p3" title="3. Personal information we collect">
        <table>
          <thead><tr><th>Category</th><th>Examples</th></tr></thead>
          <tbody>
            <tr><td>Identity</td><td>Full name, identity or passport number, date of birth, nationality, work permit number, photographs on identity documents</td></tr>
            <tr><td>Contact</td><td>Mobile number, email address, residential address</td></tr>
            <tr><td>Verification documents</td><td>Copies of your ID or passport, driving licence, PrDP, proof of residence, e-hailing driver profile, vehicle registration certificate, insurance schedule and bank confirmation letter</td></tr>
            <tr><td>Financial</td><td>Employment status, source and band of income, source of funds, bank statements or earnings statements, bank account details for payouts, tax number (optional), payment history</td></tr>
            <tr><td>Due diligence</td><td>Whether you are, or are associated with, a prominent influential person; sanctions and fraud screening results; credit-bureau results where you consented</td></tr>
            <tr><td>Rental activity</td><td>Vehicle listings, requests, agreements, acceptances, payments, notifications and messages</td></tr>
            <tr><td>Vehicle and location</td><td>Tracking data from devices fitted to vehicles, during the period of a rental or rent-to-own agreement</td></tr>
            <tr><td>Technical</td><td>IP address, device and browser type, log and security data, and the date and time you accepted our terms</td></tr>
            <tr><td>Marketing preferences</td><td>Whether you have opted in to receive marketing from us</td></tr>
          </tbody>
        </table>
        <p>3.2 <strong>Special personal information.</strong> We do not intentionally collect information about your religious or philosophical beliefs, race, trade union membership, political persuasion, health or sex life. Information about criminal behaviour may be processed only where it arises from a lawful fraud-prevention or verification check you consented to, or where the law requires or permits it, in accordance with sections 26 to 33 of POPIA. Identity documents may incidentally reveal information such as race or ethnic origin. We do not use this information for any purpose.</p>
        <p>3.3 <strong>Children.</strong> The platform is not intended for anyone under 18, and we do not knowingly process children’s personal information.</p>
      </S>

      <S id="p4" title="4. Where we get it from">
        <p>We collect personal information directly from you, and where lawful from: owners and drivers you transact with; credit bureaus, identity-verification and fraud-prevention services; e-hailing platforms, where you authorise them to share information; tracking-device providers; payment service providers; insurers; and public records.</p>
      </S>

      <S id="p5" title="5. Why we process it, and our lawful basis">
        <table>
          <thead><tr><th>Purpose</th><th>Lawful basis under section 11 of POPIA</th></tr></thead>
          <tbody>
            <tr><td>Creating and managing your account</td><td>Necessary to conclude and perform our contract with you</td></tr>
            <tr><td>Verifying identity, address, licensing and income; FICA customer due diligence; PEP and sanctions screening</td><td>Compliance with legal obligations, including FICA; your consent; our legitimate interest in preventing fraud</td></tr>
            <tr><td>Showing your verification status and contact details to an owner or driver you transact with</td><td>Necessary to perform the contract; your consent</td></tr>
            <tr><td>Affordability assessments for the Drive to Own programme</td><td>Compliance with the NCA where it applies; your consent; necessary to conclude the contract</td></tr>
            <tr><td>Processing and recording payments, refunds and deposits</td><td>Necessary to perform the contract; compliance with tax and accounting laws</td></tr>
            <tr><td>Vehicle tracking, theft recovery and enforcement of agreements</td><td>Necessary to perform the contract; legitimate interest in protecting property</td></tr>
            <tr><td>Service messages, such as request updates and password-reset codes</td><td>Necessary to perform the contract</td></tr>
            <tr><td>Platform security, preventing and detecting fraud, money laundering and abuse</td><td>Legitimate interest; legal obligation, including section 29 of FICA</td></tr>
            <tr><td>Handling complaints, disputes and legal claims</td><td>Legitimate interest; legal obligation</td></tr>
            <tr><td>Direct marketing</td><td>Your opt-in consent, as required by section 69 of POPIA</td></tr>
          </tbody>
        </table>
        <p>5.2 We will only process personal information for a purpose compatible with the purpose for which it was collected, in line with section 15 of POPIA.</p>
      </S>

      <S id="p6" title="6. Anti-money-laundering and FICA">
        <p>We apply customer due diligence measures consistent with the Financial Intelligence Centre Act 38 of 2001. We may be required by law to report suspicious or unusual transactions to the Financial Intelligence Centre, and we are prohibited from telling you when a report has been made. Information processed for these purposes is kept for the periods required by law, even if you close your account.</p>
      </S>

      <S id="p7" title="7. Who we share it with">
        <p>We do not sell your personal information. We share it only as follows, and only to the extent necessary:</p>
        <ul>
          <li><strong>Owners and drivers.</strong> When you send or receive a rental request, the other party can see your name, verification status, platforms and, for owners reviewing a driver, the driver’s verification documents. Phone numbers are shared only once a request is approved.</li>
          <li><strong>Operators acting on our behalf</strong>, under written agreements that require them to keep the information confidential and secure, as required by sections 20 and 21 of POPIA. These include hosting and cloud-infrastructure providers, SMS and email providers, payment service providers (currently PayFast), identity-verification and credit-bureau services, and tracking-device providers.</li>
          <li><strong>VINK Group companies</strong> that provide shared administrative, technology or compliance services to Drive2Own, under the same safeguards.</li>
          <li><strong>Insurers and assessors</strong>, in connection with an accident, theft or claim.</li>
          <li><strong>Authorities</strong>, such as the South African Police Service, the Financial Intelligence Centre, the South African Revenue Service, traffic authorities, courts and regulators, where the law requires or permits it.</li>
          <li><strong>A successor</strong>, if all or part of the Drive2Own business is sold or restructured, subject to this policy.</li>
        </ul>
      </S>

      <S id="p8" title="8. Transfers outside South Africa">
        <p>Some of our operators, including our hosting provider, store or process information on servers outside South Africa, including in the United States. We transfer personal information across borders only in accordance with section 72 of POPIA: where the recipient is subject to a law, binding corporate rules or a binding agreement that provides an adequate level of protection; where you consent; or where the transfer is necessary to perform our contract with you.</p>
      </S>

      <S id="p9" title="9. How we protect it">
        <p>9.1 As required by section 19 of POPIA, we take appropriate, reasonable technical and organisational measures to protect personal information against loss, damage, unauthorised destruction and unlawful access or processing. These include encrypted connections (HTTPS), hashed passwords, private storage of documents that are never publicly accessible, role-based access controls, content checks on uploaded files, and logging.</p>
        <p>9.2 If we have reasonable grounds to believe that your personal information has been accessed or acquired by an unauthorised person, we will notify the Information Regulator and, unless the law prevents it, you, as soon as reasonably possible, as required by section 22 of POPIA.</p>
      </S>

      <S id="p10" title="10. How long we keep it">
        <p>10.1 We keep personal information only for as long as necessary for the purpose for which it was collected, or as required or permitted by law, in line with section 14 of POPIA.</p>
        <p>10.2 In general, we keep account, verification and transaction records for 5 years after your account is closed or your last transaction, whichever is later, to meet our obligations under FICA, tax laws and the Companies Act 71 of 2008, and to deal with any claims. Vehicle tracking data is kept for no longer than 12 months after the relevant agreement ends, unless needed for a claim or investigation. After these periods, information is deleted or de-identified.</p>
      </S>

      <S id="p11" title="11. Your rights">
        <p>Subject to POPIA and PAIA, you have the right to:</p>
        <ul>
          <li>(a) be told when your personal information is being collected, and when it has been accessed by an unauthorised person;</li>
          <li>(b) ask whether we hold personal information about you, and request access to it (section 23 of POPIA), in accordance with our PAIA manual, which is available on request;</li>
          <li>(c) request the correction or deletion of information that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading or unlawfully obtained, or that we are no longer authorised to keep (section 24);</li>
          <li>(d) object, on reasonable grounds, to processing based on legitimate interest, and object at any time to processing for direct marketing (section 11(3));</li>
          <li>(e) withdraw your consent at any time, without affecting processing that took place before withdrawal or processing based on another lawful ground;</li>
          <li>(f) not be subject to a decision based solely on automated processing that has legal consequences for you (section 71). We do not make such decisions; affordability and verification decisions are reviewed by a person; and</li>
          <li>(g) lodge a complaint with the Information Regulator.</li>
        </ul>
        <p>To exercise your rights, email {EMAIL}. We may need to verify your identity first. We will respond within a reasonable time and, for access requests, within the time periods in PAIA.</p>
      </S>

      <S id="p12" title="12. Direct marketing">
        <p>We will send you marketing only if you opted in, or where section 69 of POPIA otherwise permits it. Every marketing message includes a free way to opt out, and you may opt out at any time by emailing {EMAIL}. Service messages about your account and transactions are not marketing.</p>
      </S>

      <S id="p13" title="13. Cookies and local storage">
        <p>The platform uses your browser’s local storage to keep you signed in and to remember the cars you saved. We do not use advertising or third-party tracking cookies. If you clear your browser storage you will be signed out.</p>
      </S>

      <S id="p14" title="14. The Information Regulator">
        <p>If you are not satisfied with how we have dealt with your personal information, you may complain to the Information Regulator (South Africa):</p>
        <dl className="info">
          <div><dt>Address</dt><dd>Woodmead North Office Park, 54 Maxwell Drive, Woodmead, Johannesburg, 2191</dd></div>
          <div><dt>Postal</dt><dd>P.O. Box 31533, Braamfontein, Johannesburg, 2017</dd></div>
          <div><dt>Telephone</dt><dd>010 023 5200 · Toll-free 0800 017 160</dd></div>
          <div><dt>General enquiries</dt><dd>enquiries@inforegulator.org.za</dd></div>
          <div><dt>POPIA complaints</dt><dd>POPIAComplaints@inforegulator.org.za</dd></div>
          <div><dt>Website</dt><dd>www.inforegulator.org.za</dd></div>
        </dl>
        <p>We would appreciate the chance to resolve your concern first, so please contact us before approaching the Regulator.</p>
      </S>

      <S id="p15" title="15. Changes to this policy">
        <p>We may update this policy from time to time. The date at the top shows when it was last changed. Where a change materially affects how we process your personal information, we will notify you by email or in-app notification before it takes effect and, where required, ask for your consent.</p>
      </S>
    </Doc>
  );
}

// ===========================================================================
// REFUND AND CANCELLATION POLICY
// ===========================================================================

export function Refunds() {
  return (
    <Doc title="Refund and cancellation policy" related={[["/terms", "Terms of use"], ["/privacy", "Privacy policy"]]}
      intro="This policy explains when you can cancel, what is refunded, how deposits are returned and how long refunds take, on the Drive2Own rental marketplace and in the Drive to Own programme. It forms part of our terms of use and is subject to your rights under the Consumer Protection Act 68 of 2008 (CPA), the Electronic Communications and Transactions Act 25 of 2002 (ECTA) and, where it applies, the National Credit Act 34 of 2005 (NCA).">

      <S id="r1" title="1. How payments flow">
        <p>1.1 <strong>Marketplace rentals.</strong> Rent and deposits are owed by the driver to the owner under the rental agreement. They may be paid directly to the owner or, where available, online through the platform. Where they are paid through the platform, Drive2Own receives them as the owner’s limited agent for collection (see clause 10.2 of our <Link to="/terms">terms of use</Link>).</p>
        <p>1.2 <strong>Drive to Own.</strong> Contributions and payments under the Drive to Own programme are paid to Drive2Own and held as described in your group agreement and rent-to-own agreement.</p>
        <p>1.3 <strong>Who refunds you.</strong> Where you paid the owner directly, the owner is responsible for any refund. Where you paid through the platform and the money has not yet been paid over to the owner, Drive2Own processes the refund. Where it has been paid over, Drive2Own will instruct and follow up with the owner, and may set off the refund against amounts owed to the owner.</p>
      </S>

      <S id="r2" title="2. Cancelling a rental request before handover">
        <p>2.1 A driver may cancel a request that is pending or approved at any time before the vehicle is handed over, free of charge, using the <em>Cancel request</em> button on the dashboard.</p>
        <p>2.2 An owner may decline a pending request or withdraw an approval at any time before handover, free of charge.</p>
        <p>2.3 Any amount paid before handover, including a deposit or first week’s rent, must be refunded <strong>in full</strong> within 7 business days of the cancellation, whichever party cancels.</p>
      </S>

      <S id="r3" title="3. Cooling-off rights">
        <p>3.1 Where a transaction is concluded electronically and you are a consumer, section 44 of ECTA may entitle you to cancel without reason and without penalty within 7 days of concluding the agreement. Where you cancel within this period, any amount paid is refunded within 30 days, as ECTA requires, and we aim to do so within 7 business days. In terms of section 42 of ECTA, this right does not apply to services that began, with your consent, before the end of the 7-day period. In that case, you remain liable for rent for the days the vehicle was in your possession.</p>
        <p>3.2 Where an agreement resulted from direct marketing, section 16 of the CPA may give you a 5-business-day cooling-off period.</p>
        <p>3.3 Where the NCA applies to a Drive to Own agreement, you have the rights the NCA gives you, including, where applicable, the right to rescind certain credit agreements within 5 business days under section 121.</p>
      </S>

      <S id="r4" title="4. Ending a rental early">
        <p>4.1 <strong>By the driver.</strong> A driver may end a rental before its agreed end date by giving the notice set out in the rental agreement and returning the vehicle. Where the rental agreement is a fixed-term agreement to which section 14 of the CPA applies, the driver may cancel on 20 business days’ notice, and the owner may charge only a reasonable cancellation penalty as permitted by section 14 and regulation 5 of the CPA regulations.</p>
        <p>4.2 Rent for the week in which the vehicle is returned is not refundable, unless the rental agreement provides otherwise. Rent paid in advance for any later full week is refunded within 7 business days of the vehicle’s return, less any cancellation penalty lawfully charged under clause 4.1.</p>
        <p>4.3 <strong>By the owner.</strong> If an owner ends a rental early other than for the driver’s breach, all rent paid for the period after the vehicle is returned is refunded in full, together with the deposit in accordance with clause 6.</p>
        <p>4.4 <strong>Vehicle unavailable.</strong> If the vehicle cannot be used for more than 48 consecutive hours because of a mechanical failure or another cause that is not the driver’s fault, and no suitable replacement is provided, the driver is entitled to a pro rata refund or credit of rent for each full day the vehicle could not be used.</p>
      </S>

      <S id="r5" title="5. Termination for breach">
        <p>Where a rental is terminated because of the driver’s material breach, for example non-payment, unauthorised drivers or unlawful use, rent paid for the period after termination is refunded, less amounts lawfully owed to the owner under the rental agreement, such as unpaid rent, the cost of recovering the vehicle, and damage the driver is liable for. The owner must provide an itemised statement of any deductions.</p>
      </S>

      <S id="r6" title="6. Refundable deposits">
        <p>6.1 A deposit is security for the driver’s obligations under the rental agreement. It is not rent, and remains refundable.</p>
        <p>6.2 The owner must inspect the vehicle on its return, if possible in the driver’s presence, and record its condition with dated photographs.</p>
        <p>6.3 The deposit, less any lawful deductions, must be refunded within <strong>7 business days</strong> of the vehicle’s return, or within 14 business days where the owner is still waiting for a traffic-fine notice or a repair quotation that it has told the driver about in writing.</p>
        <p>6.4 Deductions are limited to amounts the driver is liable for under the rental agreement, and may include: unpaid rent; traffic fines and tolls incurred during the rental; the reasonable cost of repairing damage beyond fair wear and tear caused by the driver’s negligence or breach, or the insurance excess where a claim is made; fuel below the agreed level; and reasonable cleaning costs where the vehicle is returned in an unreasonable condition.</p>
        <p>6.5 Every deduction must be supported by an itemised statement with evidence, such as photographs, invoices, quotations or fine notices, provided to the driver at the time of the refund. A driver who disputes a deduction may raise it through our complaints process (clause 10).</p>
        <p>6.6 Where a deposit was paid through the platform, Drive2Own will release it to the driver in accordance with this clause, unless the owner has lodged a documented claim, in which case the disputed portion may be held until the dispute is resolved and the undisputed portion released.</p>
      </S>

      <S id="r7" title="7. Drive to Own programme">
        <p>7.1 <strong>Before a vehicle is allocated to you.</strong> If you withdraw from a driver group before a vehicle has been allocated to you, the contributions you paid will be refunded in accordance with your group agreement, less only the fees disclosed in your Total Monthly Cost Summary and group agreement before you joined. The group agreement sets out the notice period and the time for payment, which will not exceed 30 days after your withdrawal takes effect, except where the agreement requires the refund to be funded by a replacement member and you agreed to this before joining.</p>
        <p>7.2 <strong>After a vehicle is allocated to you.</strong> If your rent-to-own agreement ends early, whether you end it or it is terminated, the treatment of the amounts you paid, including amounts credited toward ownership, any early-settlement amount and the return of the vehicle, is governed by your rent-to-own agreement and, where it applies, the NCA. You will receive a written statement of account showing how any amount refunded or owed was calculated.</p>
        <p>7.3 <strong>If we decline your application</strong> or are unable to start your group, all contributions you paid are refunded in full within 7 business days.</p>
        <p>7.4 Amounts paid for the period in which you had the use of a vehicle are not refundable, because you received the benefit of that use.</p>
      </S>

      <S id="r8" title="8. Platform fees">
        <p>Drive2Own does not currently charge drivers or owners a fee to register, list a vehicle or request one. If we introduce a fee for any service, we will disclose the amount and whether it is refundable before you pay it, and a fee for a service we fail to provide will be refunded in full.</p>
      </S>

      <S id="r9" title="9. How refunds are paid">
        <p>9.1 Refunds are paid using the same method as the original payment where possible. Payments made by card or instant EFT through PayFast are refunded to the original card or bank account. Other refunds are paid by EFT into a South African bank account in your name.</p>
        <p>9.2 Once a refund is processed, it may take a further 3 to 7 business days for your bank or card issuer to show it, depending on the payment method.</p>
        <p>9.3 For security and to meet our FICA obligations, we do not pay refunds in cash or to a third party’s account.</p>
        <p>9.4 If you dispute a payment with your bank (a chargeback) while a refund request or dispute is open with us, we may pause our process until the bank’s investigation is complete, to avoid a double refund.</p>
      </S>

      <S id="r10" title="10. How to request a refund or raise a dispute">
        <p>10.1 Email {EMAIL} with your full name, the phone number on your account, the car or agreement concerned, the amount, and the reason. Include any supporting photographs or documents.</p>
        <p>10.2 We will acknowledge your request within 2 business days and aim to resolve it within 10 business days. Where an owner is responsible for a refund, we will contact the owner and keep you informed.</p>
        <p>10.3 If you are not satisfied with the outcome, you may refer the matter to the Consumer Goods and Services Ombud, the Motor Industry Ombudsman of South Africa (for vehicle-related matters), the National Consumer Commission or, for credit matters, the National Credit Regulator, without affecting your right to approach a court.</p>
      </S>

      <S id="r11" title="11. Changes to this policy">
        <p>We may update this policy, and will give notice of material changes in line with clause 22 of our <Link to="/terms">terms of use</Link>. The version in force when you made a payment applies to that payment, unless a later version is more favourable to you.</p>
      </S>
    </Doc>
  );
}
