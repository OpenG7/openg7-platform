import { PartnerSelection } from '@app/core/models/partner-selection';

export interface OpportunityViewSheetPayload {
  readonly matchId: string;
  readonly selection: PartnerSelection;
}
