import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FeedRealtimeService } from '../services/feed-realtime.service';
import { FeedPost, FeedRealtimeConnectionState } from '../models/feed.models';
import { Og7FeedCardComponent } from '../og7-feed-card/og7-feed-card.component';
import { Og7FeedComposerComponent } from '../og7-feed-composer/og7-feed-composer.component';
import { Og7FeedPostDrawerComponent } from '../og7-feed-post-drawer/og7-feed-post-drawer.component';
import {
  activeSectorsSig,
  feedSearchSig,
  feedSortSig,
  focusPostIdSig,
  hasActiveFiltersSig,
  needTypeSig,
  selectedProvinceSig,
} from '@app/state/shared-feed-signals';

@Component({
  selector: 'og7-feed-stream',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    Og7FeedCardComponent,
    Og7FeedComposerComponent,
    Og7FeedPostDrawerComponent,
  ],
  templateUrl: './og7-feed-stream.component.html',
  styleUrls: ['./og7-feed-stream.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/feed/feature/og7-feed-stream » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Feed Stream ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FeedStreamComponent gérée par le framework.
 */
export class Og7FeedStreamComponent {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feed = inject(FeedRealtimeService);

  readonly posts = input<readonly FeedPost[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly unreadCount = input(0);
  readonly connectionState = input.required<FeedRealtimeConnectionState>();

  readonly loadMore = output<void>();
  readonly refresh = output<void>();
  readonly openPost = output<string>();
  readonly closePost = output<void>();

  private readonly sentinelRef = viewChild<ElementRef<HTMLElement>>('sentinel');
  private lastFocusedElement: HTMLElement | null = null;

  protected readonly selectedProvince = selectedProvinceSig;
  protected readonly activeSectors = activeSectorsSig;
  protected readonly needTypes = needTypeSig;
  protected readonly searchTerm = feedSearchSig;
  protected readonly sortOrder = feedSortSig;
  protected readonly hasFilters = hasActiveFiltersSig;

  protected readonly onboardingVisible = computed(() => !this.feed.hasHydrated());
  protected readonly bannerVisible = computed(() => this.unreadCount() > 0);
  protected readonly connectionLabel = computed(() => {
    const state = this.connectionState();
    if (state.reconnecting()) {
      return 'feed.status.reconnecting';
    }
    if (!state.connected()) {
      return 'feed.status.offline';
    }
    return state.error() ? 'feed.status.degraded' : 'feed.status.online';
  });

  protected readonly selectedPost = computed(() => {
    const id = focusPostIdSig();
    if (!id) {
      return null;
    }
    return this.posts().find(post => post.id === id) ?? null;
  });

  private observer?: IntersectionObserver;

  constructor() {
    effect(() => {
      const sentinel = this.sentinelRef();
      if (!sentinel) {
        return;
      }
      this.setupObserver(sentinel.nativeElement);
    });
  }

  protected handleRefresh(): void {
    this.refresh.emit();
  }

  protected handleViewPost(post: FeedPost): void {
    if (typeof document !== 'undefined') {
      const active = document.activeElement;
      this.lastFocusedElement = active instanceof HTMLElement ? active : null;
    }
    this.openPost.emit(post.id);
  }

  protected handleCloseDrawer(): void {
    focusPostIdSig.set(null);
    this.closePost.emit();
    this.restoreFocus();
  }

  protected clearFilters(): void {
    selectedProvinceSig.set(null);
    activeSectorsSig.set([]);
    needTypeSig.set([]);
    feedSearchSig.set('');
  }

  protected trackPost(index: number, post: FeedPost): string {
    return post.id ?? `post-${index}`;
  }

  private setupObserver(element: HTMLElement): void {
    this.destroyObserver();
    if (!element) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }
        if (this.loading()) {
          return;
        }
        this.zone.run(() => this.loadMore.emit());
      });
      this.observer.observe(element);
    });

    this.destroyRef.onDestroy(() => this.destroyObserver());
  }

  private destroyObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private restoreFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const target = this.lastFocusedElement;
    if (!target || typeof target.focus !== 'function') {
      return;
    }
    const invoke = () => target.focus();
    this.zone.runOutsideAngular(() => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(invoke);
      } else {
        setTimeout(invoke, 0);
      }
    });
  }
}
