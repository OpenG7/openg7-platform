import { StatMetric } from '@app/shared/components/hero/hero-stats.component';
import type { Meta, StoryObj } from '@storybook/angular';

import { HomeHeroSectionComponent } from './home-hero-section.component';

const stats: StatMetric[] = [
  {
    id: 'tradeValue',
    labelKey: 'metrics.tradeValue',
    value: 2100000,
    kind: 'money',
  },
  {
    id: 'exchangeQty',
    labelKey: 'metrics.exchangeQty',
    value: 60,
    kind: 'count',
    suffixKey: 'metrics.transactions',
  },
  {
    id: 'sectors',
    labelKey: 'metrics.sectors',
    value: 5,
    kind: 'count',
  },
];

const meta: Meta<HomeHeroSectionComponent> = {
  title: 'Features/Home/HeroSection',
  component: HomeHeroSectionComponent,
};

export default meta;

export const Default: StoryObj<HomeHeroSectionComponent> = {
  render: () => ({
    props: { stats },
  }),
};
