import {
  ConnectionAttachment,
  ConnectionDraft,
  ConnectionResponse,
  ConnectionStage,
  IntroductionDraftState,
} from '@app/core/models/connection';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ConnectionsActions = createActionGroup({
  source: 'Connections',
  events: {
    'Create Connection': props<{ draft: ConnectionDraft }>(),
    'Create Connection Success': props<{ connection: ConnectionResponse }>(),
    'Create Connection Failure': props<{ error: string }>(),
    'Pipeline Advanced': props<{ stage: ConnectionStage; timestamp?: string }>(),
    'Reset Pipeline': emptyProps(),
    'Attachments Updated': props<{ attachments: readonly ConnectionAttachment[] }>(),
    'Meeting Slots Updated': props<{ slots: readonly string[] }>(),
    'Save Draft': props<{ matchId: number; draft: IntroductionDraftState }>(),
    'Discard Draft': props<{ matchId: number }>(),
  },
});
