import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '../app.state';
import { selectIsAuthenticated, selectUser } from '../index';

import { searchRequested } from './header.actions';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injectée côté présentation pour exposer le store ou les services de « state/header ».
 * Raison d’être : Fournit une API simplifiée pour piloter « Header » sans révéler les détails internes.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns HeaderFacade gérée par le framework.
 */
export class HeaderFacade {
  private readonly store = inject(Store<AppState>);

  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly user = this.store.selectSignal(selectUser);

  searchRequested(q: string) {
    this.store.dispatch(searchRequested({ q }));
  }
}
