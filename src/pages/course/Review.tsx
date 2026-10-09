import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection } from "../../components/Chapter";
import { ReviewWrap } from "../../components/WrapUp";

export function Review() {
  return (
    <ChapterSection id={chapterId(7)} label={CHAPTER_TITLES[7]} last gap={64}>
      <ChapterHead n={8} eyebrow="Review" title={CHAPTER_TITLES[7]}>
        <p className="prose-atb">
          Each chapter in one sentence, every question from the chapter
          checks, and the terms you met along the way.
        </p>
      </ChapterHead>
      <ReviewWrap />
    </ChapterSection>
  );
}
