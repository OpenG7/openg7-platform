import { feedReducer } from './feed.reducer';
import { FeedActions } from './feed.actions';
import { FeedPost, FeedRealtimeEnvelope } from '../../domains/feed/feature/models/feed.models';

describe('feedReducer', () => {
  const createPost = (
    id: string,
    createdAt: string,
    overrides: Partial<FeedPost> = {}
  ): FeedPost => ({
    id,
    author: overrides.author ?? { id: `author-${id}`, displayName: `Author ${id}` },
    content: overrides.content ?? `Post ${id}`,
    createdAt,
    updatedAt: overrides.updatedAt ?? null,
    metrics: overrides.metrics ?? { likes: 0, replies: 0, shares: 0 },
    channel: overrides.channel ?? 'global',
    ...overrides,
  });

  const reduceEnvelope = (state: ReturnType<typeof feedReducer>, envelope: FeedRealtimeEnvelope) =>
    feedReducer(state, FeedActions.receiveRealtimeEnvelope({ envelope }));

  it('maintains descending order and deduplicates posts across load and realtime events', () => {
    const initialBatch = [
      createPost('a', '2024-01-01T08:00:00.000Z', {
        updatedAt: '2024-01-01T09:00:00.000Z',
        content: 'original a',
      }),
      createPost('b', '2024-01-02T09:00:00.000Z', { content: 'post b' }),
    ];
    const newerVersionOfA = createPost('a', '2024-01-01T08:00:00.000Z', {
      updatedAt: '2024-01-01T10:00:00.000Z',
      content: 'newer a',
    });
    initialBatch.push(newerVersionOfA);

    let state = feedReducer(
      undefined,
      FeedActions.loadSuccess({ posts: initialBatch, cursor: null, append: false })
    );

    expect(state.posts.map(post => post.id)).toEqual(['b', 'a']);
    expect(state.posts[1].content).toBe('newer a');
    expect(state.postIndex['b']).toBe(0);
    expect(state.postIndex['a']).toBe(1);

    const appendBatch = [
      createPost('c', '2024-01-03T09:00:00.000Z', { content: 'post c' }),
      createPost('b', '2024-01-02T09:00:00.000Z', {
        updatedAt: '2024-01-02T10:00:00.000Z',
        content: 'updated b',
      }),
    ];

    state = feedReducer(
      state,
      FeedActions.loadSuccess({ posts: appendBatch, cursor: 'cursor-1', append: true })
    );

    expect(state.posts.map(post => post.id)).toEqual(['c', 'b', 'a']);
    expect(state.posts[1].content).toBe('updated b');
    expect(state.cursor).toBe('cursor-1');

    state = reduceEnvelope(state, {
      type: 'feed.post.updated',
      payload: createPost('a', '2024-01-01T08:00:00.000Z', {
        updatedAt: '2024-01-01T11:00:00.000Z',
        content: 'realtime a',
      }),
    });

    expect(state.posts.map(post => post.id)).toEqual(['c', 'b', 'a']);
    expect(state.posts[2].content).toBe('realtime a');

    state = reduceEnvelope(state, {
      type: 'feed.post.created',
      cursor: 'cursor-2',
      payload: createPost('d', '2024-01-02T12:00:00.000Z', { content: 'post d' }),
    });

    expect(state.cursor).toBe('cursor-2');
    expect(state.posts.map(post => post.id)).toEqual(['c', 'd', 'b', 'a']);

    state = reduceEnvelope(state, {
      type: 'feed.post.deleted',
      payload: createPost('b', '2024-01-02T09:00:00.000Z'),
    });

    expect(state.posts.map(post => post.id)).toEqual(['c', 'd', 'a']);
    expect(state.postIndex['c']).toBe(0);
    expect(state.postIndex['d']).toBe(1);
    expect(state.postIndex['a']).toBe(2);
    expect(state.posts[state.postIndex['d']].content).toBe('post d');
  });

  it('ignores stale updates that are older than the existing post', () => {
    const basePost = createPost('stale', '2024-02-01T10:00:00.000Z', {
      updatedAt: '2024-02-01T11:00:00.000Z',
      content: 'fresh',
    });

    let state = feedReducer(
      undefined,
      FeedActions.loadSuccess({ posts: [basePost], cursor: null, append: false })
    );

    state = reduceEnvelope(state, {
      type: 'feed.post.updated',
      payload: createPost('stale', '2024-02-01T10:00:00.000Z', {
        updatedAt: '2024-02-01T10:30:00.000Z',
        content: 'older',
      }),
    });

    expect(state.posts.length).toBe(1);
    expect(state.posts[0].content).toBe('fresh');
    expect(state.postIndex['stale']).toBe(0);
  });
});
