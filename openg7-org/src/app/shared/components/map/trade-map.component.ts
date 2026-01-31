import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type {
  ColorSpecification,
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
  PropertyValueSpecification,
} from 'maplibre-gl';
import { Store } from '@ngrx/store';
import {
  Flow,
  MapKpiComputed,
  MapKpiSnapshot,
  MapKpis,
  computeMapKpiSnapshot,
  selectFilteredFlows,
  selectMapKpis,
  selectMapReady,
  MapActions,
} from '@app/state';
import { AppState } from '@app/state/app.state';
import { FiltersService, TradeModeFilter } from '@app/core/filters.service';
import { FEATURE_FLAGS } from '@app/core/config/environment.tokens';
import {
  MapFlowFeature,
  MapFlowFeatureCollection,
  MapGeojsonService,
  MapHubFeature,
  MapHubFeatureCollection,
} from '@app/core/services/map-geojson.service';
import { TariffQueryService } from '@app/core/services/tariff-query.service';
import { MapLegendComponent } from './legend/map-legend.component';
import { MapSectorChipsComponent } from './filters/map-sector-chips.component';
import { BasemapToggleComponent } from './controls/basemap-toggle.component';
import { ZoomControlComponent } from './controls/zoom-control.component';

type Coordinates = [number, number];

const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
const MAP_CENTER: Coordinates = [-45, 52];
const MAP_ZOOM = 2.35;

const EMPTY_FLOW_COLLECTION: MapFlowFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const EMPTY_MARKER_COLLECTION: MapHubFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

type LinePaint = {
  readonly 'line-opacity'?: DataDrivenPropertyValueSpecification<number>;
  readonly 'line-color'?: DataDrivenPropertyValueSpecification<ColorSpecification>;
  readonly 'line-width'?: DataDrivenPropertyValueSpecification<number>;
  readonly 'line-blur'?: DataDrivenPropertyValueSpecification<number>;
  readonly 'line-dasharray'?: PropertyValueSpecification<number[]>;
  readonly 'line-gradient'?: ExpressionSpecification;
};
type Expression = ExpressionSpecification;

type FlowCollectionState = {
  readonly collection: MapFlowFeatureCollection;
  readonly hasTariffImpact: boolean;
};

const DEFAULT_FLOW_LAYER_PAINT: LinePaint = {
  'line-color': '#2563eb',
  'line-width': 2.8,
  'line-opacity': 0.85,
  'line-blur': 0.3,
};

const DEFAULT_FLOW_GLOW_PAINT: LinePaint = {
  'line-color': '#ffffff',
  'line-width': 4.6,
  'line-opacity': 0.55,
  'line-blur': 1.2,
};

@Component({
  selector: 'og7-map-trade',
  standalone: true,
  imports: [
    CommonModule,
    NgxMapLibreGLModule,
    MapLegendComponent,
    //MapKpiBadgesComponent,
    MapSectorChipsComponent,
    BasemapToggleComponent,
    ZoomControlComponent,
  ],
  templateUrl: './trade-map.component.html',
  host: {
    style: 'display:block;position:relative;width:100%;height:100%;min-height:420px;',
    'data-og7': 'trade-map',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/map » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Trade Map ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns TradeMapComponent gérée par le framework.
 */
export class TradeMapComponent {
  private readonly store = inject(Store<AppState>);
  private readonly filters = inject(FiltersService);
  private readonly featureFlags = inject(FEATURE_FLAGS, { optional: true });

  private readonly geojson = inject(MapGeojsonService);
  private readonly tariffQuery = inject(TariffQueryService);

  protected readonly ready = this.store.selectSignal(selectMapReady);
  private readonly flows = this.store.selectSignal(selectFilteredFlows);
  private readonly kpis = this.store.selectSignal(selectMapKpis);

  protected readonly mapStyle = MAP_STYLE_URL;
  protected readonly mapCenter = MAP_CENTER;
  protected readonly mapZoom = MAP_ZOOM;
  readonly globeEnabled = this.featureFlags?.['mapGlobe'] ?? false;

  protected readonly provinceSource = this.geojson.provinceCollection;
  protected readonly provinceLayerPaint = {
    'fill-color': '#dbeafe',
    'fill-opacity': 0.45,
    'fill-outline-color': '#1d4ed8',
  } as const;

  protected readonly flowLayerLayout = {
    'line-cap': 'round',
    'line-join': 'round',
  } as const;
  protected readonly highlightLayerLayout = this.flowLayerLayout;
  protected readonly highlightLayerPaint = {
    'line-color': '#f59e0b',
    'line-width': 5.5,
    'line-opacity': 0.95,
    'line-blur': 0.6,
  } as const;
  protected readonly markerLayerPaint = {
    'circle-radius': 6,
    'circle-color': '#0f172a',
    'circle-opacity': 0.95,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#e2e8f0',
  } as const;

  private readonly flowGeometryById = computed(() =>
    this.indexFlowFeatures(this.geojson.flowCollection())
  );
  private readonly hubGeometryById = computed(() =>
    this.indexHubFeatures(this.geojson.hubCollection())
  );

  private readonly filteredFlows = computed(() => {
    const flows = this.flows();
    const partner = this.filters.tradePartner();
    const { mode } = this.filters.tradeFilters();
    const byPartner = this.filterFlowsByPartner(flows, partner);
    return this.filterFlowsByTradeMode(byPartner, mode);
  });

  private readonly tariffedSectors = computed(() => {
    const tariffs = this.tariffQuery.filteredTariffs();
    if (!tariffs.length) {
      return new Set<string>();
    }
    const sectors = new Set<string>();
    for (const tariff of tariffs) {
      for (const sector of tariff.sectors) {
        if (typeof sector === 'string' && sector.trim().length > 0) {
          sectors.add(sector);
        }
      }
    }
    return sectors;
  });

  private readonly flowCollectionState = computed(() =>
    this.createFlowCollection(this.filteredFlows(), this.tariffedSectors())
  );

  protected readonly flowSource = computed<MapFlowFeatureCollection>(
    () => this.flowCollectionState().collection
  );

  protected readonly highlightSource = computed<MapFlowFeatureCollection>(() => {
    const { sector } = this.filters.tradeFilters();
    if (!sector) {
      return EMPTY_FLOW_COLLECTION;
    }
    const flows = this.filteredFlows().filter((flow) => this.matchesSector(flow, sector));
    if (!flows.length) {
      return EMPTY_FLOW_COLLECTION;
    }
    return this.createFlowCollection(flows, this.tariffedSectors()).collection;
  });

  protected readonly hasHighlight = computed(() => this.highlightSource().features.length > 0);

  private readonly hasTariffImpact = computed(() => this.flowCollectionState().hasTariffImpact);

  private readonly tariffImpactExpression = computed<Expression>(() => [
    'boolean',
    ['get', 'tariffImpacted'],
    false,
  ]);

  protected readonly flowLayerPaint = computed<LinePaint>(() => {
    if (!this.hasTariffImpact()) {
      return DEFAULT_FLOW_LAYER_PAINT;
    }
    const impact = this.tariffImpactExpression();
    return {
      'line-color': ['case', impact, '#dc2626', '#94a3b8'],
      'line-width': ['case', impact, 3.2, 2.2],
      'line-opacity': ['case', impact, 0.95, 0.25],
      'line-blur': ['case', impact, 0.5, 0.15],
    } as LinePaint;
  });

  protected readonly flowGlowPaint = computed<LinePaint>(() => {
    if (!this.hasTariffImpact()) {
      return DEFAULT_FLOW_GLOW_PAINT;
    }
    const impact = this.tariffImpactExpression();
    return {
      'line-color': ['case', impact, '#fecaca', '#e2e8f0'],
      'line-width': ['case', impact, 5.2, 3.6],
      'line-opacity': ['case', impact, 0.7, 0.15],
      'line-blur': ['case', impact, 1.4, 0.7],
    } as LinePaint;
  });

  protected readonly markerSource = computed<MapHubFeatureCollection>(() => {
    const flows = this.filteredFlows();
    if (!flows.length) {
      return EMPTY_MARKER_COLLECTION;
    }

    const geometry = this.hubGeometryById();
    if (geometry.size === 0) {
      return EMPTY_MARKER_COLLECTION;
    }

    const dictionary = this.kpis();
    const features: MapHubFeature[] = [];

    const origin = geometry.get('origin');
    if (origin) {
      const overallSnapshot = computeMapKpiSnapshot(flows, dictionary.default);
      features.push(this.decorateHubFeature(origin, overallSnapshot));
    }

    const groups = this.groupFlowsByPartner(flows);
    for (const [partner, partnerFlows] of groups.entries()) {
      if (partner === 'canada') {
        continue;
      }
      const baseFeature = geometry.get(partner);
      if (!baseFeature) {
        continue;
      }
      const snapshot = computeMapKpiSnapshot(
        partnerFlows,
        this.resolveFallbackSnapshot(partner, dictionary)
      );
      features.push(this.decorateHubFeature(baseFeature, snapshot));
    }

    return features.length
      ? { type: 'FeatureCollection', features }
      : EMPTY_MARKER_COLLECTION;
  });

  /**
   * Handles the MapLibre load event by marking the map as ready in the store.
   * The readiness flag is only emitted once to avoid redundant state updates
   * when the component receives additional load events from MapLibre.
   */
  onMapLoad(): void {
    if (!this.ready()) {
    this.store.dispatch(MapActions.mapLoaded());
    }
  }

  /**
   * Assemble a GeoJSON feature collection representing the provided trade flows.
   * Geometry comes from the dedicated GeoJSON dataset while trade metadata is
   * merged from the NgRx store.
   *
   * @param flows Trade flows filtered by the current UI state.
   * @param impactedSectors Set of sector identifiers currently covered by tariffs.
   * @returns A FeatureCollection along with a flag indicating whether at least one flow is tariffed.
   */
  private createFlowCollection(
    flows: Flow[],
    impactedSectors: ReadonlySet<string>
  ): FlowCollectionState {
    if (!flows.length) {
      return { collection: EMPTY_FLOW_COLLECTION, hasTariffImpact: false };
    }

    const geometry = this.flowGeometryById();
    if (geometry.size === 0) {
      return { collection: EMPTY_FLOW_COLLECTION, hasTariffImpact: false };
    }

    const features = this.buildFlowFeatures(flows, geometry, impactedSectors);
    if (!features.length) {
      return { collection: EMPTY_FLOW_COLLECTION, hasTariffImpact: false };
    }

    const hasTariffImpact = features.some(
      (feature) => feature.properties?.tariffImpacted === true
    );

    return {
      collection: { type: 'FeatureCollection', features },
      hasTariffImpact,
    };
  }

  private buildFlowFeatures(
    flows: Flow[],
    geometry: Map<string, MapFlowFeature>,
    impactedSectors: ReadonlySet<string>
  ): MapFlowFeature[] {
    const features: MapFlowFeature[] = [];
    for (const flow of flows) {
      const base = geometry.get(flow.id);
      if (!base) {
        continue;
      }
      features.push(this.decorateFlowFeature(base, flow, impactedSectors));
    }
    return features;
  }

  private decorateFlowFeature(
    base: MapFlowFeature,
    flow: Flow,
    impactedSectors: ReadonlySet<string>
  ): MapFlowFeature {
    const id =
      typeof base.id === 'string' && base.id.trim().length > 0 ? base.id : flow.id;
    const sectorIds = this.resolveSectorIds(flow);
    return {
      type: 'Feature',
      id,
      geometry: base.geometry,
      properties: {
        ...base.properties,
        id: flow.id,
        partner: flow.partner,
        tradeMode: this.resolveTradeMode(flow),
        value: flow.value,
        sectorId: flow.sectorId,
        sectorIds,
        tariffImpacted: this.isFlowTariffImpacted(flow, impactedSectors, sectorIds),
      },
    };
  }

  private indexFlowFeatures(collection: MapFlowFeatureCollection): Map<string, MapFlowFeature> {
    const dictionary = new Map<string, MapFlowFeature>();
    for (const feature of collection.features) {
      const identifier = this.extractFeatureIdentifier(feature.properties?.id, feature.id);
      if (identifier) {
        dictionary.set(identifier, feature);
      }
    }
    return dictionary;
  }

  private indexHubFeatures(collection: MapHubFeatureCollection): Map<string, MapHubFeature> {
    const dictionary = new Map<string, MapHubFeature>();
    for (const feature of collection.features) {
      const identifier = this.extractFeatureIdentifier(feature.properties?.id, feature.id);
      if (identifier) {
        dictionary.set(identifier, feature);
      }
    }
    return dictionary;
  }

  private extractFeatureIdentifier(
    propertiesId: unknown,
    featureId: MapFlowFeature['id'] | MapHubFeature['id']
  ): string | null {
    if (typeof propertiesId === 'string' && propertiesId.trim().length > 0) {
      return propertiesId;
    }
    if (typeof featureId === 'string' && featureId.trim().length > 0) {
      return featureId;
    }
    return null;
  }

  private decorateHubFeature(base: MapHubFeature, snapshot: MapKpiComputed): MapHubFeature {
    const fallbackName =
      typeof base.properties?.name === 'string' ? base.properties.name : undefined;
    const identifier =
      this.extractFeatureIdentifier(base.properties?.id, base.id) ?? fallbackName ?? 'hub';
    return {
      type: 'Feature',
      id: identifier,
      geometry: base.geometry,
      properties: {
        ...base.properties,
        partner:
          base.properties.partner ?? (base.properties.role === 'origin' ? 'canada' : undefined),
        tradeValue: snapshot.tradeValue,
        tradeValueCurrency: snapshot.tradeValueCurrency,
        tradeVolume: snapshot.tradeVolume,
        tradeVolumeUnit: snapshot.tradeVolumeUnit,
        sectorCount: snapshot.sectorCount,
      },
    };
  }

  /**
   * Ensure every flow exposes a valid trade mode. Missing values are normalised
   * to the default `export` mode so that styling logic remains consistent when
   * the backend omits the field.
   *
   * @param flow Flow currently being transformed into a map feature.
   * @returns The trade mode reported by the flow or the default fallback.
   */
  private resolveTradeMode(flow: Flow): Flow['tradeMode'] {
    return flow.tradeMode ?? 'export';
  }

  /**
   * Collect the list of sectors attached to a flow, if any. The map can then
   * highlight matching flows when a sector filter is active.
   *
   * @param flow Flow currently being transformed into a map feature.
   * @returns Array of sector identifiers or `undefined` when no extra sectors are provided.
   */
  private resolveSectorIds(flow: Flow): string[] | undefined {
    return flow.sectorIds;
  }

  private isFlowTariffImpacted(
    flow: Flow,
    impactedSectors: ReadonlySet<string>,
    resolvedSectorIds?: readonly string[] | undefined
  ): boolean {
    if (impactedSectors.size === 0) {
      return false;
    }

    if (typeof flow.sectorId === 'string' && impactedSectors.has(flow.sectorId)) {
      return true;
    }

    const extraSectors = resolvedSectorIds ?? flow.sectorIds;
    if (!extraSectors) {
      return false;
    }

    for (const sector of extraSectors) {
      if (typeof sector === 'string' && impactedSectors.has(sector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Regroups a list of flows by partner to ease subsequent aggregations.
   * When the partner is missing, flows are associated with the Canadian hub
   * so domestic exchanges stay clustered together.
   *
   * @param flows Collection of flows produced by the selectors and filters.
   * @returns A map keyed by partner identifier whose values are the matching flows.
   */
  private groupFlowsByPartner(flows: Flow[]): Map<string, Flow[]> {
    const groups = new Map<string, Flow[]>();
    for (const flow of flows) {
      const key = flow.partner ?? 'canada';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(flow);
    }
    return groups;
  }

  /**
   * Filters flows according to the selected trade partner.
   * Absence of a partner selection keeps domestic and international flows,
   * while setting a partner restricts the result to matching exchanges.
   *
   * @param flows Base collection to filter.
   * @param partner Optional partner identifier coming from the filter service.
   * @returns Flows matching the requested partner, or all flows when no partner is selected.
   */
  private filterFlowsByPartner(flows: Flow[], partner: string | null | undefined): Flow[] {
    if (!partner) {
      return flows;
    }
    return flows.filter((flow) => !flow.partner || flow.partner === partner);
  }

  /**
   * Narrows a flow collection to those matching the active trade mode filter.
   * Selecting "all" leaves the list untouched to represent both imports and exports.
   *
   * @param flows Base collection to filter.
   * @param tradeMode Trade mode chosen in the filters (all, import or export).
   * @returns Flows matching the trade mode criteria.
   */
  private filterFlowsByTradeMode(flows: Flow[], tradeMode: TradeModeFilter): Flow[] {
    if (tradeMode === 'all') {
      return flows;
    }
    return flows.filter((flow) => flow.tradeMode === tradeMode);
  }

  /**
   * Checks whether the provided flow belongs to the sector highlighted on the map.
   * The comparison covers both the primary sector and the optional sector list
   * so secondary associations still trigger a highlight.
   *
   * @param flow Flow currently being evaluated.
   * @param sectorId Sector identifier requested by the active filter.
   * @returns True when the flow matches the sector, false otherwise.
   */
  private matchesSector(flow: Flow, sectorId: string): boolean {
    if (flow.sectorId === sectorId) {
      return true;
    }
    return Array.isArray(flow.sectorIds) && flow.sectorIds.includes(sectorId);
  }

  /**
   * Chooses the KPI snapshot to use for a partner marker when aggregating KPIs.
   * It first looks up a partner-specific entry, then falls back to the global
   * default snapshot so markers always display meaningful values.
   *
   * @param partner Partner identifier associated with the marker.
   * @param dictionary Map of KPI snapshots keyed by partner plus a default entry.
   * @returns The most appropriate snapshot for the marker or undefined when none exists.
   */
  private resolveFallbackSnapshot(
    partner: string | null | undefined,
    dictionary: MapKpis
  ): MapKpiSnapshot | undefined {
    if (partner && dictionary[partner]) {
      return dictionary[partner];
    }
    return dictionary.default;
  }
}
