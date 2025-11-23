import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthUser } from '@app/core/auth/auth.types';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Session Hydrated': props<{ user: AuthUser | null; jwtExp: number | null }>(),
    'Session Cleared': emptyProps(),
  },
});
