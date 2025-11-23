import { createReducer, on } from '@ngrx/store';
import {
  StatisticsFilters,
  StatisticsInsight,
  StatisticsSnapshot,
  StatisticsSummary,
} from '@app/core/models/statistics';
import type { CountryCode } from '@app/core/models/country';
import { StatisticsActions } from './statistics.actions';

export interface StatisticsState {
  readonly filters: StatisticsFilters;
  readonly summaries: readonly StatisticsSummary[];
  readonly insights: readonly StatisticsInsight[];
  readonly snapshot: StatisticsSnapshot | null;
  readonly availablePeriods: readonly string[];
  readonly availableProvinces: readonly string[];
  readonly availableCountries: readonly CountryCode[];
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: StatisticsState = {
  filters: {
    scope: 'interprovincial',
    intrant: 'all',
    period: null,
    province: null,
    country: null,
  },
  summaries: [],
  insights: [],
  snapshot: null,
  availablePeriods: [],
  availableProvinces: [],
  availableCountries: [] as CountryCode[],
  loading: false,
  error: null,
};

export const statisticsReducer = createReducer(
  initialState,
  on(StatisticsActions.initialize, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StatisticsActions.changeScope, (state, { scope }) => ({
    ...state,
    filters: {
      ...state.filters,
      scope,
      period: null,
      province: null,
      country: null,
    },
    loading: true,
    error: null,
  })),
  on(StatisticsActions.changeIntrant, (state, { intrant }) => ({
    ...state,
    filters: {
      ...state.filters,
      intrant,
      period: null,
      province: null,
      country: null,
    },
    loading: true,
    error: null,
  })),
  on(StatisticsActions.changePeriod, (state, { period }) => ({
    ...state,
    filters: {
      ...state.filters,
      period,
    },
    loading: true,
    error: null,
  })),
  on(StatisticsActions.changeProvince, (state, { province }) => ({
    ...state,
    filters: {
      ...state.filters,
      province,
    },
    loading: true,
    error: null,
  })),
  on(StatisticsActions.changeCountry, (state, { country }) => ({
    ...state,
    filters: {
      ...state.filters,
      country,
    },
    loading: true,
    error: null,
  })),
  on(StatisticsActions.loadStatistics, (state, { filters }) => ({
    ...state,
    filters,
    loading: true,
    error: null,
  })),
  on(StatisticsActions.loadStatisticsSuccess, (state, { payload }) => ({
    ...state,
    summaries: payload.summaries,
    insights: payload.insights,
    snapshot: payload.snapshot,
    availablePeriods: payload.availablePeriods,
    availableProvinces: payload.availableProvinces,
    availableCountries: payload.availableCountries,
    filters: payload.filters,
    loading: false,
    error: null,
  })),
  on(StatisticsActions.loadStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
