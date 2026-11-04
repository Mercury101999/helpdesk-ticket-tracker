import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Returns `server` during static/server rendering and `client` once running in the browser.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore<S | C>(subscribe, () => client, () => server);
}
