import { useActiveChapter } from "../../hooks/useActiveChapter";
import { useChapterUrlSync } from "../../hooks/useChapterNav";
import { ChapterProgress } from "../ChapterProgress";

/** Owns the active-chapter state so scrolling re-renders only the nav, not the course. */
export function ChapterNav({ onGo }: { onGo: (i: number) => void }) {
  const active = useActiveChapter();
  useChapterUrlSync(active);
  return <ChapterProgress active={active} onGo={onGo} />;
}
