import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { StartupBars } from "../../components/StartupBars";
import { SimPanel } from "../../components/SimPanel";

export function Chapter5() {
  return (
    <ChapterSection id={chapterId(4)} label={`05 ${CHAPTER_TITLES[4]}`}>
      <ChapterHead n={5} title={CHAPTER_TITLES[4]} />
      <WhyWhatHow
        why={
          <P>
            Users judge your app in its first second. In the old
            architecture, most native modules in your app are created at
            launch by default, even the ones the first screen never touches.
          </P>
        }
        what={
          <P>
            A <T c="new">Turbo Module</T> is a native module built on JSI
            that loads <B>lazily</B>: the first time JS asks for it, not
            before. <T c="new">Codegen</T> is a build-time tool that reads a
            TypeScript description of the module and writes the matching
            native code.
          </P>
        }
        how={
          <P>
            First, play both startups and compare when the first screen
            becomes usable. Then step through Codegen turning a spec into a
            typed C++ interface, so a mismatch between JS and native fails
            the build instead of crashing on a user’s phone.
          </P>
        }
      />
      <Reveal>
        <StartupBars />
      </Reveal>
      <Reveal>
        <SimPanel scenario="codegen" />
      </Reveal>
    </ChapterSection>
  );
}
