export const PLATFORMS = ['uber', 'indrive', 'bolt'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const ROLES = ['owner', 'driver'] as const;
export type Role = (typeof ROLES)[number];

export const DOCUMENT_TYPES = {
  driver: [
    { type: 'id_document', label: 'SA ID or Passport', required: true, hint: 'Green ID book, smart ID card (both sides) or passport photo page. Foreign nationals: passport plus valid work permit.' },
    { type: 'drivers_license', label: "Driver's Licence", required: true, hint: 'Front and back of your valid driving licence card.' },
    { type: 'prdp', label: 'PrDP (Professional Driving Permit)', required: true, hint: 'Your valid PrDP, or proof that your application is in progress.' },
    { type: 'proof_of_residence', label: 'Proof of Residence', required: true, hint: 'Utility bill, bank statement or lease, not older than 3 months, showing your name and address.' },
    { type: 'proof_of_income', label: 'Proof of Income', required: true, hint: 'Your last 3 months of bank statements, or e-hailing earnings statements.' },
    { type: 'platform_profile', label: 'Uber / Bolt / inDrive Driver Profile', required: true, hint: 'Screenshot of your driver profile showing your name, rating and account status.' },
  ],
  owner: [
    { type: 'id_document', label: 'SA ID or Passport', required: true, hint: 'Green ID book, smart ID card (both sides) or passport photo page. Companies: director ID and CIPC registration.' },
    { type: 'proof_of_residence', label: 'Proof of Residence', required: true, hint: 'Utility bill, bank statement or lease, not older than 3 months, showing your name and address.' },
    { type: 'bank_confirmation', label: 'Bank Confirmation Letter', required: true, hint: 'A stamped bank letter or recent statement showing the account that rent should be paid into.' },
    { type: 'vehicle_registration', label: 'Vehicle Registration Certificate', required: true, hint: 'The registration certificate (NaTIS) for the car you will list, in your name or your company\'s.' },
    { type: 'insurance_certificate', label: 'Insurance Certificate', required: true, hint: 'Your current policy schedule showing comprehensive cover that includes e-hailing use.' },
    { type: 'proof_of_income', label: 'Source of Funds (optional)', required: false, hint: 'Optional: a document supporting the source of funds you declared, such as a payslip or bank statement.' },
  ],
} as const;

export const ALL_DOCUMENT_TYPES = [
  'id_document', 'drivers_license', 'prdp', 'proof_of_residence', 'platform_profile', 'vehicle_registration',
  'proof_of_income', 'bank_confirmation', 'insurance_certificate',
] as const;

export const ID_TYPES = ['sa_id', 'passport'] as const;
export const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'] as const;
export const EMPLOYMENT = ['e_hailing_full_time', 'e_hailing_part_time', 'employed', 'self_employed', 'business_owner', 'unemployed', 'retired', 'other'] as const;
export const INCOME_SOURCES = ['e_hailing_earnings', 'salary', 'business_income', 'rental_income', 'investments', 'pension', 'grant', 'family_support', 'other'] as const;
export const INCOME_BANDS = ['under_5000', '5000_10000', '10000_20000', '20000_35000', '35000_50000', 'over_50000'] as const;

/** Current version of the terms, privacy policy and refund policy that users accept at sign-up. */
export const LEGAL_VERSION = '2026-11';
