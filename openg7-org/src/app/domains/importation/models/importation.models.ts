export type ImportationPeriodGranularity = 'month' | 'quarter' | 'year';

export type ImportationOriginScope =
  | 'global'
  | 'g7'
  | 'usmca'
  | 'european_union'
  | 'indo_pacific'
  | 'custom';

export interface ImportationFilters {
  readonly periodGranularity: ImportationPeriodGranularity;
  readonly periodValue: string | null;
  readonly originScope: ImportationOriginScope;
  readonly originCodes: readonly string[];
  readonly hsSections: readonly string[];
  readonly compareMode: boolean;
  readonly compareWith: string | null;
}

export interface ImportationKpiTile {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta?: number | null;
  readonly deltaLabel?: string | null;
  readonly trend?: 'up' | 'down' | 'flat';
  readonly sparkline: readonly number[];
  readonly tooltip?: string | null;
}

export interface ImportationTimelinePoint {
  readonly id: string;
  readonly label: string;
  readonly totalValue: number;
  readonly yoyDelta: number | null;
  readonly isProjected?: boolean;
}

export interface ImportationFlowCorridor {
  readonly target: string;
  readonly value: number;
  readonly delta: number | null;
}

export interface ImportationFlowNodeViewModel {
  readonly originCode: string;
  readonly originName: string;
  readonly value: number;
  readonly yoyDelta: number | null;
  readonly share: number | null;
  readonly coordinate?: readonly [number, number];
  readonly corridors: readonly ImportationFlowCorridor[];
}

export interface ImportationFlowMapViewModel {
  readonly loading: boolean;
  readonly error: string | null;
  readonly timeline: readonly ImportationTimelinePoint[];
  readonly selectedPoint: string | null;
  readonly compareMode: boolean;
  readonly compareTarget: string | null;
  readonly playing: boolean;
  readonly coverage: number | null;
  readonly legendMin: number | null;
  readonly legendMax: number | null;
  readonly flows: readonly ImportationFlowNodeViewModel[];
}

export interface ImportationOverviewViewModel {
  readonly title: string;
  readonly breadcrumb: readonly { label: string; link: string | null }[];
  readonly meta: {
    readonly lastUpdated: string | null;
    readonly dataProvider: string | null;
    readonly coverageLabel: string | null;
  };
  readonly filters: {
    readonly filters: ImportationFilters;
    readonly granularityOptions: readonly { id: ImportationPeriodGranularity; label: string }[];
    readonly originOptions: readonly {
      id: ImportationOriginScope;
      label: string;
      description: string;
    }[];
    readonly hsSectionOptions: readonly { id: string; label: string }[];
    readonly selectedHsSections: readonly string[];
    readonly originCodes: readonly string[];
  };
  readonly kpis: readonly ImportationKpiTile[];
}

export type ImportationCommodityTab = 'top' | 'emerging' | 'risk';

export interface ImportationRiskFlag {
  readonly id: string;
  readonly severity: 'low' | 'medium' | 'high';
  readonly title: string;
  readonly description: string;
  readonly recommendedAction?: string;
  readonly relatedCommodityId?: string;
}

export interface ImportationCommodityRowViewModel {
  readonly id: string;
  readonly hsCode: string;
  readonly label: string;
  readonly value: number;
  readonly yoyDelta: number | null;
  readonly riskScore: number | null;
  readonly sparkline: readonly number[];
  readonly flags: readonly ImportationRiskFlag[];
}

export interface ImportationCommoditySectionViewModel {
  readonly loading: boolean;
  readonly error: string | null;
  readonly activeTab: ImportationCommodityTab;
  readonly tabs: readonly { id: ImportationCommodityTab; label: string; count: number }[];
  readonly rows: readonly ImportationCommodityRowViewModel[];
  readonly selectedCommodityId: string | null;
  readonly selectedCommodityFlags: readonly ImportationRiskFlag[];
  readonly canExport: boolean;
}

export interface ImportationSupplierCardViewModel {
  readonly id: string;
  readonly name: string;
  readonly dependencyScore: number | null;
  readonly diversificationScore: number | null;
  readonly reliability: number | null;
  readonly country: string;
  readonly lastReviewed: string | null;
  readonly recommendation: string | null;
}

export interface ImportationSupplierSectionViewModel {
  readonly loading: boolean;
  readonly error: string | null;
  readonly suppliers: readonly ImportationSupplierCardViewModel[];
}

export interface ImportationWatchlistItemViewModel {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly updatedAt: string;
  readonly filtersSummary: string;
}

export interface ImportationAnnotationViewModel {
  readonly id: string;
  readonly author: string;
  readonly authorAvatarUrl?: string;
  readonly excerpt: string;
  readonly createdAt: string;
  readonly relatedLabel?: string;
}

export interface ImportationCollaborationViewModel {
  readonly loading: boolean;
  readonly error: string | null;
  readonly watchlists: readonly ImportationWatchlistItemViewModel[];
  readonly annotations: readonly ImportationAnnotationViewModel[];
  readonly canManageWatchlists: boolean;
  readonly canScheduleReports: boolean;
  readonly canViewCollaboration: boolean;
}

export interface ImportationKnowledgeArticleCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly link: string;
  readonly tag: string;
  readonly thumbnailUrl?: string;
}

export interface ImportationKnowledgeSectionViewModel {
  readonly loading: boolean;
  readonly error: string | null;
  readonly articles: readonly ImportationKnowledgeArticleCardViewModel[];
  readonly cta: {
    readonly title: string;
    readonly subtitle: string;
    readonly actionLabel: string;
    readonly actionLink: string;
  } | null;
}
