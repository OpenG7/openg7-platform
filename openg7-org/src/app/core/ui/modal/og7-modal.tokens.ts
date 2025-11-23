import { InjectionToken } from '@angular/core';
import type { Og7ModalRef } from './og7-modal.types';

export const OG7_MODAL_DATA = new InjectionToken<unknown>('OG7_MODAL_DATA');
export const OG7_MODAL_REF = new InjectionToken<Og7ModalRef>('OG7_MODAL_REF');
