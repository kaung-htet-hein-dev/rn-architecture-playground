import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { ChapterCheck } from "../../components/Quiz";
import { ModeSwap } from "../../components/course/ModeSwap";
import { SimPanel } from "../../components/SimPanel";

export function Chapter6() {
  return (
    <ChapterSection id={chapterId(5)} label={`06 ${CHAPTER_TITLES[5]}`}>
      <ChapterHead n={6} title={CHAPTER_TITLES[5]} />
      <WhyWhatHow
        why={
          <P>
            Every setState you call ends up as real views on screen. The
            part that turns React’s output into those views is the{" "}
            <B>renderer</B>. <T c="new">Fabric</T> is the New Architecture’s
            renderer.
          </P>
        }
        what={
          <P>
            It works in three phases. <B>Render</B>: React runs your
            components and Fabric builds a <B>shadow tree</B>, a C++ copy of
            your UI. <B>Commit</B>: layout is calculated and the tree is
            sealed. <B>Mount</B>: the changes are applied to{" "}
            <B>host views</B>, the real platform views.
          </P>
        }
        how={
          <ModeSwap
            next={
              <P>
                Because the shadow tree lives in C++ and can’t change once
                it’s committed, any thread can read it safely. So you can measure layout right
                away, and React can draw urgent updates first. Step through
                the three phases and watch the three trees fill in.
              </P>
            }
            old={
              <P>
                You’re seeing the old renderer first, so you have something
                to compare against. The same three phases happened, but
                spread over three threads and stitched together with JSON.
                Step through it, then flip to New to watch Fabric do the
                same work.
              </P>
            }
          />
        }
      />
      <Reveal>
        <SimPanel scenario="fabric" />
      </Reveal>
      <ChapterCheck ch={5} />
    </ChapterSection>
  );
}
