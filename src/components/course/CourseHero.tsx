import { motion } from "motion/react";
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
          {i < TITLE_WORDS.length - 1 ? " " : ""}
        </motion.span>
      ))}
      <motion.span
        aria-hidden="true"
        className="absolute -bottom-2 left-0 h-[3px] w-full origin-left rounded-full"
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

/** Course intro: eyebrow, title, lede, color legend. */
export function CourseHero() {
  return (
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
        You write React Native every day. Let’s slow it down and look at what
        happens underneath: first in the old architecture, then in the New
        Architecture that replaced it. Seven short chapters, then a playground
        where you can poke at everything.
      </motion.p>
      <ColorLegend />
    </div>
  );
}
