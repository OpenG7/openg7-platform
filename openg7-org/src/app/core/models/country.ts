export const G7_COUNTRY_CODES = ['CA', 'DE', 'FR', 'IT', 'JP', 'UK', 'US'] as const;

export type CountryCode = (typeof G7_COUNTRY_CODES)[number];

export const isCountryCode = (value: unknown): value is CountryCode => {
  if (typeof value !== 'string') {
    return false;
  }
  const normalized = value.trim().toUpperCase();
  return (G7_COUNTRY_CODES as readonly string[]).includes(normalized);
};
