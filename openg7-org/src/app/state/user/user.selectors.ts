import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthUser } from '@app/core/auth/auth.types';

export type UserProfile = AuthUser;

export interface UserState {
  profile: UserProfile | null;
  permissions: string[];
}

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserProfile = createSelector(
  selectUserState,
  (state: UserState) => state.profile
);

export const selectUserPermissions = createSelector(
  selectUserState,
  (state: UserState) => state.permissions
);
