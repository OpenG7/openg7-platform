import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FeedPost } from '../models/feed.models';
import { Og7FeedRepliesComponent } from '../og7-feed-replies/og7-feed-replies.component';
import { JsonDateAgoPipe } from '../pipes/json-date-ago.pipe';

@Component({
  selector: 'og7-feed-post-drawer',
  standalone: true,
  imports: [CommonModule, TranslateModule, Og7FeedRepliesComponent, JsonDateAgoPipe],
  templateUrl: './og7-feed-post-drawer.component.html',
  styleUrls: ['./og7-feed-post-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/feed/feature/og7-feed-post-drawer » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Feed Post Drawer ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FeedPostDrawerComponent gérée par le framework.
 */
export class Og7FeedPostDrawerComponent {
  readonly post = input<FeedPost | null>(null);
  readonly open = input(false);

  readonly closed = output<void>();

  protected readonly visible = computed(() => this.open() && Boolean(this.post()));

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }
      if (this.visible()) {
        document.body.classList.add('og7-feed-drawer-open');
      } else {
        document.body.classList.remove('og7-feed-drawer-open');
      }
    });
  }

  protected handleBackdropClick(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.visible()) {
      this.closed.emit();
    }
  }
}
