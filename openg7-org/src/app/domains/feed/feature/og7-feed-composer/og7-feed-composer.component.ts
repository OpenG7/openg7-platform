import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { selectProvinces, selectSectors } from '@app/state/catalog/catalog.selectors';
import { feedModeSig, feedTypeSig, fromProvinceIdSig, sectorIdSig, toProvinceIdSig } from '@app/state/shared-feed-signals';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { FeedComposerDraft, FeedItemType, FlowMode, QuantityUnit } from '../models/feed.models';
import { FeedRealtimeService } from '../services/feed-realtime.service';

@Component({
  selector: 'og7-feed-composer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './og7-feed-composer.component.html',
  styleUrls: ['./og7-feed-composer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Og7FeedComposerComponent {
  private readonly feed = inject(FeedRealtimeService);
  private readonly store = inject(Store);

  protected readonly type = signal<FeedItemType | null>(feedTypeSig());
  protected readonly sectorId = signal<string | null>(sectorIdSig());
  protected readonly mode = signal<FlowMode>(feedModeSig());
  protected readonly fromProvinceId = signal<string | null>(fromProvinceIdSig());
  protected readonly toProvinceId = signal<string | null>(toProvinceIdSig());
  protected readonly title = signal('');
  protected readonly summary = signal('');
  protected readonly quantityValue = signal('');
  protected readonly quantityUnit = signal<QuantityUnit | ''>('');
  protected readonly tagsInput = signal('');

  protected readonly submitting = signal(false);
  protected readonly errors = signal<readonly string[]>([]);
  protected readonly warnings = signal<readonly string[]>([]);

  protected readonly provinces = this.store.selectSignal(selectProvinces);
  protected readonly sectors = this.store.selectSignal(selectSectors);

  protected readonly typeOptions: FeedItemType[] = [
    'OFFER',
    'REQUEST',
    'ALERT',
    'TENDER',
    'CAPACITY',
    'INDICATOR',
  ];

  protected readonly modeOptions: FlowMode[] = ['BOTH', 'EXPORT', 'IMPORT'];
  protected readonly unitOptions: QuantityUnit[] = [
    'MW',
    'MWh',
    'bbl_d',
    'ton',
    'kg',
    'hours',
    'cad',
    'usd',
  ];

  protected readonly canSubmit = computed(() => {
    return (
      !this.submitting() &&
      Boolean(this.type()) &&
      Boolean(this.sectorId()) &&
      this.title().trim().length >= 3 &&
      this.summary().trim().length >= 10
    );
  });

  protected handleSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const quantity =
      this.quantityValue().trim().length > 0
        ? {
            value: Number(this.quantityValue()),
            unit: this.quantityUnit() as QuantityUnit,
          }
        : null;
    const tags = this.tagsInput()
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    const draft: FeedComposerDraft = {
      type: this.type(),
      title: this.title(),
      summary: this.summary(),
      sectorId: this.sectorId(),
      fromProvinceId: this.fromProvinceId(),
      toProvinceId: this.toProvinceId(),
      mode: this.mode(),
      quantity,
      tags: tags.length ? tags : undefined,
    };
    const validation = this.feed.publish(draft);
    this.errors.set(validation.errors);
    this.warnings.set(validation.warnings);
    if (validation.valid) {
      this.submitting.set(true);
      this.title.set('');
      this.summary.set('');
      this.quantityValue.set('');
      this.quantityUnit.set('');
      this.tagsInput.set('');
      setTimeout(() => this.submitting.set(false), 250);
    }
  }

  protected updateType(value: string): void {
    const next = value ? (value as FeedItemType) : null;
    this.type.set(next);
  }

  protected updateSector(value: string): void {
    this.sectorId.set(value || null);
  }

  protected updateMode(value: string): void {
    this.mode.set((value as FlowMode) || 'BOTH');
  }

  protected updateFromProvince(value: string): void {
    this.fromProvinceId.set(value || null);
  }

  protected updateToProvince(value: string): void {
    this.toProvinceId.set(value || null);
  }

  protected clearDraft(): void {
    this.title.set('');
    this.summary.set('');
    this.quantityValue.set('');
    this.quantityUnit.set('');
    this.tagsInput.set('');
  }
}
