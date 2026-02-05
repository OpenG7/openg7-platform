import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { HomeFeedFilter, HomeFeedScope } from '@app/domains/home/services/home-feed.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-home-feed-section',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-feed-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFeedSectionComponent {
  readonly feedScopes = input.required<ReadonlyArray<{ id: HomeFeedScope; label: string }>>();
  readonly activeFeedScope = input.required<HomeFeedScope>();
  readonly feedFilters = input.required<ReadonlyArray<{ id: HomeFeedFilter; label: string }>>();
  readonly activeFeedFilter = input.required<HomeFeedFilter>();
  readonly searchDraft = input.required<string>();

  @Output() readonly scopeChanged = new EventEmitter<HomeFeedScope>();
  @Output() readonly filterChanged = new EventEmitter<HomeFeedFilter>();
  @Output() readonly searchChanged = new EventEmitter<string>();

  protected trackFeedScope(_index: number, scope: { id: HomeFeedScope }): HomeFeedScope {
    return scope.id;
  }

  protected trackFeedFilter(_index: number, filter: { id: HomeFeedFilter }): HomeFeedFilter {
    return filter.id;
  }

  protected onSearchInput(value: string): void {
    this.searchChanged.emit(value);
  }
}
