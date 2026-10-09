# React Native Internal

An interactive course on how React Native works underneath: the old bridge-based architecture and the New Architecture (JSI, Turbo Modules, Codegen, Fabric). Each chapter pairs a short explanation with a step-through simulation, and a Playground runs the scenarios with your own numbers.

## Routes

- `/` — the course: seven chapters plus a review section
- `/playground` — full-screen trace visualizer with editable parameters

## Stack

React 19, React Router, Tailwind CSS v4, Motion, Vite, TypeScript. The React Compiler is enabled through the Babel plugin, so components skip manual memoization.

## Scripts

```sh
pnpm install
pnpm dev      # start the dev server
pnpm build    # type-check and build
pnpm lint     # run ESLint
```

## Where things live

- `src/pages/course/` — chapter prose
- `src/content/` — glossary, quiz, release timeline, wrap-up copy
- `src/sim/scenarios.ts` — step-by-step scenarios for the course simulations
- `src/sim/playground/` — trace generators for each Playground preset
- `docs/REQUIREMENTS.md` — design and behaviour spec
