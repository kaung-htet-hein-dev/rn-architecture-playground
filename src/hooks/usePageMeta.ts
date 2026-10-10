import { useEffect } from "react";

export const SITE_URL = "https://kaung.reactnative.workers.dev";

interface PageMeta {
  title: string;
  description: string;
  /** Canonical path, e.g. "/playground". */
  path: string;
  noindex?: boolean;
}

function setMeta(selector: string, attr: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

/** Keeps head tags in step with the active route, since the HTML shell is shared. */
export function usePageMeta({ title, description, path, noindex }: PageMeta) {
  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta(
      'meta[name="robots"]',
      "content",
      noindex ? "noindex, follow" : "index, follow",
    );
  }, [title, description, path, noindex]);
}
