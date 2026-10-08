# Development prompt

You are a senior React and React Native engineer. Build **"Across the Bridge"**, an interactive website that teaches junior React Native developers how the old architecture (the bridge) and the New Architecture (JSI, Turbo Modules, Codegen, Fabric) work.

## Inputs

- `REQUIREMENTS.md`: full functional spec, simulation models, design tokens, and acceptance criteria. Treat it as the source of truth.
- `design/*.dc.html`: high-fidelity HTML prototypes. Open them in a browser (serve the folder with `npx serve design` so `support.js` loads). They are **design references, not code to ship**. Each file has a template (markup between `<x-dc>` tags) and a `class Component` logic block in a `<script data-dc-script>` tag. All copy, scenario data, preset generators and simulation maths live in those logic blocks. Port them faithfully.
  - `Across the Bridge.dc.html` is the course page: top bar, chapters 1–7, startup bars, quiz, timeline, glossary.
  - `SimPanel.dc.html` is the reusable thread-lanes + code panel. Its `static LIB` holds every chapter scenario for both modes.
  - `ScrollRace.dc.html` is chapter 3's two-phone scroll simulation.
  - `Playground.dc.html` is the full-screen visualizer. `static PRESETS` and `gen()` hold the trace generators.
  - `Component Sheet.dc.html` holds the tokens and component states.
  - `Screens.dc.html` is a review board only. Don't port it.

## Stack

- Vite + React 18 + TypeScript (`npm create vite@latest across-the-bridge -- --template react-ts`).
- React Router v6: `/` (course) and `/playground` (full-screen, no page scroll).
- Styling: CSS Modules plus one `tokens.css` file of CSS custom properties taken from the token tables in REQUIREMENTS.md. No UI kit. Fonts: IBM Plex Sans and IBM Plex Mono (Google Fonts or `@fontsource`).
- State: React context for global settings (`mode: 'old' | 'new'`, `reducedMotion`, persisted in the URL `?mode=` and `localStorage`). Local `useReducer` per simulation.
- No other runtime dependencies unless you can justify them. Vitest + React Testing Library for tests.

## Architecture to build

```
src/
  app/            App.tsx, routes, SettingsProvider (mode, reducedMotion)
  styles/         tokens.css, global.css
  sim/            pure, framework-free simulation logic + tests
    clock.ts        useSimClock(): rAF loop, play/pause/step/speed/reset, idle|running|paused|complete
    scenarios.ts    typed port of SimPanel LIB (tap, map, jsi, codegen, fabric × old/new)
    scrollRace.ts   frame-stepped model from ScrollRace (pure `advance(state)`)
    startup.ts      eager vs lazy plan from the course page
    playground/     trace generators per preset → { tasks, messages, uiPatches, modules, trees, stalls, frames, metrics }
  components/
    TopBar, ModeToggle, MotionToggle, ChapterProgress
    SimPanel (ThreadLanes + CodePanel + SimControls + MentorCaption + TreeViews)
    ThreadLanes, Packet, JsiLine, CodePanel (syntax tokens, active line, editable params), SimControls, StateChip
    PhoneFrame, ScrollRace, StartupBars, Quiz, Timeline, Glossary
  pages/
    Course.tsx    chapters 1–7 in order, each `<section id="chN">`
    Playground.tsx
```

Rules:

1. All simulation logic is pure TypeScript in `src/sim`, with no React and no DOM, so it can be unit tested. Components only render state.
2. One `useSimClock` hook drives every simulation: play, pause, step, speed (0.5×/1×/2×), reset, and status `idle | running | paused | complete`. `overloaded` (and `error` for the Codegen demo) is derived from the model. Stop requestAnimationFrame whenever nothing is playing.
3. The Old/New toggle rewires every diagram in place: switching mode resets that simulation to idle with the other scenario. Never reload the page.
4. Reduced motion (OS `prefers-reduced-motion` or the toggle): packets and lines appear at their destination with no travel, the playground cursor jumps step to step, and there are no red flashes. Behaviour is otherwise identical.
5. Thread colors are fixed everywhere: JS `#b39dff`, Shadow `#79d49c`, UI `#f291c4`, native module `#9fb0c3`. Old = amber `#f2b35b`, New = cyan `#5fd3e6`, load or error = `#f0694f`.
6. Copy is verbatim from the prototypes. Keep the mentor voice and the why → what → how → code order. Don't invent technical claims. If you find something inaccurate about React Native internals, flag it in your summary instead of rewriting it silently.
7. Responsive: on desktop, the diagram sits beside the code. Below 760px the diagram comes first and the code is collapsed behind a "Show code" button. Playground: three columns at 1180px and wider; below that, tabs (Code / Threads / Inspect) with the controls pinned to the bottom.
8. Accessibility: every control is a real `<button>` or `<input>` with a label. Simulation status lives in an `aria-live="polite"` region (the mentor caption). Keyboard support in the Playground: ←/→ step, Space play/pause. Text contrast at least 4.5:1 using the tokens.

## Order of work

1. Scaffold, tokens, fonts, SettingsProvider, TopBar, routes.
2. `useSimClock` + `SimPanel`, verified against chapter 1 in both modes, then chapters 2, 4, 5 (Codegen), 6.
3. ScrollRace (chapter 3), then StartupBars (chapter 5).
4. Chapter 7: new map, editable timeline (localStorage key `atb-dates`), migration notes, summary cards, quiz, glossary.
5. Playground: trace generators first, with unit tests; then lanes, inspector, trees, metrics, controls, Compare, phone preview, mobile tabs.
6. URL params: course `?mode=&ch=&motion=`, playground `?mode=&preset=&compare=1&rate=&at=0..1&tab=`. Validate every value.
7. Tests (see Acceptance in REQUIREMENTS.md), `npm run build` with no type errors, Lighthouse accessibility of 95 or higher.

When finished, give me a short summary: what you built, any deviations from the prototypes, and anything you think is technically questionable.
