import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection } from "../../components/Chapter";
import { WrapUp } from "../../components/WrapUp";

export function Chapter7() {
  return (
    <ChapterSection
      id={chapterId(6)}
      label={`07 ${CHAPTER_TITLES[6]}`}
      last
      gap={72}
    >
      <ChapterHead n={7} title={CHAPTER_TITLES[6]}>
        <p className="prose-atb max-w-[680px]">
          Let’s put the pieces back together: the new map, how we got here,
          what changes in your app when you migrate, and a quick check that
          it all stuck.
        </p>
      </ChapterHead>
      <WrapUp />
    </ChapterSection>
  );
}
