import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserProfile } from './user.selectors';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Profile Hydrated': props<{ profile: UserProfile; permissions: string[] }>(),
    'Profile Cleared': emptyProps(),
  },
});
