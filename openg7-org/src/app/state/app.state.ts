import { AuthState } from './auth/auth.selectors';
import { UserState } from './user/user.selectors';
import { CatalogState } from './catalog/catalog.selectors';
import { MapState } from './map/map.selectors';
import { ConnectionsState } from '@app/store/connections/connections.reducer';
import { StatisticsState } from '@app/store/statistics/statistics.reducer';

export interface AppState {
  auth: AuthState;
  user: UserState;
  catalog: CatalogState;
  map: MapState;
  connections: ConnectionsState;
  statistics: StatisticsState;
}
