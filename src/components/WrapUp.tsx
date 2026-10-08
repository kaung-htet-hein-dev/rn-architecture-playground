import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { useSettings } from '../app/SettingsProvider'
import { Reveal } from './Chapter'
import { Glossary } from './Glossary'
import { Quiz } from './Quiz'
import { Timeline } from './Timeline'

interface MapCard {
  name: string
  c: string
  bd: string
  bg: string
  body: ReactNode
  mono?: boolean
}

const NEW_MAP: MapCard[] = [
  { name: 'JS thread', c: '#b39dff', bd: '#b39dff66', bg: '#171d24', body: 'React and your code. Holds host objects for modules it has used.' },
  { name: 'JSI', c: '#5fd3e6', bd: '#5fd3e6', bg: '#11262b', body: 'Direct calls between JS and C++. Sync or async, no JSON.' },
  {
    name: 'C++ core',
    c: '#5fd3e6',
    bd: '#5fd3e666',
    bg: '#171d24',
    mono: true,
    body: (
      <>
        Fabric renderer
        <br />
        Shared shadow tree
        <br />
        Turbo Modules (lazy)
      </>
    ),
  },
  {
    name: 'Background thread',
    c: '#79d49c',
    bd: '#79d49c66',
    bg: '#171d24',
    body: 'Yoga layout in C++ during commit, off the UI thread. Can run synchronously for urgent work.',
  },
  { name: 'UI thread', c: '#f291c4', bd: '#f291c466', bg: '#171d24', body: 'Applies mutations to host views, handles touches.' },
]

const OLD_MAP: MapCard[] = [
  { name: 'JS thread', c: '#b39dff', bd: '#b39dff66', bg: '#171d24', body: 'React and your code. Reaches native only by sending JSON messages.' },
  { name: 'Bridge', c: '#f2b35b', bd: '#f2b35b', bg: '#2a2216', body: 'Async JSON messages, sent in batches. The only way across.' },
  { name: 'Shadow thread', c: '#79d49c', bd: '#79d49c66', bg: '#171d24', body: 'Its own copy of the tree. Yoga layout.' },
  { name: 'UI thread', c: '#f291c4', bd: '#f291c466', bg: '#171d24', body: 'Creates views, handles touches.' },
  { name: 'Native modules', c: '#9fb0c3', bd: '#9fb0c366', bg: '#171d24', body: 'Mostly created at launch. Nothing checks their types.' },
]

const NOTES = [
  'Upgrade to a current React Native version. The New Architecture is on by default from 0.76.',
  'Check your libraries first. The interop layer lets many old-style modules and components run unchanged while their authors catch up.',
  'Move your own native modules to Turbo Modules: write a TypeScript spec, run Codegen, implement the generated interface.',
  'Search for code built around the bridge: setNativeProps, findNodeHandle, direct UIManager calls. Test those screens closely.',
  'Measure your app again after migrating. JSI removes the cost of JSON, but it won’t make slow JavaScript faster.',
]

const SUMMARY: [string, string][] = [
  ['01 · One tap', 'A tap is a round trip: native to JS, and back to native.'],
  ['02 · The old map', 'Three threads that could only talk through an asynchronous JSON bridge.'],
  ['03 · Where it hurt', 'Under load, JSON on the bridge pushes each event past the 16.6 ms frame, and frames drop.'],
  ['04 · JSI', 'JS holds a reference to a C++ object and calls it directly.'],
  ['05 · Turbo Modules', 'Modules load when first used, and Codegen keeps JS and native types in agreement.'],
  ['06 · Fabric', 'Render, commit, mount, on one shadow tree in C++ that every thread can read.'],
]

function MapCards() {
  const { mode } = useSettings()
  const isNew = mode === 'new'
  const cards = isNew ? NEW_MAP : OLD_MAP
  return (
    <div className="flex flex-col gap-5">
      <h3 className="h3">{isNew ? 'The new map' : 'The old map, for comparison'}</h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={mode} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-5">
          <motion.div
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] items-stretch gap-3"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {cards.map((m) => (
              <motion.div
                key={m.name}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
                }}
                className="flex flex-col gap-2 rounded-[10px] border p-4"
                style={{ borderColor: m.bd, background: m.bg }}
              >
                <span className="text-sm leading-none font-semibold" style={{ color: m.c }}>
                  {m.name}
                </span>
                <span className={m.mono ? 'font-mono text-[13px] leading-normal text-text-muted' : 'text-sm leading-normal text-text-muted'}>
                  {m.body}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }}
            className="rounded-lg border border-dashed border-line-strong px-3.5 py-3 font-mono text-[13px] leading-normal text-text-dim"
          >
            {isNew
              ? 'Build time · Codegen reads your TypeScript specs and generates the C++ interfaces both sides must match.'
              : 'Switch to New in the top bar to see what replaced each part.'}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function WrapUp() {
  const { mode, reduced } = useSettings()
  const pgHref = `/playground?mode=${mode}${reduced ? '&motion=reduced' : ''}`
  return (
    <>
      <Reveal>
        <MapCards />
      </Reveal>
      <Reveal>
        <Timeline />
      </Reveal>
      <Reveal className="flex flex-col gap-5">
        <h3 className="h3">Migration notes</h3>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3.5 p-0">
          {NOTES.map((n, i) => (
            <li key={i} className="flex gap-3.5 rounded-[10px] border border-line bg-surface p-4">
              <span className="font-mono text-[13px] leading-[1.6] font-medium text-new">0{i + 1}</span>
              <span className="text-[15px] leading-[1.6] text-text-prose">{n}</span>
            </li>
          ))}
        </ol>
      </Reveal>
      <Reveal className="flex flex-col gap-5">
        <h3 className="h3">In one sentence</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
          {SUMMARY.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-3 rounded-[10px] border border-line p-[18px]">
              <span className="font-mono text-xs leading-none font-medium text-text-faint">{k}</span>
              <span className="text-base leading-[1.55] text-text-bright">{v}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <Quiz />
      </Reveal>
      <Reveal>
        <Glossary />
      </Reveal>
      <Reveal>
        <div className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-xl border border-line-strong bg-surface p-7">
          <div className="relative flex flex-col gap-1.5">
            <span className="text-xl leading-[1.3] font-semibold text-text-bright">Now try it yourself</span>
            <span className="text-[15px] leading-normal text-text-muted">Seven scenarios to run in either architecture. Pause on any step and look inside.</span>
          </div>
          <Link
            to={pgHref}
            className="relative flex h-[42px] items-center rounded-lg bg-text px-[18px] text-sm leading-none font-semibold text-bg no-underline transition-transform hover:text-bg active:scale-[.97]"
          >
            Open the Playground
          </Link>
        </div>
      </Reveal>
    </>
  )
}
