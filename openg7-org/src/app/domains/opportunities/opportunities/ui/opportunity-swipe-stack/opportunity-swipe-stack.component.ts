import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

interface OpportunitySwipeStackActorVm {
  readonly name: string;
  readonly provinceLabelKey: string;
  readonly sectorLabelKey: string;
}

interface OpportunitySwipeStackCardVm {
  readonly id: string;
  readonly title: string;
  readonly score: number;
  readonly buyer: OpportunitySwipeStackActorVm;
  readonly supplier: OpportunitySwipeStackActorVm;
  readonly distanceLabel: string | null;
}

export interface OpportunitySwipeStackVm {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly cards: ReadonlyArray<OpportunitySwipeStackCardVm>;
}

type SwipeDirection = 'interested' | 'dismissed' | 'open';

interface SwipeActionState {
  readonly cardId: string;
  readonly direction: SwipeDirection;
}

@Component({
  selector: 'og7-opportunity-swipe-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './opportunity-swipe-stack.component.html',
  styleUrl: './opportunity-swipe-stack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/opportunities/opportunities/ui/opportunity-swipe-stack » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Opportunity Swipe Stack ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns OpportunitySwipeStackComponent gérée par le framework.
 */
export class OpportunitySwipeStackComponent {
  readonly vm = input.required<OpportunitySwipeStackVm>();

  readonly activeIndex = signal(0);
  readonly lastAction = signal<SwipeActionState | null>(null);

  readonly total = computed(() => this.vm().cards.length);
  readonly activeCard = computed(() => this.vm().cards[this.activeIndex()] ?? null);
  readonly remaining = computed(() => Math.max(0, this.total() - this.activeIndex() - 1));
  readonly progressPercent = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }
    return Math.round(((this.activeIndex() + 1) / total) * 100);
  });

  readonly breadcrumb = computed(() =>
    this.vm().cards.map((card, index) => ({
      id: card.id,
      position: index,
      label: `${index + 1} / ${this.vm().cards.length}`,
      active: index === this.activeIndex(),
      passed: index < this.activeIndex(),
    })),
  );

  protected swipe(direction: SwipeDirection): void {
    const card = this.activeCard();
    if (!card) {
      return;
    }

    this.lastAction.set({ cardId: card.id, direction });

    if (direction === 'open') {
      return;
    }

    if (this.activeIndex() < this.total() - 1) {
      this.activeIndex.update((current) => current + 1);
    }
  }

  protected cardTransform(index: number): string {
    const offset = index - this.activeIndex();
    if (offset < 0) {
      return 'translate3d(-140%, 0, 0) rotate(-6deg)';
    }

    if (offset === 0) {
      return 'translate3d(0, 0, 0) rotate(0deg)';
    }

    if (offset === 1) {
      return 'translate3d(0, 6%, 0) scale(0.96)';
    }

    if (offset === 2) {
      return 'translate3d(0, 12%, 0) scale(0.9)';
    }

    return 'translate3d(0, 18%, 0) scale(0.84)';
  }

  protected cardOpacity(index: number): number {
    const offset = index - this.activeIndex();
    if (offset < 0) {
      return 0;
    }

    switch (offset) {
      case 0:
        return 1;
      case 1:
        return 0.92;
      case 2:
        return 0.82;
      default:
        return 0.7;
    }
  }

  protected onBack(): void {
    if (this.activeIndex() === 0) {
      return;
    }
    this.activeIndex.update((current) => Math.max(0, current - 1));
  }
}
