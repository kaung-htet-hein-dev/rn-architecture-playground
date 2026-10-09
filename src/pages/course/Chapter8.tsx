import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection } from "../../components/Chapter";
import { ChapterCheck } from "../../components/Quiz";
import { MigrationWrap } from "../../components/WrapUp";

export function Chapter8() {
  return (
    <ChapterSection
      id={chapterId(7)}
      label={`08 ${CHAPTER_TITLES[7]}`}
      gap={64}
    >
      <ChapterHead n={8} title={CHAPTER_TITLES[7]}>
        <p className="prose-atb">
          Let’s put the pieces back together: the new map, how we got here,
          and what changes in your app when you migrate.
        </p>
      </ChapterHead>
      <MigrationWrap />
      <ChapterCheck ch={7} />
    </ChapterSection>
  );
}
