import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection } from "../../components/Chapter";
import { ChapterCheck } from "../../components/Quiz";
import { MigrationWrap } from "../../components/WrapUp";

export function Chapter7() {
  return (
    <ChapterSection
      id={chapterId(6)}
      label={`07 ${CHAPTER_TITLES[6]}`}
      gap={64}
    >
      <ChapterHead n={7} title={CHAPTER_TITLES[6]}>
        <p className="prose-atb">
          Let’s put the pieces back together: the new map, how we got here,
          and what changes in your app when you migrate.
        </p>
      </ChapterHead>
      <MigrationWrap />
      <ChapterCheck ch={6} />
    </ChapterSection>
  );
}
