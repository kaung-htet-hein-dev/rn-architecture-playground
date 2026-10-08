export function readParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

/** Rewrite the current URL in place, without a navigation. */
export function replaceUrl(edit: (url: URL) => void): void {
  try {
    const url = new URL(window.location.href);
    edit(url);
    window.history.replaceState(window.history.state, "", url);
  } catch {
    /* replaceState can be blocked or rate-limited */
  }
}
