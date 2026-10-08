import { chapterId } from "../app/chapters";
import { ChapterNav } from "../components/course/ChapterNav";
import { TopBar } from "../components/TopBar";
import { useChapterDeepLink, useChapterScroll } from "../hooks/useChapterNav";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Chapter1 } from "./course/Chapter1";
import { Chapter2 } from "./course/Chapter2";
import { Chapter3 } from "./course/Chapter3";
import { Chapter4 } from "./course/Chapter4";
import { Chapter5 } from "./course/Chapter5";
import { Chapter6 } from "./course/Chapter6";
import { Chapter7 } from "./course/Chapter7";

export default function Course() {
  const go = useChapterScroll();
  useChapterDeepLink(go);
  useDocumentTitle("React Native Internal");

  return (
    <div className="min-h-screen bg-bg font-sans text-text">
      <a
        href={`#${chapterId(0)}`}
        className="sr-only z-50 rounded bg-text px-3 py-2 text-bg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar onGo={go} />
      <ChapterNav onGo={go} />
      <main className="min-[1200px]:pl-56">
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Chapter6 />
        <Chapter7 />
      </main>
    </div>
  );
}
