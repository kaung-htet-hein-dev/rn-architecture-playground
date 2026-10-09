import { Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useSettings } from "../../app/SettingsProvider";
import { INTRO_TITLE } from "../../app/chapters";
import { C } from "../../sim/colors";

const LEGEND: [string, string][] = [
  [C.old, "Old architecture"],
  [C.new, "New Architecture"],
  [C.js, "JS thread"],
  [C.shadow, "Shadow thread"],
  [C.ui, "UI thread"]
];

const TITLE_WORDS = ["React", "Native", "Internal"];

/** Hero title: words slide in, then a bridge underline draws amber → cyan. */
function HeroTitle() {
  return (
    <span className="relative inline-block">
      {TITLE_WORDS.map((w, i) => (
        <Fragment key={w}>
          {i > 0 && " "}
          <motion.span
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
          </motion.span>
        </Fragment>
      ))}
      <motion.span
        aria-hidden="true"
        className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full"
        style={{ background: `linear-gradient(90deg,${C.old},${C.new})` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.65, 0, 0.35, 1] }}
      />
    </span>
  );
}

function ColorLegend() {
  return (
    <motion.ul
      aria-label="Color legend"
      className="m-0 flex list-none flex-wrap gap-[18px] p-0 font-mono text-[13px] leading-[1.4] text-text-dim"
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } }
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
          <span className="size-2.5 rounded-[2px]" style={{ background: c }} />
          {t}
        </motion.li>
      ))}
    </motion.ul>
  );
}

const STEPS: [string, ReactNode][] = [
  [
    "Pick an architecture",
    <>
      <strong className="font-semibold text-text-bright">Old / New</strong> in
      the top bar switches every chapter and simulation.
    </>
  ],
  [
    "Read, then run",
    "Each chapter explains why, what and how, then gives you a simulation to play or step through."
  ],
  [
    "Check yourself",
    "A short question ends each chapter. The review at the end collects them all."
  ],
  [
    "Experiment",
    "The Playground runs any scenario with your own numbers."
  ]
];

/** Full-height intro: what the course is, how to use the site, where to start. */
export function CourseHero({ onGo }: { onGo: (i: number) => void }) {
  const { mode } = useSettings();
  return (
    <section
      id="intro"
      aria-label={INTRO_TITLE}
      className="flex min-h-[calc(100dvh-var(--header-h))] scroll-mt-(--header-h) flex-col justify-center border-b border-line-soft px-10 py-16"
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-12">
        <div className="flex max-w-[860px] flex-col gap-5">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            A course for React Native developers
          </motion.span>
          <h1 className="m-0 text-[40px] leading-heading font-bold text-text">
            <HeroTitle />
          </h1>
          <motion.p
            className="m-0 max-w-[760px] text-[28px] leading-[1.4] font-medium text-text-dim"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            See what happens underneath your app, first in the old
            architecture, then in the New Architecture that replaced it.
          </motion.p>
        </div>

        <motion.ol
          aria-label={INTRO_TITLE}
          className="m-0 grid list-none grid-cols-4 gap-4 p-0"
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } }
          }}
        >
          {STEPS.map(([title, body], i) => (
            <motion.li
              key={title}
              className="flex flex-col gap-2 rounded-[10px] border border-line bg-panel p-5"
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <span className="font-mono text-xs leading-none text-text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] leading-snug font-semibold text-text-bright">
                {title}
              </span>
              <span className="text-sm leading-[1.55] text-text-muted">{body}</span>
            </motion.li>
          ))}
        </motion.ol>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onGo(0)}
              className="btn-primary h-11 border-0 px-5 text-sm leading-none"
            >
              Start chapter 1
            </button>
            <Link
              to={`/playground?mode=${mode}`}
              className="btn-secondary h-11 px-5 text-sm leading-none"
            >
              Open the Playground
            </Link>
          </div>
          <ColorLegend />
        </div>
      </div>
    </section>
  );
}
