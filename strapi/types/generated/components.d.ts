import type { Schema, Struct } from '@strapi/strapi';

export interface BrandingLogo extends Struct.ComponentSchema {
  collectionName: 'components_branding_logos';
  info: {
    displayName: 'Logo';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface CompanyTrustRecord extends Struct.ComponentSchema {
  collectionName: 'components_company_trust_records';
  info: {
    description: 'Transaction or evaluation used to compute reliability';
    displayName: 'Trust record';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    direction: Schema.Attribute.Enumeration<['inbound', 'outbound']> &
      Schema.Attribute.DefaultTo<'inbound'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    occurredAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    score: Schema.Attribute.Decimal;
    type: Schema.Attribute.Enumeration<['transaction', 'evaluation']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'transaction'>;
  };
}

export interface CompanyVerificationSource extends Struct.ComponentSchema {
  collectionName: 'components_company_verification_sources';
  info: {
    description: 'Registry, audit or chamber of commerce attestation';
    displayName: 'Verification source';
  };
  attributes: {
    evidenceUrl: Schema.Attribute.String;
    issuedAt: Schema.Attribute.DateTime;
    lastCheckedAt: Schema.Attribute.DateTime;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    referenceId: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<['pending', 'validated', 'revoked']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    type: Schema.Attribute.Enumeration<['registry', 'chamber', 'audit', 'other']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'registry'>;
    url: Schema.Attribute.String;
  };
}

export interface DirectoryDrawerConfig extends Struct.ComponentSchema {
  collectionName: 'components_directory_drawer_configs';
  info: {
    displayName: 'Drawer config';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    fields: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface DirectoryTableConfig extends Struct.ComponentSchema {
  collectionName: 'components_directory_table_configs';
  info: {
    displayName: 'Table config';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    columns: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface I18NLanguage extends Struct.ComponentSchema {
  collectionName: 'components_i18n_languages';
  info: {
    displayName: 'Language';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    label: Schema.Attribute.String;
  };
}

export interface InsightsKpiConfig extends Struct.ComponentSchema {
  collectionName: 'components_insights_kpi_configs';
  info: {
    displayName: 'KPI config';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    label: Schema.Attribute.String;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.Decimal &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface MapLegendItem extends Struct.ComponentSchema {
  collectionName: 'components_map_legend_items';
  info: {
    displayName: 'Legend item';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    color: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    label: Schema.Attribute.String;
  };
}

export interface MapMapTheme extends Struct.ComponentSchema {
  collectionName: 'components_map_map_themes';
  info: {
    displayName: 'Map theme';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Schema.Attribute.String;
    primaryColor: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface NavigationAnnouncementBar extends Struct.ComponentSchema {
  collectionName: 'components_navigation_announcement_bars';
  info: {
    displayName: 'Announcement bar';
    icon: 'megaphone';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    linkLabel: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    message: Schema.Attribute.String;
  };
}

export interface NavigationCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_navigation_cta_buttons';
  info: {
    displayName: 'CTA button';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface NavigationHeader extends Struct.ComponentSchema {
  collectionName: 'components_navigation_headers';
  info: {
    displayName: 'Header';
    icon: 'bars';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    announcement: Schema.Attribute.Component<'navigation.announcement-bar', false>;
    cta: Schema.Attribute.Component<'navigation.cta-button', false>;
    links: Schema.Attribute.Component<'navigation.menu-link', true>;
    logo: Schema.Attribute.Component<'branding.logo', false>;
    search: Schema.Attribute.Component<'navigation.search-config', false>;
  };
}

export interface NavigationMenuLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_menu_links';
  info: {
    displayName: 'Menu link';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface NavigationSearchConfig extends Struct.ComponentSchema {
  collectionName: 'components_navigation_search_configs';
  info: {
    displayName: 'Search config';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    placeholder: Schema.Attribute.String;
    suggestions: Schema.Attribute.Component<'navigation.search-suggestion', true>;
  };
}

export interface NavigationSearchSuggestion extends Struct.ComponentSchema {
  collectionName: 'components_navigation_search_suggestions';
  info: {
    displayName: 'Search suggestion';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Schema.Attribute.String;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface SectionsDirectory extends Struct.ComponentSchema {
  collectionName: 'components_sections_directories';
  info: {
    displayName: 'Directory section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    drawer: Schema.Attribute.Component<'directory.drawer-config', false>;
    table: Schema.Attribute.Component<'directory.table-config', false>;
  };
}

export interface SectionsFilters extends Struct.ComponentSchema {
  collectionName: 'components_sections_filters';
  info: {
    displayName: 'Filters section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    cta: Schema.Attribute.Component<'navigation.cta-button', false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsInsights extends Struct.ComponentSchema {
  collectionName: 'components_sections_insights';
  info: {
    displayName: 'Insights section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    kpis: Schema.Attribute.Component<'insights.kpi-config', true>;
  };
}

export interface SectionsNews extends Struct.ComponentSchema {
  collectionName: 'components_sections_news';
  info: {
    displayName: 'News section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface SectionsOnboarding extends Struct.ComponentSchema {
  collectionName: 'components_sections_onboardings';
  info: {
    displayName: 'Onboarding section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    steps: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTrust extends Struct.ComponentSchema {
  collectionName: 'components_sections_trusts';
  info: {
    displayName: 'Trust section';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    logos: Schema.Attribute.Component<'branding.logo', true>;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'SEO';
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    shareImage: Schema.Attribute.Media &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'branding.logo': BrandingLogo;
      'company.trust-record': CompanyTrustRecord;
      'company.verification-source': CompanyVerificationSource;
      'directory.drawer-config': DirectoryDrawerConfig;
      'directory.table-config': DirectoryTableConfig;
      'i18n.language': I18NLanguage;
      'insights.kpi-config': InsightsKpiConfig;
      'map.legend-item': MapLegendItem;
      'map.map-theme': MapMapTheme;
      'navigation.announcement-bar': NavigationAnnouncementBar;
      'navigation.cta-button': NavigationCtaButton;
      'navigation.header': NavigationHeader;
      'navigation.menu-link': NavigationMenuLink;
      'navigation.search-config': NavigationSearchConfig;
      'navigation.search-suggestion': NavigationSearchSuggestion;
      'sections.directory': SectionsDirectory;
      'sections.filters': SectionsFilters;
      'sections.hero': SectionsHero;
      'sections.insights': SectionsInsights;
      'sections.news': SectionsNews;
      'sections.onboarding': SectionsOnboarding;
      'sections.trust': SectionsTrust;
      'seo.seo': SeoSeo;
    }
  }
}
