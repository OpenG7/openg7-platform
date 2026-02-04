import { computed, signal } from '@angular/core';
import { FeedItemType, FeedSort, FlowMode } from '@app/domains/feed/feature/models/feed.models';

export const fromProvinceIdSig = signal<string | null>(null);
export const toProvinceIdSig = signal<string | null>(null);
export const sectorIdSig = signal<string | null>(null);
export const feedTypeSig = signal<FeedItemType | null>(null);
export const feedModeSig = signal<FlowMode>('BOTH');
export const feedSearchSig = signal('');
export const feedSortSig = signal<FeedSort>('NEWEST');
export const focusItemIdSig = signal<string | null>(null);

export const hasActiveFiltersSig = computed(
  () =>
    Boolean(fromProvinceIdSig()) ||
    Boolean(toProvinceIdSig()) ||
    Boolean(sectorIdSig()) ||
    Boolean(feedTypeSig()) ||
    feedModeSig() !== 'BOTH' ||
    feedSearchSig().trim().length > 0
);
