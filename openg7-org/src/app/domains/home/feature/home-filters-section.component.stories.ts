import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { HomeFiltersSectionComponent } from './home-filters-section.component';
import { FiltersService } from '@app/core/filters.service';

const meta: Meta<HomeFiltersSectionComponent> = {
  title: 'Features/Home/FiltersSection',
  component: HomeFiltersSectionComponent,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot()],
      providers: [FiltersService],
    }),
  ],
};

export default meta;

export const Default: StoryObj<HomeFiltersSectionComponent> = {
  render: () => ({ props: {} }),
};
