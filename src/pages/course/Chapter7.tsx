import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { ConcurrentSim } from "../../components/ConcurrentSim";
import { PriorityDiagram } from "../../components/PriorityDiagram";
import { B, P } from "../../components/Prose";
import { ChapterCheck } from "../../components/Quiz";
import { ModeSwap } from "../../components/course/ModeSwap";

export function Chapter7() {
  return (
    <ChapterSection id={chapterId(6)} label={`07 ${CHAPTER_TITLES[6]}`}>
      <ChapterHead n={7} title={CHAPTER_TITLES[6]} />
      <WhyWhatHow
        why={
          <P>
            Some updates can’t wait. When you tap a tab, it should light up
            right away. The screen behind it can arrive 200 ms later and
            nobody minds. But React used to treat every update the same:
            once a render started, it ran to the end. On the{" "}
            <T c="js">JS thread</T>, which does one thing at a time, a slow
            render blocks every tap that comes in while it runs.
          </P>
        }
        what={
          <P>
            <B>Concurrent rendering</B> lets React build a new tree without
            showing it, pause halfway, and throw it away. You mark updates
            that can wait with <B>startTransition</B>. React renders those
            in slices of about 5 ms and checks for new input between
            slices, so <B>urgent updates</B> go first. Only rendering is
            split up: the commit still happens in one piece, so you never
            see half a screen. And it’s still one thread. Concurrent means
            interruptible, not parallel.
          </P>
        }
        how={
          <ModeSwap
            next={
              <P>
                <T c="new">Fabric</T> is what makes this work on React
                Native. A committed shadow tree never changes, so React can
                build the next one on the side and drop it if a tap comes
                in. The first diagram shows how React orders the work when
                you tap Photos, then Map. The two phones after it get those
                same taps with one line of code different.
              </P>
            }
            old={
              <P>
                The <T c="old">old architecture</T> runs React in legacy
                mode, where every update renders synchronously.
                startTransition is there, but it does nothing. The diagram
                shows the Map tap waiting for the whole Photos render, and
                the phones after it both wait the same time. Then flip to
                New and play them again.
              </P>
            }
          />
        }
      />
      <Reveal>
        <PriorityDiagram />
      </Reveal>
      <Reveal>
        <ConcurrentSim />
      </Reveal>
      <ChapterCheck ch={6} />
    </ChapterSection>
  );
}
