import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StatisticsActions } from './statistics.actions';
import { StatisticsService } from '@app/core/services/statistics.service';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { selectStatisticsFilters } from './statistics.selectors';

/**
 * Contexte : Enregistrée dans NgRx afin de réagir aux actions gérées au sein de « store/statistics ».
 * Raison d’être : Orchestre les flux asynchrones et la synchronisation du domaine « Statistics ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns StatisticsEffects gérée par le framework.
 */
export class StatisticsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly service = inject(StatisticsService);

  readonly initialize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatisticsActions.initialize),
      withLatestFrom(this.store.select(selectStatisticsFilters)),
      map(([, filters]) => StatisticsActions.loadStatistics({ filters }))
    )
  );

  readonly triggerLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        StatisticsActions.changeScope,
        StatisticsActions.changeIntrant,
        StatisticsActions.changePeriod,
        StatisticsActions.changeProvince,
        StatisticsActions.changeCountry
      ),
      withLatestFrom(this.store.select(selectStatisticsFilters)),
      map(([, filters]) => StatisticsActions.loadStatistics({ filters }))
    )
  );

  readonly loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatisticsActions.loadStatistics),
      switchMap(({ filters }) =>
        this.service.fetch(filters).pipe(
          map((payload) => StatisticsActions.loadStatisticsSuccess({ payload })),
          catchError((error: unknown) =>
            of(
              StatisticsActions.loadStatisticsFailure({
                error: error instanceof Error ? error.message : 'Unable to load statistics',
              })
            )
          )
        )
      )
    )
  );
}
