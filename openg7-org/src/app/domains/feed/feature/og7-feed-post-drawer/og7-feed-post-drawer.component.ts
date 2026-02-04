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

import { FeedItem } from '../models/feed.models';
import { JsonDateAgoPipe } from '../pipes/json-date-ago.pipe';

@Component({
  selector: 'og7-feed-post-drawer',
  standalone: true,
  imports: [CommonModule, TranslateModule, JsonDateAgoPipe],
  templateUrl: './og7-feed-post-drawer.component.html',
  styleUrls: ['./og7-feed-post-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Og7FeedPostDrawerComponent {
  readonly item = input<FeedItem | null>(null);
  readonly open = input(false);
  readonly fromLabel = input<string | null>(null);
  readonly toLabel = input<string | null>(null);
  readonly sectorLabel = input<string | null>(null);

  readonly closed = output<void>();

  protected readonly visible = computed(() => this.open() && Boolean(this.item()));

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
