import { chapterId } from "../app/chapters";
import { ChapterNav } from "../components/course/ChapterNav";
import { CourseHero } from "../components/course/CourseHero";
import { TopBar } from "../components/TopBar";
import { useChapterDeepLink, useChapterScroll } from "../hooks/useChapterNav";
import { usePageMeta } from "../hooks/usePageMeta";
import { Chapter1 } from "./course/Chapter1";
import { Chapter2 } from "./course/Chapter2";
import { Chapter3 } from "./course/Chapter3";
import { Chapter4 } from "./course/Chapter4";
import { Chapter5 } from "./course/Chapter5";
import { Chapter6 } from "./course/Chapter6";
import { Chapter7 } from "./course/Chapter7";
import { Chapter8 } from "./course/Chapter8";
import { Review } from "./course/Review";

const COURSE_META = {
  title: "React Native Internal: bridge, JSI, Fabric and Turbo Modules",
  description:
    "An interactive course on React Native's old architecture and the New Architecture: JSI, Turbo Modules, Codegen and Fabric. Step through simulations of threads, bridge traffic and rendering.",
};

export default function Course({ notFound = false }: { notFound?: boolean }) {
  const go = useChapterScroll();
  useChapterDeepLink(go);
  usePageMeta({ ...COURSE_META, path: "/", noindex: notFound });

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
      <main className="pl-56">
        <CourseHero onGo={go} />
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Chapter6 />
        <Chapter7 />
        <Chapter8 />
        <Review />
      </main>
    </div>
  );
}
