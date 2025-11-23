import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FeedRealtimeService } from './services/feed-realtime.service';
import { Og7FeedStreamComponent } from './og7-feed-stream/og7-feed-stream.component';

@Component({
  selector: 'og7-feed-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, Og7FeedStreamComponent],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Feed » du dossier « domains/feed/feature ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FeedPage gérée par le framework.
 */
export class FeedPage {
  private readonly feed = inject(FeedRealtimeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly posts = this.feed.posts;
  readonly loading = this.feed.loading;
  readonly error = this.feed.error;
  readonly unreadCount = computed(() => this.feed.unreadCount());
  readonly connectionState = this.feed.connectionState;
  protected readonly shortcutsHeadingId = 'feed-shortcuts-heading';

  constructor() {
    effect(() => {
      if (!this.feed.hasHydrated()) {
        this.feed.loadInitial();
      }
    });
  }

  @HostListener('window:focus')
  refreshOnFocus(): void {
    this.feed.refreshConnection();
  }

  @HostListener('document:keydown', ['$event'])
  handleShortcuts(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'r') {
      event.preventDefault();
      this.handleRefresh();
    }
    if (key === 'l') {
      event.preventDefault();
      this.handleLoadMore();
    }
  }

  handleLoadMore(): void {
    this.feed.loadMore();
  }

  handleRefresh(): void {
    this.feed.reload();
  }

  openPost(postId: string): void {
    this.feed.openDrawer(postId);
    void this.router.navigate([postId], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  closePost(): void {
    this.feed.openDrawer(null);
    void this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
