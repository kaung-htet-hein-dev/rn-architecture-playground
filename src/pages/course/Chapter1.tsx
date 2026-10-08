import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { ModeSwap } from "../../components/course/ModeSwap";
import { CourseHero } from "../../components/course/CourseHero";
import { SimPanel } from "../../components/SimPanel";

export function Chapter1() {
  return (
    <ChapterSection id={chapterId(0)} label={`01 ${CHAPTER_TITLES[0]}`} first>
      <CourseHero />
      <ChapterHead n={1} title={CHAPTER_TITLES[0]} />
      <WhyWhatHow
        why={
          <P>
            You press buttons all day. If we slow one press down, you’ll see
            every place where an app can lose time. That becomes our map for
            the rest of the course.
          </P>
        }
        what={
          <P>
            A tap starts on the native side, the iOS or Android code the
            phone runs for its own UI. It travels to your JavaScript, and
            your answer travels back. Each side works on its own{" "}
            <B>thread</B>: a single line of work that does one thing at a
            time, in order.
          </P>
        }
        how={
          <ModeSwap
            old={
              <P>
                The <T c="ui">UI thread</T> draws the screen and receives
                touches. The <T c="js">JS thread</T> runs your React code.
                In the old architecture they talk through the{" "}
                <T c="old">bridge</T>, which only carries text. So every
                message is <B>serialized</B>, turned into a JSON string, and
                parsed back on the other side.
              </P>
            }
            next={
              <P>
                The <T c="ui">UI thread</T> draws the screen and receives
                touches. The <T c="js">JS thread</T> runs your React code.
                In the New Architecture there is no bridge: JS and C++ call
                each other through <T c="new">JSI</T>, and data stays as
                real values, so nothing is turned into text. Work still
                waits its turn on the right thread.
              </P>
            }
          />
        }
      />
      <Reveal>
        <SimPanel scenario="tap" />
      </Reveal>
      <p className="m-0 -mt-6 text-sm leading-normal text-text-dim">
        Flip{" "}
        <strong className="font-semibold text-text-bright">
          Old / New
        </strong>{" "}
        in the top bar to replay this exact tap in the other architecture.
      </p>
    </ChapterSection>
  );
}
