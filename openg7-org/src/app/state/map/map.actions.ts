import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Flow, MapKpis } from './map.selectors';

export const MapActions = createActionGroup({
  source: 'Map',
  events: {
    'Map Loaded': emptyProps(),
    'Flows Filtered': props<{ flows: Flow[] }>(),
    'Active Sector Selected': props<{ sectorId: string | null }>(),
    'Kpis Updated': props<{ kpis: MapKpis }>(),
    'Map Reset': emptyProps(),
  },
});
