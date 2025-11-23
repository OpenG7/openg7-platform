import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { HomeMapSectionComponent } from './home-map-section.component';
import { FiltersService } from '@app/core/filters.service';
import { MapGeojsonService, MapFlowFeatureCollection, MapHubFeatureCollection, MapProvinceFeatureCollection } from '@app/core/services/map-geojson.service';
import { selectFilteredFlows, selectMapKpis, selectMapReady } from '@app/state';

class StoryMapGeojsonService {
  provinceCollection = signal<MapProvinceFeatureCollection>({ type: 'FeatureCollection', features: [] });
  flowCollection = signal<MapFlowFeatureCollection>({ type: 'FeatureCollection', features: [] });
  hubCollection = signal<MapHubFeatureCollection>({ type: 'FeatureCollection', features: [] });
}

const meta: Meta<HomeMapSectionComponent> = {
  title: 'Features/Home/MapSection',
  component: HomeMapSectionComponent,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot()],
      providers: [
        FiltersService,
        { provide: MapGeojsonService, useClass: StoryMapGeojsonService },
        provideMockStore({
          selectors: [
            { selector: selectMapReady, value: true },
            { selector: selectFilteredFlows, value: [] },
            { selector: selectMapKpis, value: { default: {} } },
          ],
        }),
      ],
    }),
  ],
};

export default meta;

export const Default: StoryObj<HomeMapSectionComponent> = {
  render: () => ({ props: {} }),
};
