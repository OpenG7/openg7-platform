import { computed, effect, signal } from '@angular/core';

export const selectedCountrySig = signal<string | null>(null);
export const selectedProvinceSig = signal<string | null>(null);
export const activeSectorsSig = signal<readonly string[]>([]);
export const needTypeSig = signal<readonly string[]>([]);
export const feedSearchSig = signal('');
export const feedSortSig = signal<'latest' | 'trending' | 'recommended'>('latest');
export const focusPostIdSig = signal<string | null>(null);

export const hasActiveFiltersSig = computed(
  () =>
    Boolean(selectedProvinceSig()) ||
    activeSectorsSig().length > 0 ||
    needTypeSig().length > 0 ||
    feedSearchSig().trim().length > 0
);

// Keep bidirectional sync helpers minimal but available for host modules.
export function syncArraySignal(
  source: () => readonly string[],
  target: typeof activeSectorsSig
): void {
  effect(
    () => {
      const next = source();
      const prev = target();
      if (next.length === prev.length && next.every((value, index) => value === prev[index])) {
        return;
      }
      target.set([...next]);
    },
    { allowSignalWrites: true }
  );
}
