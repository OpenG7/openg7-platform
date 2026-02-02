import { TranslateModule } from '@ngx-translate/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { HomeInputsSectionComponent } from './home-inputs-section.component';

const meta: Meta<HomeInputsSectionComponent> = {
  title: 'Features/Home/InputsSection',
  component: HomeInputsSectionComponent,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot()],
    }),
  ],
};

export default meta;

export const Default: StoryObj<HomeInputsSectionComponent> = {
  render: () => ({ props: {} }),
};
