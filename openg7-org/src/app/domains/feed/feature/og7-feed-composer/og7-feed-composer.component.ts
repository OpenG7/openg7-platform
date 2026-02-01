import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { needTypeSig, selectedProvinceSig, activeSectorsSig } from '@app/state/shared-feed-signals';
import { TranslateModule } from '@ngx-translate/core';

import { FeedComposerDraft } from '../models/feed.models';
import { FeedRealtimeService } from '../services/feed-realtime.service';

@Component({
  selector: 'og7-feed-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './og7-feed-composer.component.html',
  styleUrls: ['./og7-feed-composer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/feed/feature/og7-feed-composer » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Feed Composer ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FeedComposerComponent gérée par le framework.
 */
export class Og7FeedComposerComponent {
  private readonly feed = inject(FeedRealtimeService);

  protected readonly draftValue = signal('');
  protected readonly channel = signal<'global' | 'sector' | 'province' | 'private'>('global');
  protected readonly submitting = signal(false);
  protected readonly errors = signal<readonly string[]>([]);
  protected readonly warnings = signal<readonly string[]>([]);
  protected readonly needTypes = needTypeSig;
  protected readonly selectedProvince = selectedProvinceSig;
  protected readonly activeSectors = activeSectorsSig;
  protected readonly channels = ['global', 'sector', 'province', 'private'] as const;

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('composerTextarea');

  protected readonly canSubmit = computed(() => !this.submitting() && this.draftValue().trim().length > 2);
  protected readonly placeholder = computed(() => 'feed.composer.placeholder');

  constructor() {
    effect(() => {
      if (!this.feed.hasHydrated()) {
        this.feed.markOnboardingSeen();
      }
    });
  }

  protected handleSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const draft: FeedComposerDraft = {
      content: this.draftValue(),
      channel: this.channel(),
      province: this.selectedProvince(),
      sectors: [...this.activeSectors()],
      needTypes: [...this.needTypes()],
    };
    const validation = this.feed.publish(draft);
    this.errors.set(validation.errors);
    this.warnings.set(validation.warnings);
    if (validation.valid) {
      this.submitting.set(true);
      this.draftValue.set('');
      setTimeout(() => this.submitting.set(false), 250);
    }
  }

  protected toggleNeedType(tag: string): void {
    const current = new Set(this.needTypes());
    if (current.has(tag)) {
      current.delete(tag);
    } else {
      current.add(tag);
    }
    needTypeSig.set(Array.from(current));
  }

  protected setChannel(channel: 'global' | 'sector' | 'province' | 'private'): void {
    this.channel.set(channel);
  }

  protected updateDraft(value: string): void {
    this.draftValue.set(value);
  }

  protected clearDraft(): void {
    this.draftValue.set('');
  }

  @HostListener('keydown.ctrl.enter')
  protected onCtrlEnter(): void {
    this.handleSubmit();
  }

  protected focusTextarea(): void {
    const textarea = this.textareaRef();
    if (textarea?.nativeElement) {
      textarea.nativeElement.focus();
    }
  }
}
