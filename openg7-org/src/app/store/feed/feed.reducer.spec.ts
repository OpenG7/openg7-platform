import { FeedItem, FeedRealtimeEnvelope } from '../../domains/feed/feature/models/feed.models';

import { FeedActions } from './feed.actions';
import { feedReducer } from './feed.reducer';

describe('feedReducer', () => {
  const createItem = (
    id: string,
    createdAt: string,
    overrides: Partial<FeedItem> = {}
  ): FeedItem => ({
    id,
    type: overrides.type ?? 'OFFER',
    sectorId: overrides.sectorId ?? 'sector-1',
    title: overrides.title ?? `Title ${id}`,
    summary: overrides.summary ?? `Summary ${id}`,
    createdAt,
    updatedAt: overrides.updatedAt ?? null,
    mode: overrides.mode ?? 'BOTH',
    source: overrides.source ?? { kind: 'USER', label: `Source ${id}` },
    ...overrides,
  });

  const reduceEnvelope = (state: ReturnType<typeof feedReducer>, envelope: FeedRealtimeEnvelope) =>
    feedReducer(state, FeedActions.receiveRealtimeEnvelope({ envelope }));

  it('maintains descending order and deduplicates items across load and realtime events', () => {
    const initialBatch = [
      createItem('a', '2024-01-01T08:00:00.000Z', {
        updatedAt: '2024-01-01T09:00:00.000Z',
        title: 'original a',
      }),
      createItem('b', '2024-01-02T09:00:00.000Z', { title: 'item b' }),
    ];
    const newerVersionOfA = createItem('a', '2024-01-01T08:00:00.000Z', {
      updatedAt: '2024-01-01T10:00:00.000Z',
      title: 'newer a',
    });
    initialBatch.push(newerVersionOfA);

    let state = feedReducer(
      undefined,
      FeedActions.loadSuccess({ items: initialBatch, cursor: null, append: false })
    );

    expect(state.items.map(item => item.id)).toEqual(['b', 'a']);
    expect(state.items[1].title).toBe('newer a');
    expect(state.itemIndex['b']).toBe(0);
    expect(state.itemIndex['a']).toBe(1);

    const appendBatch = [
      createItem('c', '2024-01-03T09:00:00.000Z', { title: 'item c' }),
      createItem('b', '2024-01-02T09:00:00.000Z', {
        updatedAt: '2024-01-02T10:00:00.000Z',
        title: 'updated b',
      }),
    ];

    state = feedReducer(
      state,
      FeedActions.loadSuccess({ items: appendBatch, cursor: 'cursor-1', append: true })
    );

    expect(state.items.map(item => item.id)).toEqual(['c', 'b', 'a']);
    expect(state.items[1].title).toBe('updated b');
    expect(state.cursor).toBe('cursor-1');

    state = reduceEnvelope(state, {
      type: 'feed.item.updated',
      payload: createItem('a', '2024-01-01T08:00:00.000Z', {
        updatedAt: '2024-01-01T11:00:00.000Z',
        title: 'realtime a',
      }),
    });

    expect(state.items.map(item => item.id)).toEqual(['c', 'b', 'a']);
    expect(state.items[2].title).toBe('realtime a');

    state = reduceEnvelope(state, {
      type: 'feed.item.created',
      cursor: 'cursor-2',
      payload: createItem('d', '2024-01-02T12:00:00.000Z', { title: 'item d' }),
    });

    expect(state.cursor).toBe('cursor-2');
    expect(state.items.map(item => item.id)).toEqual(['c', 'd', 'b', 'a']);

    state = reduceEnvelope(state, {
      type: 'feed.item.deleted',
      payload: createItem('b', '2024-01-02T09:00:00.000Z'),
    });

    expect(state.items.map(item => item.id)).toEqual(['c', 'd', 'a']);
    expect(state.itemIndex['c']).toBe(0);
    expect(state.itemIndex['d']).toBe(1);
    expect(state.itemIndex['a']).toBe(2);
    expect(state.items[state.itemIndex['d']].title).toBe('item d');
  });

  it('ignores stale updates that are older than the existing item', () => {
    const baseItem = createItem('stale', '2024-02-01T10:00:00.000Z', {
      updatedAt: '2024-02-01T11:00:00.000Z',
      title: 'fresh',
    });

    let state = feedReducer(
      undefined,
      FeedActions.loadSuccess({ items: [baseItem], cursor: null, append: false })
    );

    state = reduceEnvelope(state, {
      type: 'feed.item.updated',
      payload: createItem('stale', '2024-02-01T10:00:00.000Z', {
        updatedAt: '2024-02-01T10:30:00.000Z',
        title: 'older',
      }),
    });

    expect(state.items.length).toBe(1);
    expect(state.items[0].title).toBe('fresh');
    expect(state.itemIndex['stale']).toBe(0);
  });
});
