import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { ModeSwap } from "../../components/course/ModeSwap";
import { SimPanel } from "../../components/SimPanel";

export function Chapter2() {
  return (
    <ChapterSection id={chapterId(1)} label={`02 ${CHAPTER_TITLES[1]}`}>
      <ChapterHead n={2} title={CHAPTER_TITLES[1]} />
      <WhyWhatHow
        why={
          <P>
            When something feels slow, the first question to ask is: which
            thread is busy? You can only answer that if you know which
            threads exist and what each one does.
          </P>
        }
        what={
          <P>
            Three threads. The <T c="js">JS thread</T> runs React. The{" "}
            <T c="shadow">Shadow thread</T> works out <B>layout</B>, meaning
            where each box goes and how big it is, using a library called
            Yoga. The <T c="ui">UI thread</T> creates the real views and
            handles touches.
          </P>
        }
        how={
          <ModeSwap
            old={
              <P>
                The bridge connects JS to the native threads, and everything
                on it is <B>asynchronous</B>: you send a message and carry
                on, and the answer arrives later. Messages are queued and
                sent in <B>batches</B>, groups sent together to save work.
                Neither side can reach over and read the other’s data.
              </P>
            }
            next={
              <P>
                You’re looking at the New Architecture version of the map.
                The same three threads exist. What changed is the
                connection: the bridge is replaced by JSI, and the shadow
                tree moves into C++ where every thread can read it. Switch
                back to Old to see the original.
              </P>
            }
          />
        }
      />
      <Reveal>
        <SimPanel scenario="map" />
      </Reveal>
    </ChapterSection>
  );
}
