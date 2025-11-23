import { Signal } from '@angular/core';

export interface FeedAuthor {
  readonly id: string;
  readonly displayName: string;
  readonly avatarUrl?: string | null;
  readonly organization?: string | null;
  readonly title?: string | null;
}

export interface FeedAttachment {
  readonly id: string;
  readonly kind: 'image' | 'document' | 'link';
  readonly url: string;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly mimeType?: string | null;
  readonly sizeBytes?: number | null;
  readonly previewUrl?: string | null;
}

export interface FeedReply {
  readonly id: string;
  readonly postId: string;
  readonly author: FeedAuthor;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  readonly expiresAt?: string | null;
  readonly moderated?: boolean;
  readonly parentReplyId?: string | null;
  readonly attachments?: readonly FeedAttachment[];
}

export type FeedComposerChannel = 'global' | 'sector' | 'province' | 'private';

export interface FeedPost {
  readonly id: string;
  readonly author: FeedAuthor;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  readonly expiresAt?: string | null;
  readonly sectors?: readonly string[];
  readonly province?: string | null;
  readonly country?: string | null;
  readonly needTypes?: readonly string[];
  readonly attachments?: readonly FeedAttachment[];
  readonly metrics: FeedPostMetrics;
  readonly replies?: readonly FeedReply[];
  readonly pinned?: boolean;
  readonly channel: FeedComposerChannel;
  readonly status?: 'confirmed' | 'pending' | 'failed';
  readonly optimisticIdempotencyKey?: string;
  readonly moderationLabels?: readonly string[];
  readonly accessibilitySummary?: string | null;
}

export interface FeedPostMetrics {
  readonly likes: number;
  readonly replies: number;
  readonly shares: number;
  readonly impressions?: number;
}

export interface FeedRealtimeEnvelope {
  readonly eventId?: string;
  readonly type:
    | 'feed.post.created'
    | 'feed.post.updated'
    | 'feed.post.deleted'
    | 'feed.reply.created'
    | 'feed.reply.deleted'
    | 'feed.analytics';
  readonly payload: unknown;
  readonly cursor?: string | null;
}

export interface FeedFilterState {
  readonly country: string | null;
  readonly province: string | null;
  readonly sectors: readonly string[];
  readonly needTypes: readonly string[];
  readonly onlyUnread: boolean;
  readonly sort: 'latest' | 'trending' | 'recommended';
  readonly search: string;
}

export interface FeedSnapshot {
  readonly posts: readonly FeedPost[];
  readonly cursor: string | null;
  readonly filters: FeedFilterState;
  readonly onboardingSeen: boolean;
}

export interface FeedComposerDraft {
  readonly content: string;
  readonly attachments?: readonly FeedAttachment[];
  readonly channel: FeedComposerChannel;
  readonly province?: string | null;
  readonly country?: string | null;
  readonly sectors?: readonly string[];
  readonly needTypes?: readonly string[];
}

export interface FeedComposerValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface FeedRealtimeConnectionState {
  readonly connected: Signal<boolean>;
  readonly reconnecting: Signal<boolean>;
  readonly error: Signal<string | null>;
}
