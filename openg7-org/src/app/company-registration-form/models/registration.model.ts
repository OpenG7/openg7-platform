export type TradeScope = 'canada' | 'international' | 'both';

export interface CompanyProfile {
  legalName: string;
  website?: string;
  headquarterCountry: string;
  headquarterProvince?: string;
  tradeScope: TradeScope;
  provincesServed: string[];
  countriesServed: string[];
  sector: string;
  description?: string;
  capacityNote?: string;
  foreignRegistrationId?: string;
  canadianRepresentative?: { name: string; email: string } | null;
  contact: { fullName: string; role: string; email: string; phone?: string };
  acceptedTerms: boolean;
}
