import { Reveal } from "./Chapter";
import { Glossary } from "./Glossary";
import { Quiz } from "./Quiz";
import { Timeline } from "./Timeline";
import { ChapterSummary } from "./wrapup/ChapterSummary";
import { MapCards } from "./wrapup/MapCards";
import { MigrationNotes } from "./wrapup/MigrationNotes";
import { PlaygroundCta } from "./wrapup/PlaygroundCta";

/** Chapter 8 body: map, history, migration checklist. */
export function MigrationWrap() {
  return (
    <>
      <Reveal>
        <MapCards />
      </Reveal>
      <Reveal>
        <Timeline />
      </Reveal>
      <MigrationNotes />
    </>
  );
}

/** Review section body: recap, every question, glossary, playground link. */
export function ReviewWrap() {
  return (
    <>
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
