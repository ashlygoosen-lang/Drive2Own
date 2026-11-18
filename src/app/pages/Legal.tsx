import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function Page({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:text-gray-700">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">Last updated {updated}</p>
        {children}
      </article>
      <Footer />
    </div>
  );
}

export function Terms() {
  return (
    <Page title="Terms of use" updated="November 2026">
      <p>These terms govern your use of Drive2Own. By creating an account you agree to them.</p>
      <h2>1. What Drive2Own is</h2>
      <p>Drive2Own is an online marketplace that connects vehicle owners with drivers who want to rent a vehicle for e-hailing services. Drive2Own is not a party to any rental agreement between an owner and a driver, does not own or insure the vehicles listed, and is not affiliated with Uber, inDrive or Bolt.</p>
      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 18 and provide accurate information.</li>
        <li>You are responsible for keeping your password secure and for activity on your account.</li>
        <li>Drivers must hold a valid driver's licence and Professional Driving Permit (PrDP) and meet the requirements of the platform they drive on.</li>
      </ul>
      <h2>3. Owners</h2>
      <p>Owners must be entitled to rent out the vehicle, keep it roadworthy and licensed, and hold insurance that covers e-hailing use. Listings must be accurate, including the rate, deposit and platforms the vehicle qualifies for.</p>
      <h2>4. Drivers</h2>
      <p>Drivers must provide genuine documents, drive lawfully, and use a vehicle only as agreed with the owner. Drivers are responsible for traffic fines, tolls and damage as set out in the rental agreement.</p>
      <h2>5. Rental agreement and payments</h2>
      <p>When an owner approves a request, both parties are shown a rental agreement to accept before the vehicle is handed over. Payments are recorded in Drive2Own. Where online payment is offered it is processed by a third-party payment provider. Disputes about a rental are between the owner and the driver.</p>
      <h2>6. Documents</h2>
      <p>Documents you upload are used to verify your identity and eligibility. Verification by Drive2Own is a check on the documents provided and is not a guarantee about any user.</p>
      <h2>7. Acceptable use</h2>
      <p>You may not provide false information, misuse another person's documents, sub-let a vehicle without permission, or use the service for unlawful purposes. We may suspend or remove accounts and listings that breach these terms.</p>
      <h2>8. Liability</h2>
      <p>To the extent permitted by law, Drive2Own is not liable for loss, damage, fines or injury arising from a rental, or for the conduct of owners or drivers. Nothing in these terms limits rights you have under the Consumer Protection Act that cannot be limited.</p>
      <h2>9. Changes and governing law</h2>
      <p>We may update these terms and will show the date of the latest version. These terms are governed by the laws of South Africa.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy policy" updated="November 2026">
      <p>Drive2Own respects your privacy and processes personal information in line with the Protection of Personal Information Act (POPIA). This policy explains what we collect and why.</p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details: name, phone number, email (optional), city and the platforms you drive on.</li>
        <li>Documents you upload: ID or passport, driver's licence, PrDP, proof of residence and vehicle registration papers.</li>
        <li>Rental activity: requests, agreements, payments and notifications.</li>
        <li>Technical data needed to keep the service secure.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To run your account and match owners with drivers.</li>
        <li>To verify identity and eligibility before rentals.</li>
        <li>To send service messages such as request updates and password-reset codes by SMS or in the app.</li>
        <li>To process payments, prevent fraud and comply with the law.</li>
      </ul>
      <h2>Who can see it</h2>
      <p>Your documents are stored privately. They are visible to you, to Drive2Own's review team, and to an owner you have sent a rental request to. An owner's phone number is shared with a driver, and the driver's with the owner, only after the owner approves the request. We do not sell personal information.</p>
      <h2>Service providers</h2>
      <p>We use providers for SMS delivery and online payments. They receive only the information needed to perform those services.</p>
      <h2>Retention and security</h2>
      <p>We keep information for as long as your account is active and as needed for legal and record-keeping purposes. Passwords are stored hashed, and access to documents is restricted.</p>
      <h2>Your rights</h2>
      <p>You may ask to access, correct or delete your personal information, and you may object to its processing. You may also complain to the Information Regulator of South Africa.</p>
    </Page>
  );
}
