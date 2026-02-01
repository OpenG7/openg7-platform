import { createReducer, on } from '@ngrx/store';

import {
  FeedFilterState,
  FeedPost,
  FeedRealtimeEnvelope,
  FeedReply,
  FeedSnapshot,
} from '../../domains/feed/feature/models/feed.models';

import { FeedActions } from './feed.actions';

export interface FeedState {
  readonly posts: readonly FeedPost[];
  readonly postIndex: Readonly<Record<string, number>>;
  readonly loading: boolean;
  readonly error: string | null;
  readonly cursor: string | null;
  readonly filters: FeedFilterState;
  readonly connected: boolean;
  readonly reconnecting: boolean;
  readonly connectionError: string | null;
  readonly optimisticMap: Readonly<Record<string, string>>; // tempId -> idempotencyKey
  readonly onboardingSeen: boolean;
  readonly drawerPostId: string | null;
  readonly hydrated: boolean;
  readonly unseenIds: readonly string[];
}

const INITIAL_FILTERS: FeedFilterState = {
  country: null,
  province: null,
  sectors: [],
  needTypes: [],
  onlyUnread: false,
  sort: 'latest',
  search: '',
};

const INITIAL_STATE: FeedState = {
  posts: [],
  postIndex: {},
  loading: false,
  error: null,
  cursor: null,
  filters: INITIAL_FILTERS,
  connected: false,
  reconnecting: false,
  connectionError: null,
  optimisticMap: {},
  onboardingSeen: false,
  drawerPostId: null,
  hydrated: false,
  unseenIds: [],
};

export const feedReducer = createReducer(
  INITIAL_STATE,
  on(FeedActions.loadInitial, state => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FeedActions.loadPage, (state, { append }) => ({
    ...state,
    loading: true,
    error: null,
    posts: append ? state.posts : [],
    postIndex: append ? state.postIndex : {},
  })),
  on(FeedActions.loadSuccess, (state, { posts, cursor, append }) => ({
    ...state,
    loading: false,
    error: null,
    cursor,
    ...mergePosts(append ? state.posts : [], append ? state.postIndex : {}, posts),
    hydrated: true,
  })),
  on(FeedActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(FeedActions.receiveRealtimeEnvelope, (state, { envelope }) =>
    reduceRealtimeEnvelope(state, envelope)
  ),
  on(FeedActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters,
  })),
  on(FeedActions.optimisticPublish, (state, { post, idempotencyKey }) => {
    const optimisticId = `optimistic-${idempotencyKey}`;
    const optimisticPost = { ...post, id: optimisticId, status: 'pending' as const };
    const optimisticMap = { ...state.optimisticMap, [optimisticId]: idempotencyKey };
    const posts = [optimisticPost, ...state.posts];
    return {
      ...state,
      posts,
      postIndex: createPostIndex(posts),
      optimisticMap,
      unseenIds: state.unseenIds.includes(optimisticId)
        ? state.unseenIds
        : [optimisticId, ...state.unseenIds],
    };
  }),
  on(FeedActions.publishSuccess, (state, { tempId, post }) => {
    const { [tempId]: _, ...optimisticMap } = state.optimisticMap;
    const posts = state.posts.map(existing =>
      existing.id === tempId ? { ...post, status: 'confirmed' as const } : existing
    );
    return {
      ...state,
      posts,
      postIndex: createPostIndex(posts),
      optimisticMap,
      unseenIds: state.unseenIds.filter(id => id !== tempId && id !== post.id),
    };
  }),
  on(FeedActions.publishFailure, (state, { tempId, error }) => {
    if (!state.posts.some(post => post.id === tempId)) {
      return state;
    }
    const posts = state.posts.map(post =>
      post.id === tempId ? { ...post, status: 'failed' as const, accessibilitySummary: error } : post
    );
    return {
      ...state,
      posts,
      optimisticMap: state.optimisticMap,
    };
  }),
  on(FeedActions.setConnectionError, (state, { error }) => ({
    ...state,
    connectionError: error,
  })),
  on(FeedActions.setConnectionStatus, (state, { connected, reconnecting }) => ({
    ...state,
    connected,
    reconnecting,
  })),
  on(FeedActions.hydrateSnapshot, (state, { snapshot }) => ({
    ...state,
    posts: snapshot.posts,
    postIndex: createPostIndex(snapshot.posts),
    cursor: snapshot.cursor,
    filters: snapshot.filters,
    onboardingSeen: snapshot.onboardingSeen,
    hydrated: true,
  })),
  on(FeedActions.markOnboardingSeen, state => ({
    ...state,
    onboardingSeen: true,
  })),
  on(FeedActions.openDrawer, (state, { postId }) => ({
    ...state,
    drawerPostId: postId,
  }))
);

function mergePosts(
  current: readonly FeedPost[],
  currentIndex: Readonly<Record<string, number>>,
  next: readonly FeedPost[]
): { posts: readonly FeedPost[]; postIndex: Readonly<Record<string, number>> } {
  if (!next.length) {
    return { posts: current, postIndex: currentIndex };
  }

  const dedupedNext: FeedPost[] = [];
  const seenNext = new Map<string, FeedPost>();
  for (const post of next) {
    if (!post?.id) {
      continue;
    }
    const existing = seenNext.get(post.id);
    if (!existing || shouldReplace(existing, post)) {
      seenNext.set(post.id, post);
    }
  }
  dedupedNext.push(...seenNext.values());

  if (!dedupedNext.length) {
    return { posts: current, postIndex: currentIndex };
  }

  const posts = current.slice();
  const indexLookup = new Map<string, number>();
  current.forEach((post, idx) => {
    if (post?.id) {
      indexLookup.set(post.id, idx);
    }
  });

  const rebuildIndexLookup = () => {
    indexLookup.clear();
    posts.forEach((post, idx) => {
      if (post?.id) {
        indexLookup.set(post.id, idx);
      }
    });
  };

  let mutated = false;

  for (const post of dedupedNext) {
    const postId = post.id;
    const existingIndex = indexLookup.get(postId);

    if (existingIndex === undefined) {
      const insertAt = findInsertIndex(posts, post.createdAt);
      posts.splice(insertAt, 0, post);
      mutated = true;
      rebuildIndexLookup();
      continue;
    }

    const existingPost = posts[existingIndex];
    if (!shouldReplace(existingPost, post)) {
      continue;
    }

    const createdAtChanged = (existingPost.createdAt ?? '') !== (post.createdAt ?? '');

    if (createdAtChanged) {
      posts.splice(existingIndex, 1);
      const insertAt = findInsertIndex(posts, post.createdAt);
      posts.splice(insertAt, 0, post);
      rebuildIndexLookup();
    } else {
      posts[existingIndex] = post;
      indexLookup.set(postId, existingIndex);
    }
    mutated = true;
  }

  if (!mutated) {
    return { posts: current, postIndex: currentIndex };
  }

  const normalizedPosts = posts.slice();
  return {
    posts: normalizedPosts,
    postIndex: createPostIndex(normalizedPosts),
  };
}

function reduceRealtimeEnvelope(state: FeedState, envelope: FeedRealtimeEnvelope): FeedState {
  const { payload, type, cursor } = envelope;
  switch (type) {
    case 'feed.post.created': {
      const post = payload as FeedPost;
      const merged = mergePosts(state.posts, state.postIndex, [post]);
      return {
        ...state,
        ...merged,
        cursor: cursor ?? state.cursor,
        unseenIds: state.unseenIds.includes(post.id)
          ? state.unseenIds
          : [post.id, ...state.unseenIds].slice(0, 200),
      };
    }
    case 'feed.post.updated': {
      const post = payload as FeedPost;
      return {
        ...state,
        ...mergePosts(state.posts, state.postIndex, [post]),
      };
    }
    case 'feed.post.deleted': {
      const post = payload as FeedPost;
      const posts = state.posts.filter(existing => existing.id !== post.id);
      return {
        ...state,
        posts,
        postIndex: createPostIndex(posts),
        unseenIds: state.unseenIds.filter(id => id !== post.id),
      };
    }
    case 'feed.reply.created': {
      const reply = payload as FeedReply;
      const posts = state.posts.map(post => {
        if (post.id !== reply.postId) {
          return post;
        }
        const replies = post.replies ? [...post.replies] : [];
        if (!replies.some(existing => existing.id === reply.id)) {
          replies.push(reply);
        }
        return { ...post, replies, metrics: { ...post.metrics, replies: post.metrics.replies + 1 } };
      });
      return {
        ...state,
        posts,
      };
    }
    case 'feed.reply.deleted': {
      const reply = payload as FeedReply;
      const posts = state.posts.map(post => {
        if (post.id !== reply.postId || !post.replies?.length) {
          return post;
        }
        const replies = post.replies.filter(existing => existing.id !== reply.id);
        return { ...post, replies, metrics: { ...post.metrics, replies: Math.max(0, post.metrics.replies - 1) } };
      });
      return {
        ...state,
        posts,
      };
    }
    default:
      return state;
  }
}

function createPostIndex(posts: readonly FeedPost[]): Readonly<Record<string, number>> {
  const index: Record<string, number> = {};
  posts.forEach((post, position) => {
    if (post?.id) {
      index[post.id] = position;
    }
  });
  return index;
}

function shouldReplace(existing: FeedPost, incoming: FeedPost): boolean {
  const incomingUpdatedAt = incoming.updatedAt ?? null;
  const existingUpdatedAt = existing.updatedAt ?? null;

  if (!incomingUpdatedAt) {
    return false;
  }

  if (!existingUpdatedAt) {
    return true;
  }

  return incomingUpdatedAt > existingUpdatedAt;
}

function findInsertIndex(posts: readonly FeedPost[], createdAt: string | undefined | null): number {
  const target = createdAt ?? '';
  let low = 0;
  let high = posts.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    const midValue = posts[mid]?.createdAt ?? '';
    if (midValue.localeCompare(target) > 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export function toFeedSnapshot(state: FeedState): FeedSnapshot {
  return {
    posts: state.posts,
    cursor: state.cursor,
    filters: state.filters,
    onboardingSeen: state.onboardingSeen,
  };
}
