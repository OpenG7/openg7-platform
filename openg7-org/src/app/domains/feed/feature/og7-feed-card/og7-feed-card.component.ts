import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FeedPost } from '../models/feed.models';
import { JsonDateAgoPipe } from '../pipes/json-date-ago.pipe';
import { JsonDateRelativePipe } from '../pipes/json-date-relative.pipe';

@Component({
  selector: 'og7-feed-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, JsonDateAgoPipe, JsonDateRelativePipe],
  templateUrl: './og7-feed-card.component.html',
  styleUrls: ['./og7-feed-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/feed/feature/og7-feed-card » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Feed Card ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FeedCardComponent gérée par le framework.
 */
export class Og7FeedCardComponent {
  readonly post = input.required<FeedPost>();
  readonly highlight = input(false);
  readonly disabled = input(false);

  readonly view = output<FeedPost>();
  readonly reply = output<FeedPost>();
  readonly like = output<FeedPost>();
  readonly share = output<FeedPost>();

  protected readonly expiresSoon = computed(() => {
    const post = this.post();
    if (!post.expiresAt) {
      return false;
    }
    const expiry = new Date(post.expiresAt).getTime();
    return Number.isFinite(expiry) && expiry - Date.now() < 48 * 3600 * 1000;
  });

  protected readonly ariaLabel = computed(() => {
    const post = this.post();
    return `${post.author.displayName} · ${post.metrics.replies} replies`;
  });

  @HostBinding('attr.tabindex')
  readonly tabIndex = 0;

  @HostBinding('attr.role')
  readonly role = 'article';

  @HostBinding('class.is-highlighted')
  get isHighlighted(): boolean {
    return this.highlight();
  }

  protected handleView(): void {
    if (this.disabled()) {
      return;
    }
    this.view.emit(this.post());
  }

  protected handleReply(): void {
    if (this.disabled()) {
      return;
    }
    this.reply.emit(this.post());
  }

  protected handleLike(): void {
    if (this.disabled()) {
      return;
    }
    this.like.emit(this.post());
  }

  protected handleShare(): void {
    if (this.disabled()) {
      return;
    }
    this.share.emit(this.post());
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected onActivate(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    event.preventDefault();
    this.handleView();
  }
}
