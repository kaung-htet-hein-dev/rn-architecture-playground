import { CHAPTER_TITLES, chapterId } from "../../app/chapters";
import { ChapterHead, ChapterSection, Reveal, WhyWhatHow } from "../../components/Chapter";
import { B, P } from "../../components/Prose";
import { ChapterCheck } from "../../components/Quiz";
import { ScrollRace } from "../../components/ScrollRace";

export function Chapter3() {
  return (
    <ChapterSection id={chapterId(2)} label={`03 ${CHAPTER_TITLES[2]}`}>
      <ChapterHead n={3} title={CHAPTER_TITLES[2]} />
      <WhyWhatHow
        why={
          <P>
            Smooth scrolling means a new picture every 16.6 ms, which is 60
            pictures per second. Each picture is a <B>frame</B>. When the
            app misses that window, the user sees a stutter: a{" "}
            <B>dropped frame</B>.
          </P>
        }
        what={
          <P>
            Both phones scroll the same list. The scrolling itself is
            native, but every scroll event asks JS to render more rows. When
            JS falls behind, you get blank rows. Drag the load slider to
            make each event’s JS work heavier.
          </P>
        }
        how={
          <P>
            Both phones merge scroll events that pile up while JS is busy.
            The difference is the cost: on the old phone every event pays
            for JSON twice, the scroll event coming in and the row updates
            going out. The further JS falls behind, the more rows it has to
            send, so each bridge batch gets bigger and slower. The new phone
            skips the JSON. But heavy JS work is still slow on both: push
            the slider to the end and see.
          </P>
        }
      />
      <Reveal>
        <ScrollRace />
      </Reveal>
      <ChapterCheck ch={2} />
    </ChapterSection>
  );
}
