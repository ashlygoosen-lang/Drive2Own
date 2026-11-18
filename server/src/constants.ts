export const PLATFORMS = ['uber', 'indrive', 'bolt'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const ROLES = ['owner', 'driver'] as const;
export type Role = (typeof ROLES)[number];

export const DOCUMENT_TYPES = {
  driver: [
    { type: 'id_document', label: 'SA ID or Passport', required: true },
    { type: 'drivers_license', label: "Driver's Licence", required: true },
    { type: 'prdp', label: 'PrDP (Professional Driving Permit)', required: true },
    { type: 'proof_of_residence', label: 'Proof of Residence', required: false },
    { type: 'platform_profile', label: 'Uber / inDrive / Bolt profile screenshot', required: false },
  ],
  owner: [
    { type: 'id_document', label: 'SA ID or Passport', required: true },
    { type: 'proof_of_residence', label: 'Proof of Residence', required: false },
    { type: 'vehicle_registration', label: 'Vehicle Registration Papers', required: false },
  ],
} as const;

export const ALL_DOCUMENT_TYPES = [
  'id_document', 'drivers_license', 'prdp', 'proof_of_residence', 'platform_profile', 'vehicle_registration',
] as const;
