import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "../app/SettingsProvider";
import {
  ChapterHead,
  ChapterSection,
  Reveal,
  T,
  WhyWhatHow
} from "../components/Chapter";
import { CHAPTER_TITLES } from "../app/chapters";
import { ChapterProgress } from "../components/ChapterProgress";
import { ScrollRace } from "../components/ScrollRace";
import { SimPanel } from "../components/SimPanel";
import { StartupBars } from "../components/StartupBars";
import { TopBar } from "../components/TopBar";
import { WrapUp } from "../components/WrapUp";

const P = ({ children }: { children: ReactNode }) => (
  <p className="prose-atb">{children}</p>
);
const B = ({ children }: { children: ReactNode }) => (
  <strong>{children}</strong>
);

/** Paragraph that switches in place with the Old/New toggle. */
function ModeSwap({ old, next }: { old: ReactNode; next: ReactNode }) {
  const { mode } = useSettings();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {mode === "new" ? next : old}
      </motion.div>
    </AnimatePresence>
  );
}

const LEGEND: [string, string][] = [
  ["#f2b35b", "Old architecture"],
  ["#5fd3e6", "New Architecture"],
  ["#b39dff", "JS thread"],
  ["#79d49c", "Shadow thread"],
  ["#f291c4", "UI thread"]
];

function parseCh(): number {
  try {
    const raw = new URLSearchParams(window.location.search).get("ch");
    if (!raw || !/^[1-7]$/.test(raw)) return 0;
    return Number(raw) - 1;
  } catch {
    return 0;
  }
}

export default function Course() {
  const { reduced } = useSettings();
  const [active, setActive] = useState(0);

  const go = useCallback(
    (i: number, instant?: boolean) => {
      const el = document.getElementById("ch" + (i + 1));
      if (!el) return;
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 58;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: instant || reduced ? "auto" : "smooth"
      });
    },
    [reduced]
  );

  useEffect(() => {
    const onScroll = () => {
      let a = 0;
      for (let i = 0; i < 7; i++) {
        const el = document.getElementById("ch" + (i + 1));
        if (el && el.getBoundingClientRect().top < 180) a = i;
      }
      setActive(a);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ?ch= deep link on load
  useEffect(() => {
    const ch = parseCh();
    if (ch > 0) {
      const t = setTimeout(() => go(ch, true), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep ?ch= in sync with the active chapter
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (active === 0) url.searchParams.delete("ch");
      else url.searchParams.set("ch", String(active + 1));
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* ignore */
    }
  }, [active]);

  useEffect(() => {
    document.title = "React Native Internal";
  }, []);

  return (
    <div className="min-h-screen bg-bg font-sans text-text">
      <a
        href="#ch1"
        className="sr-only z-50 rounded bg-text px-3 py-2 text-bg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar onGo={go} />
      <ChapterProgress active={active} onGo={go} />
      <main className="min-[1200px]:pl-56">
        {/* ── Chapter 1 ─────────────────────────────────────────── */}
        <ChapterSection id="ch1" label={`01 ${CHAPTER_TITLES[0]}`} first>
          <div className="mb-8 flex max-w-[860px] flex-col gap-5">
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              A course for React Native developers
            </motion.span>
            <h1 className="m-0 text-[clamp(44px,7.4vw,88px)] leading-[0.98] font-semibold tracking-[-.035em] text-text-bright">
              <HeroTitle />
            </h1>
            <motion.p
              className="m-0 max-w-[680px] text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-text-muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              You write React Native every day. Let’s slow it down and look at
              what happens underneath: first in the old architecture, then in
              the New Architecture that replaced it. Seven short chapters, then
              a playground where you can poke at everything.
            </motion.p>
            <motion.ul
              aria-label="Color legend"
              className="m-0 flex list-none flex-wrap gap-[18px] p-0 font-mono text-[13px] leading-[1.4] text-text-dim"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.5 }
                }
              }}
            >
              {LEGEND.map(([c, t]) => (
                <motion.li
                  key={t}
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <span
                    className="size-2.5 rounded-[2px]"
                    style={{ background: c }}
                  />
                  {t}
                </motion.li>
              ))}
            </motion.ul>
          </div>
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

        {/* ── Chapter 2 ─────────────────────────────────────────── */}
        <ChapterSection id="ch2" label={`02 ${CHAPTER_TITLES[1]}`}>
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

        {/* ── Chapter 3 ─────────────────────────────────────────── */}
        <ChapterSection id="ch3" label={`03 ${CHAPTER_TITLES[2]}`}>
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
        </ChapterSection>

        {/* ── Chapter 4 ─────────────────────────────────────────── */}
        <ChapterSection id="ch4" label={`04 ${CHAPTER_TITLES[3]}`}>
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
        </ChapterSection>

        {/* ── Chapter 5 ─────────────────────────────────────────── */}
        <ChapterSection id="ch5" label={`05 ${CHAPTER_TITLES[4]}`}>
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

        {/* ── Chapter 6 ─────────────────────────────────────────── */}
        <ChapterSection id="ch6" label={`06 ${CHAPTER_TITLES[5]}`}>
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
                    Because the shadow tree lives in C++ and is shared through
                    JSI, any thread can read it. So you can measure layout right
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
        </ChapterSection>

        {/* ── Chapter 7 ─────────────────────────────────────────── */}
        <ChapterSection
          id="ch7"
          label={`07 ${CHAPTER_TITLES[6]}`}
          last
          gap={72}
        >
          <ChapterHead n={7} title={CHAPTER_TITLES[6]}>
            <p className="prose-atb max-w-[680px]">
              Let’s put the pieces back together: the new map, how we got here,
              what changes in your app when you migrate, and a quick check that
              it all stuck.
            </p>
          </ChapterHead>
          <WrapUp />
        </ChapterSection>
      </main>
    </div>
  );
}

/** Hero title: two words slide in, then a bridge underline draws amber → cyan. */
function HeroTitle() {
  const words = ["React", "Native", "Internal"];
  return (
    <span className="relative inline-block">
      {words.map((w, i) => (
        <motion.span
          key={w}
          className="inline-block"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.6,
            delay: 0.08 * i,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
      <motion.span
        aria-hidden="true"
        className="absolute -bottom-2 left-0 h-[3px] w-full origin-left rounded-full"
        style={{ background: "linear-gradient(90deg,#f2b35b,#5fd3e6)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.65, 0, 0.35, 1] }}
      />
    </span>
  );
}
