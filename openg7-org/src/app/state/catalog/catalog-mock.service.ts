import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { FeedItem } from '@app/domains/feed/feature/models/feed.models';
import { CatalogActions } from './catalog.actions';
import { Company, Province, Sector } from './catalog.selectors';

interface CatalogMockPayload {
  sectors: Sector[];
  provinces: Province[];
  companies: Company[];
  feedItems: FeedItem[];
}

@Injectable({ providedIn: 'root' })
export class CatalogMockService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly platformId = inject(PLATFORM_ID);
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const payload = await firstValueFrom(
        this.http.get<CatalogMockPayload>('assets/mocks/catalog.mock.json')
      );
      this.store.dispatch(CatalogActions.catalogMockLoaded(payload));
    } catch (error) {
      console.warn('[catalog] Failed to load mock catalog data', error);
    }
  }
}
