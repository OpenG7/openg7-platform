import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FiltersService } from '@app/core/filters.service';
import { DEMO_OPPORTUNITY_MATCHES, findDemoFinancingBanner } from '@app/core/fixtures/opportunity-demo';
import { OpportunityMatch } from '@app/core/models/opportunity';
import { FinancingBanner } from '@app/core/models/partner-profile';
import { AnalyticsService } from '@app/core/observability/analytics.service';
import { MapStatsService } from '@app/core/services/map-stats.service';
import { OpportunityAiPrefillService } from '@app/core/services/opportunity-ai-prefill.service';
import { OpportunityService } from '@app/core/services/opportunity.service';
import { HomeFiltersSectionComponent } from '@app/domains/home/feature/home-filters-section/home-filters-section.component';
import { HomeHeroSectionComponent } from '@app/domains/home/feature/home-hero-section/home-hero-section.component';
import { HomeInputsSectionComponent } from '@app/domains/home/feature/home-inputs-section/home-inputs-section.component';
import { HomeMapSectionComponent } from '@app/domains/home/feature/home-map-section/home-map-section.component';
import { HomeStatisticsSectionComponent } from '@app/domains/home/feature/home-statistics-section/home-statistics-section.component';
import { IntroductionRequestContext } from '@app/domains/matchmaking/sections/og7-intro-billboard.section';
import { OpportunityMatchesSection } from '@app/domains/opportunities/sections/opportunity-matches.section';
import { StatMetric } from '@app/shared/components/hero/hero-stats/hero-stats.component';
import { selectFilteredFlows, selectMapKpis } from '@app/state';
import { AppState } from '@app/state/app.state';
import { Store } from '@ngrx/store';

@Component({
  standalone: true,
  selector: 'og7-home-page',
  imports: [
    HomeHeroSectionComponent,
    HomeMapSectionComponent,
    HomeStatisticsSectionComponent,
    HomeInputsSectionComponent,
    HomeFiltersSectionComponent,
    OpportunityMatchesSection,
  ],
  templateUrl: './og7-home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/home/pages/home » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Home Page ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7HomePageComponent gérée par le framework.
 */
export class Og7HomePageComponent {
  private readonly opportunities = inject(OpportunityService);
  private readonly aiPrefill = inject(OpportunityAiPrefillService);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);
  private readonly store = inject(Store<AppState>);
  private readonly filters = inject(FiltersService);
  private readonly mapStats = inject(MapStatsService);

  private readonly selectedMatchId = signal<number | null>(null);
  private readonly financingBanner = signal<FinancingBanner | null>(null);

  private readonly flows = this.store.selectSignal(selectFilteredFlows);
  private readonly kpis = this.store.selectSignal(selectMapKpis);

  protected readonly matches = this.opportunities.items();
  protected readonly loading = this.opportunities.loading();
  protected readonly error = this.opportunities.error();

  protected readonly keyMetrics = computed<StatMetric[]>(() =>
    this.mapStats.buildMetrics(this.flows(), this.kpis(), this.filters.tradePartner())
  );

  protected readonly activeMatch = computed(() => this.resolveMatch(this.selectedMatchId()));
  protected readonly activeFinancingBanner = computed(() => this.financingBanner());

  constructor() {
    this.aiPrefill.prefillFromPreferences();

    if (!this.matches().length) {
      this.opportunities.hydrateWithDemo(DEMO_OPPORTUNITY_MATCHES);
    }

    effect(() => {
      const list = this.matches();
      if (!this.selectedMatchId() && list.length) {
        this.applySelection(list[0].id);
      }
    });
  }

  protected onConnectRequested(matchId: number): void {
    this.logOpportunityConnect(matchId);
    void this.router.navigate(['/linkup', matchId]);
  }

  protected onRetryRequested(): void {
    this.opportunities.reload();
  }

  protected onIntroductionRequested(context: IntroductionRequestContext): void {
    const match = context.match ?? this.activeMatch();
    if (!match) {
      return;
    }
    void this.router.navigate(['/linkup', match.id]);
  }

  protected onMatchSelected(matchId: number | null): void {
    if (matchId == null) {
      this.selectedMatchId.set(null);
      this.financingBanner.set(null);
      return;
    }

    this.applySelection(matchId);
  }

  private logOpportunityConnect(matchId: number): void {
    this.analytics.emit(
      'opportunity_connect_clicked',
      { matchId, source: 'home_page' },
      { priority: true }
    );
  }

  private applySelection(matchId: number): void {
    this.selectedMatchId.set(matchId);
    const match = this.resolveMatch(matchId);
    if (!match) {
      this.financingBanner.set(null);
      return;
    }
    this.financingBanner.set(this.resolveFinancing(match));
  }

  private resolveMatch(matchId: number | null): OpportunityMatch | null {
    if (matchId == null) {
      return null;
    }
    return this.matches().find((item) => item.id === matchId) ?? null;
  }

  private resolveFinancing(match: OpportunityMatch): FinancingBanner | null {
    return findDemoFinancingBanner(match);
  }
}

