import { Reveal } from "./Chapter";
import { Glossary } from "./Glossary";
import { Quiz } from "./Quiz";
import { Timeline } from "./Timeline";
import { ChapterSummary } from "./wrapup/ChapterSummary";
import { MapCards } from "./wrapup/MapCards";
import { MigrationNotes } from "./wrapup/MigrationNotes";
import { PlaygroundCta } from "./wrapup/PlaygroundCta";

/** Chapter 7 body: map, history, migration checklist, recap, quiz, glossary. */
export function WrapUp() {
  return (
    <>
      <Reveal>
        <MapCards />
      </Reveal>
      <Reveal>
        <Timeline />
      </Reveal>
      <MigrationNotes />
      <ChapterSummary />
      <Reveal>
        <Quiz />
      </Reveal>
      <Reveal>
        <Glossary />
      </Reveal>
      <Reveal>
        <PlaygroundCta />
      </Reveal>
    </>
  );
}
