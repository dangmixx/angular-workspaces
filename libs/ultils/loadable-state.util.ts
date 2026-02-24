import {
  catchError,
  defer,
  map,
  merge,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';

export interface PatchParameter {
  op: 'add' | 'remove' | 'replace' | 'copy' | 'move' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export function toPatchParameter(object: any) {
  const parameters: PatchParameter[] = [];

  const keys: string[] = Object.keys(object);
  for (const key of keys) {
    if (object[key] !== undefined) {
      parameters.push({
        op: 'replace',
        path: '/' + key,
        value: object[key],
      });
    }
  }

  return parameters;
}

export interface Loadable<T> {
  loading: boolean;
  data: T;
  error: any | null;
}

export type Event<T> =
  | { type: 'loading' }
  | { type: 'success'; data: T }
  | { type: 'error'; error: any | null };

/**
 * Wraps a data Observable into a simple Loadable<T> state stream.
 *
 * Behavior:
 * - Emits a loading state immediately upon subscription
 * - Emits success state when data is received
 * - Resets data to the provided initial value if an error occurs
 * - Does NOT preserve previous data across re-subscriptions
 *
 * Note:
 * This utility is intended for simple one-off requests.
 * For query-driven or paginated scenarios where previous data
 * should be preserved during refetching, use a reducer-based solution instead.
 *
 * @template T - Type of the response data
 *
 * @param source$ - The source Observable emitting response data
 * @param initial - Initial data used during loading and on error
 *
 * @returns Observable<Loadable<T>> - Stream containing loading, data, and error state
 */
export function withLoading<T>(source$: Observable<T>, initial: T): Observable<Loadable<T>> {
  return source$.pipe(
    map((data) => ({
      loading: false,
      data,
      error: null as string | null,
    })),
    startWith({
      loading: true,
      data: initial,
      error: null as string | null,
    }),
    catchError((err) =>
      of({
        loading: false,
        data: initial,
        error: err,
      }),
    ),
  );
}

/**
 * Creates a reactive Loadable<T> stream driven by a query source.
 *
 * Behavior:
 * - Emits loading state whenever the query stream emits
 * - Preserves previous data while fetching new data
 * - Updates data on successful response
 * - Preserves previous data if the request fails
 * - Cancels in-flight requests when a new query is emitted (via switchMap)
 *
 * @template Q - Type of the query input
 * @template T - Type of the response data
 *
 * @param query$ - Observable that triggers data fetching (e.g. filter, pagination, sorting)
 * @param fetcher - Function that maps a query value to an API Observable
 * @param initial - Initial data before the first successful fetch
 *
 * @returns Observable<Loadable<T>> - Stream containing loading, data, and error state
 */
export function createLoadableStateReactive<Q, T>(
  query$: Observable<Q>,
  fetcher: (query: Q) => Observable<T>,
  initial: T,
): Observable<Loadable<T>> {
  const loading$ = query$.pipe(map(() => ({ type: 'loading' as const })));

  const result$ = query$.pipe(
    switchMap((query) =>
      fetcher(query).pipe(
        map((data) => ({ type: 'success' as const, data })),
        catchError((error) => of({ type: 'error' as const, error })),
      ),
    ),
  );

  return merge(loading$, result$).pipe(
    scan<Event<T>, Loadable<T>>(
      (state, event) => {
        switch (event.type) {
          case 'loading':
            return {
              ...state,
              loading: true,
              error: null,
            };

          case 'success':
            return {
              loading: false,
              data: event.data,
              error: null,
            };

          case 'error':
            return {
              ...state,
              loading: false,
              error: event.error,
            };
        }
      },
      {
        loading: false,
        data: initial,
        error: null,
      },
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
