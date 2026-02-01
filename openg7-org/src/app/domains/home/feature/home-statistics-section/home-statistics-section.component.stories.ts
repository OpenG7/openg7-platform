import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { HomeStatisticsSectionComponent } from './home-statistics-section.component';
import { StatMetric } from '@app/shared/components/hero/hero-stats/hero-stats.component';

const stats: StatMetric[] = [
  {
    id: 'tradeValue',
    labelKey: 'metrics.tradeValue',
    value: 1440000,
    kind: 'money',
  },
  {
    id: 'exchangeQty',
    labelKey: 'metrics.exchangeQty',
    value: 30,
    kind: 'count',
    suffixKey: 'metrics.transactions',
  },
  {
    id: 'sectors',
    labelKey: 'metrics.sectors',
    value: 6,
    kind: 'count',
  },
];

const meta: Meta<HomeStatisticsSectionComponent> = {
  title: 'Features/Home/StatisticsSection',
  component: HomeStatisticsSectionComponent,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot()],
    }),
  ],
};

export default meta;

export const Default: StoryObj<HomeStatisticsSectionComponent> = {
  render: () => ({ props: { stats } }),
};

