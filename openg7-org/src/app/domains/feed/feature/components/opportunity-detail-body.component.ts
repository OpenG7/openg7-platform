import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  OpportunityDetailSectionItem,
  OpportunityDocumentLink,
  OpportunityQnaMessage,
  OpportunityQnaTab,
} from './opportunity-detail.models';
import { OpportunityQnaComponent } from './opportunity-qna.component';

@Component({
  selector: 'og7-opportunity-detail-body',
  standalone: true,
  imports: [CommonModule, TranslateModule, OpportunityQnaComponent],
  templateUrl: './opportunity-detail-body.component.html',
  styleUrl: './opportunity-detail-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityDetailBodyComponent {
  readonly summaryHeadline = input.required<string>();
  readonly periodLabel = input.required<string>();
  readonly deliveryPoint = input.required<string>();
  readonly pricingType = input.required<string>();

  readonly specs = input<readonly OpportunityDetailSectionItem[]>([]);
  readonly terms = input<readonly OpportunityDetailSectionItem[]>([]);
  readonly documents = input<readonly OpportunityDocumentLink[]>([]);

  readonly qnaMessages = input<readonly OpportunityQnaMessage[]>([]);
  readonly qnaTab = input<OpportunityQnaTab>('questions');

  readonly qnaTabChange = output<OpportunityQnaTab>();
  readonly qnaSubmitReply = output<string>();
}
