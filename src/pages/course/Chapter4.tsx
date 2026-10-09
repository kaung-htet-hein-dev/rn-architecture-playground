import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, T, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { ChapterCheck } from "../../components/Quiz";
import { SimPanel } from "../../components/SimPanel";

export function Chapter4() {
  return (
    <ChapterSection id={chapterId(3)} label={`04 ${CHAPTER_TITLES[3]}`}>
      <ChapterHead n={4} title={CHAPTER_TITLES[3]} />
      <WhyWhatHow
        why={
          <P>
            You call <B>native modules</B> all the time: code written in
            Swift, Kotlin or Java that JS can use, like reading the battery
            level. On the bridge, even a tiny question becomes a round trip
            of messages.
          </P>
        }
        what={
          <P>
            <T c="new">JSI</T>, the JavaScript Interface, lets JS hold a
            reference to an object that lives in <B>C++</B>, a fast,
            lower-level language that runs on both iOS and Android. That
            object is a <B>host object</B>: to JS it looks normal, but its
            methods are C++ functions.
          </P>
        }
        how={
          <P>
            Instead of writing a letter and waiting for a reply, JS calls
            the function directly. There is no JSON, queue or lookup table
            in between. If the method is synchronous, the value comes back
            on the same line. Toggle Old / New to compare the two trips.
          </P>
        }
      />
      <Reveal>
        <SimPanel scenario="jsi" />
      </Reveal>
      <ChapterCheck ch={3} />
    </ChapterSection>
  );
}
