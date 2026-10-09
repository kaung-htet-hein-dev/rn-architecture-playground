import { useEffect, useState } from "react";
import { CHAPTER_COUNT, INTRO, sectionId } from "../app/chapters";

/** A chapter is active once its top edge passes this line below the viewport top. */
const ACTIVE_LINE_PX = 180;
/** Re-measure after window resizes settle. */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Index of the chapter crossing the active line (INTRO for the hero). Uses an IntersectionObserver
 * on a 1px band, so scrolling never forces layout reads on the main thread.
 */
export function useActiveChapter(): number {
  const [active, setActive] = useState(INTRO);

  useEffect(() => {
    const ids = Array.from({ length: CHAPTER_COUNT + 1 }, (_, i) => sectionId(i - 1));
    const crossing = new Set<number>();
    let io: IntersectionObserver | null = null;

    const observe = () => {
      io?.disconnect();
      crossing.clear();
      const bottom = Math.max(0, window.innerHeight - ACTIVE_LINE_PX - 1);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const i = ids.indexOf(e.target.id);
            if (e.isIntersecting) crossing.add(i);
            else crossing.delete(i);
          }
          if (crossing.size) setActive(Math.max(...crossing) - 1);
        },
        { rootMargin: `-${ACTIVE_LINE_PX}px 0px -${bottom}px 0px` }
      );
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(observe, RESIZE_DEBOUNCE_MS);
    };

    observe();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, []);

  return active;
}
