import { useEffect } from "react";
import { replaceUrl } from "../../lib/url";
import { writePlaygroundSearch } from "../../sim/playground";

type UrlSyncState = Parameters<typeof writePlaygroundSearch>[1];

const DEBOUNCE_MS = 200;

/** Keep `?preset=&compare=&rate=&at=` in sync, debounced. */
export function usePlaygroundUrlSync(state: UrlSyncState) {
  const { preset, compare, rate, at } = state;
  useEffect(() => {
    const id = window.setTimeout(() => {
      replaceUrl((url) => {
        url.search = writePlaygroundSearch(url.search, {
          preset,
          compare,
          rate,
          at
        });
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [preset, compare, rate, at]);
}
