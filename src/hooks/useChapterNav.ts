import { useEffect, useState } from "react";
import { useSettings } from "../app/SettingsProvider";
import { CHAPTER_COUNT, chapterId } from "../app/chapters";
import { readParam, replaceUrl } from "../lib/url";

const DEFAULT_HEADER_PX = 58;
const DEEP_LINK_DELAY_MS = 300;

/** Scroll to a chapter, leaving room for the sticky header. */
export function useChapterScroll() {
  const { reduced } = useSettings();
  return (i: number, instant?: boolean) => {
    const el = document.getElementById(chapterId(i));
    if (!el) return;
    const header =
      document.querySelector("header")?.getBoundingClientRect().height ??
      DEFAULT_HEADER_PX;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - header,
      behavior: instant || reduced ? "auto" : "smooth"
    });
  };
}

/** 0-based chapter from `?ch=`, or 0 when absent or invalid. */
function chapterFromUrl(): number {
  const raw = readParam("ch");
  if (!raw || !/^[1-9]\d*$/.test(raw)) return 0;
  const n = Number(raw);
  return n <= CHAPTER_COUNT ? n - 1 : 0;
}

/**
 * Jump to the chapter named by `?ch=` once, on load. The param is read during
 * the first render, before ChapterNav's URL sync can clear it.
 */
export function useChapterDeepLink(go: (i: number, instant?: boolean) => void) {
  const [target] = useState(chapterFromUrl);
  useEffect(() => {
    if (target === 0) return;
    const t = setTimeout(() => go(target, true), DEEP_LINK_DELAY_MS);
    return () => clearTimeout(t);
  }, [target, go]);
}

/** Mirror the active chapter into `?ch=`. */
export function useChapterUrlSync(active: number) {
  useEffect(() => {
    replaceUrl((url) => {
      if (active === 0) url.searchParams.delete("ch");
      else url.searchParams.set("ch", String(active + 1));
    });
  }, [active]);
}
