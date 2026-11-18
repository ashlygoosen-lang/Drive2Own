const NAMES: Record<string, string> = { uber: 'Uber', indrive: 'inDrive', bolt: 'Bolt' };
export const platformName = (p: string) => NAMES[p] ?? p;
