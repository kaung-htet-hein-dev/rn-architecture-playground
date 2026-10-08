import { useState } from "react";
import { DEFAULT_DATES } from "../content/timeline";
import { readStore, removeStore, writeStore } from "../lib/storage";

const KEY = "atb-dates";
const MAX_LEN = 40;

function loadDates(): string[] {
  try {
    const d: unknown = JSON.parse(readStore(KEY) || "null");
    if (
      Array.isArray(d) &&
      d.length === DEFAULT_DATES.length &&
      d.every((x) => typeof x === "string" && x.length <= MAX_LEN)
    ) {
      return d;
    }
  } catch {
    /* malformed JSON: fall back to defaults */
  }
  return DEFAULT_DATES.slice();
}

/** Editable release dates, persisted in localStorage['atb-dates']. */
export function useReleaseDates() {
  const [dates, setDates] = useState(loadDates);

  const setDate = (i: number, v: string) => {
    const next = dates.slice();
    next[i] = v;
    setDates(next);
    writeStore(KEY, JSON.stringify(next));
  };
  const reset = () => {
    setDates(DEFAULT_DATES.slice());
    removeStore(KEY);
  };

  return { dates, setDate, reset, maxLength: MAX_LEN };
}
