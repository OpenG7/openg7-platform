import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StatisticsFilters, StatisticsPayload, StatisticsScope, StatisticsIntrant } from '@app/core/models/statistics';
import type { CountryCode } from '@app/core/models/country';

export const StatisticsActions = createActionGroup({
  source: 'Statistics',
  events: {
    'Initialize': emptyProps(),
    'Change Scope': props<{ scope: StatisticsScope }>(),
    'Change Intrant': props<{ intrant: StatisticsIntrant }>(),
    'Change Period': props<{ period: string | null }>(),
    'Change Province': props<{ province: string | null }>(),
    'Change Country': props<{ country: CountryCode | null }>(),
    'Load Statistics': props<{ filters: StatisticsFilters }>(),
    'Load Statistics Success': props<{ payload: StatisticsPayload }>(),
    'Load Statistics Failure': props<{ error: string }>(),
  },
});
