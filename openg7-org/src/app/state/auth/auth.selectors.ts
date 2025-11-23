import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthUser } from '@app/core/auth/auth.types';

export type { AuthUser };

export interface AuthState {
  user: AuthUser | null;
  jwtExp: number | null;
}

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.user
);

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectUserRoles = createSelector(
  selectUser,
  (user) => user?.roles ?? []
);

export const selectJwtExp = createSelector(
  selectAuthState,
  (state) => state.jwtExp
);
