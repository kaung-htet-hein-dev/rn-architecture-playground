# React Native Internal: requirements and design handoff

## 1. Overview

This is an interactive website that teaches React Native's old architecture and New Architecture to junior React Native developers. The voice is a senior engineer mentoring a junior one-on-one. It starts from things the reader does every day (press a button, scroll a list, call a native module) and explains what happens underneath. It uses plain words and "you" and "we", and defines every term the first time it appears. Every chapter follows the order **why → what → how → code**.

**Fidelity: high.** The HTML prototypes in `design/` set the final colors, type, spacing, copy and interactions. Rebuild them pixel-close in React + Vite. They are design references, not production code.

## 2. Routes

| Route         | Purpose                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `/`           | Course page: sticky top bar and seven chapter sections                                   |
| `/playground` | Full-screen step-through visualizer, no page scroll (`height: 100dvh; overflow: hidden`) |

## 3. Global UI

### Top bar (course)

- Sticky, 58px minimum height, background `#0f1216ee` with a 10px backdrop blur, bottom border `#262e38`. Content is max 1240px wide with 20px side padding, and wraps.
- **Brand:** two 6×16 bars (amber and cyan) plus "React Native Internal" in Plex Sans 600 15px. Clicking it scrolls to the top.
- **Chapter progress:** 7 clickable segments, 4px tall with radius 2. Past segments `#6b7480`, current one = mode accent, future `#2a323c`. Below the segments, a label in mono 11px reading "03 / 07 · Where it hurt" (hidden under 760px). The active chapter is the last section whose top is less than 180px from the top of the viewport.
- **Old / New segmented toggle:** 30px buttons. Active Old has background `#f2b35b` and text `#1a1408`. Active New has background `#5fd3e6` and text `#071a1e`. Inactive buttons have text `#a1aab5`.
- **Motion:** reduced-motion behavior is always enabled; there is no motion toggle.
- **Playground button:** light pill (background `#e7eaee`, text `#0f1216`) linking to `/playground?mode=<mode>`.

### Shared simulation shell (SimPanel)

- Card: border `#262e38`, radius 12, background `#12161b`.
- **Header:** status chip (mono 11px uppercase, 5×8 padding, dot plus label), scenario title in mono 12px `#a1aab5`, and step-progress segments on the right (16×6 each, clickable to jump to that step).
- **Body:** a flex-wrap row. The diagram is `flex: 1 1 520px` and the code is `flex: 1 1 340px`. On mobile they stack, diagram first.
- **Thread lanes:** a grid of columns (bridge, JSI and Codegen columns are 0.78fr), height 270px (240px on mobile), with 8px gaps.
  - Each lane has a header with a color square, name and subtitle.
  - The lane body shows the last two activities for that lane; the live one uses the lane color at 22% alpha with a 77% alpha border.
  - The active lane has a lane-color border and a 7% tint background.
  - The bridge lane shows queued JSON chips. The JSI lane shows "no JSON". The UI lane can show a mini "SCREEN" readout.
- **Wire:** a dashed horizontal line at y = 62px, amber at 33% alpha in Old mode and cyan in New mode.
- **JSON packet (Old):** amber pill (text `#1a1408`, mono 11px, max 220px, ellipsis, 3px glow ring). It moves from the center of one lane to the center of another with ease-in-out quad over progress 0.06 to 0.76 of a step.
- **JSI line (New):** a 2px cyan line with an 8px glow that grows from caller to callee over the first 28% of the step. It has a 12px dot at its head and a mono label above.
- **Phase pills** (Fabric only): Render, Commit, Mount.
- **Trees row** (Fabric only): Element tree, Shadow tree and Host views in three columns. Nodes are indented 14px per level. Updated trees get an accent border and an "updated" tag.
- **Code panel:** background `#0f1317`, mono 13/1.75. Gutter: line number column 30px wide, marker column 16px. The active line(s) get a mode-accent background at 11% alpha, an accent line number and a ▸ marker. Syntax colors: keyword `#8fa6c9`, string `#b5c98f`, comment `#6b7480`, JSX tag `#eef1f4`, default `#c4cbd3`. The header has the filename and a Show/Hide code button.
- **Controls:** Play/Pause/Resume/Replay (accent border, accent text, accent at 8% alpha background), Step, Speed segmented 0.5×/1×/2×, Reset, and a "step n / N" label.
- **Mentor caption:** a 3px accent bar plus a sentence in Plex Sans 15/1.6 `#d5dae0`, minimum height 76px, `aria-live`.

### Playback model

- Each step lasts 2.4 s at 1×. Progress p goes from 0 to 1 and then advances to the next step.
- **Play** from idle or complete starts at step 0.
- **Step** immediately advances to the next step and pauses; it does not wait for the step duration.
- **Jump** (clicking a segment) plays that one step.
- **Status:** `idle` (step = −1), `running`, `paused`, `complete` (last step and p = 1), and `error` (a step flagged `err` once past p = 0.5).

## 4. Chapters

All copy, scenario steps, packet labels and code lines are in `design/SimPanel.dc.html` (`static LIB`) and `design/React Native Internal.dc.html`. Port them verbatim.

1. **One tap, slowed down (hero):** hero title "React Native Internal" (clamp 44–88px, weight 600, −3.5% tracking), a lede, and a thread color legend. SimPanel `tap`. Old: 8 steps through JSON and the bridge. New: 6 steps where the touch becomes a C++ event scheduled onto the JS thread, with no JSON.
2. **The old map:** SimPanel `map`, 4 lanes (JS, Bridge or JSI, Shadow, UI).
3. **Where it hurt:** ScrollRace (section 5.1).
4. **JSI:** SimPanel `jsi`. Old: a getLevel round trip with module and method IDs and four rounds of JSON. New: a host object called synchronously.
5. **Turbo Modules and Codegen:** StartupBars (section 5.2), then SimPanel `codegen`. New: TypeScript spec → Codegen → native interface. Old: argument mismatch causes a runtime error.
6. **Fabric:** SimPanel `fabric` with phases and trees.
7. **Wrap-up:**
   - Map cards (the new map, or the old map when the toggle is Old).
   - Editable timeline: 0.68 Mar 2022, 0.74 Apr 2024, 0.76 Oct 2024, 0.80 Jun 2025, 0.82 Oct 2025. Dates are inputs, saved to `localStorage['atb-dates']`, with a Reset button.
   - Five migration notes and six one-sentence summary cards.
   - A five-question quiz with instant feedback: correct `#79d49c` border and `#9fe0b4` text, wrong `#f0694f` border and `#f5a08f` text. Score shows as "n / 5 correct".
   - A 22-term glossary in a two-column definition list.
   - A Playground call to action.

Each chapter section has 96px vertical padding, a max width of 1240px, a 44px gap between blocks, an eyebrow ("CHAPTER 0N", mono 12px, +10% tracking), an h2 (clamp 30–48px, weight 600), and a Why/What/How grid (`repeat(auto-fit, minmax(min(100%,280px),1fr))`, prose 17/1.65 `#d5dae0`). Paragraphs that differ by mode switch in place.

## 5. Simulation models

### 5.1 ScrollRace (chapter 3)

The model advances one frame (16.6 ms) per tick. Real time runs at half speed (one sim frame per 33.2 ms at 1×). The run ends after 600 frames.

**Inputs**

- Scroll: y = frame × 4 px.
- Work per event: w = 1 + load × 0.2 ms, where load comes from a slider (0–100, default 25).

**Each side, each frame**

- `rows = clamp(ceil((y − renderedY) / 52), 1, 10)`
- JSON cost: Old = 1 + rows × 1.2 ms; New = 0.
- Messages in the next batch: 1 + rows.
- `avail += 16.6`
- If `avail ≥ w + json`: process the latest y (`renderedY = y`) and set `avail = min(avail − cost, 16.6)`.
- Otherwise: dropped frame, red flash for 3 frames.

Both sides merge pending events into the latest one. That is real behaviour in both architectures.

**Overloaded** when JS lag (`(y − renderedY) / 4 × 16.6`) exceeds 80 ms.

**Phone display**

- 212×400 frame with radius 30.
- Rows 52px apart. A row is filled if `index × 52 < renderedY + 340 + 52`; otherwise it shows as a blank skeleton.
- Header reads "JS rendered to y = …".

**Metrics shown:** dropped frames (count and %), next bridge batch (squares, red past 5), JS lag in ms, cost per event.

**Captions:** idle, keeping up, old falling behind, both falling behind, complete. See the prototype for the exact strings.

### 5.2 StartupBars (chapter 5)

**Modules (ms):** Storage 40\*, Analytics 35\*, Camera 120, Maps 160, Bluetooth 90, Payments 110, Contacts 60, Location 70, Biometrics 50, Haptics 15. (\* = used by the first screen.)

**Plans**

- Old: all modules in sequence, then JS bundle 180, then first render 40. Interactive at 970 ms.
- New: bundle 180, then the starred modules on first use, then render 40. Interactive at 295 ms.

**Playback and display**

- Axis 0–1000 ms. Playback is 0.36 sim ms per real ms × speed. Step jumps to the next segment boundary.
- The active-mode row gets an accent border.
- After the New row completes, the 8 unloaded modules become buttons. Tapping one sets it to "loading" for d × 4 ms, then "ready".

### 5.3 Playground trace generators

`gen(preset, mode, params, rate)` returns a deterministic trace:

| Field | Shape                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E`   | tasks `{lane: js\|shadow\|ui\|native, t, d, label, ln?, stack?, cap?}`                                                                                     |
| `M`   | Old messages `{kind:'msg', t, d (time in queue + transit), from, to, label, payload, bytes}` or New calls `{kind:'call', t, d:0.4, from, to, sig, sched?}` |
| `UI`  | phone state patches `{t, …}`                                                                                                                               |
| `MOD` | module status `{t, n, s: loading\|ready}`                                                                                                                  |
| `TR`  | tree updates `{t, k: e\|s\|h}`                                                                                                                             |
| `ST`  | stall intervals (UI waiting for JS)                                                                                                                        |
| `Q`   | JS-side pending queue entries                                                                                                                              |

**Derived fields**

- `frames`: every 16.6 ms; dropped if UI work exceeds 16.6 ms or the frame overlaps a stall.
- `qMax`, `points` (step points, the unique start times), `total` (end + 12, rounded up to 10), `metric`.
- Old messages cost `3 + bytes/8000` ms of transit.

**Presets** (editable params in `§param§` tokens; port each generator from `Playground.dc.html`):

| Preset                     | Params                                                      | What it shows                                                                                                                          |
| -------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Button tap → native module | style, step                                                 | Touch → JS → module call → render → mount. Old uses module and method IDs in JSON. New schedules a C++ event and Haptics loads lazily. |
| App startup                | modules (2–40)                                              | Old creates every module before the bundle. New loads the bundle first, then Storage and Analytics on first use.                       |
| onScroll with setState     | work ms + event rate                                        | Both merge stale events. Old pays JSON both ways plus flush latency.                                                                   |
| Animation                  | duration, native, busy                                      | Without the native driver, frames freeze while JS is busy. With it, the UI thread animates alone.                                      |
| Measuring layout           | gap                                                         | Old: mounts at top 0, async measure round trip, jump (wrong-place frames). New: synchronous measure in `useLayoutEffect` before mount. |
| Heavy JS loop              | iterations (busy = N / 250000 ms, capped at 800) + tap rate | Taps wait in both architectures.                                                                                                       |
| Large payload              | rows (× 140 bytes)                                          | Old: stringify, transit, parse. New: shared ArrayBuffer through JSI.                                                                   |

**Playback:** a full trace plays in about 9 s at 1× (`c += dt × speed × total / 9000`). Reduced motion jumps to the next step point every 900 ms. Step forward and back move to the next or previous point. The scrubber runs 0–1000. Compare renders Old and New lane groups on one shared time scale. Tapping the phone restarts and plays; scrolling on the phone does the same in the scroll preset.

**Status:** `idle`, `running`, `paused`, `complete`, and `overloaded` (queue ≥ 4 or a dropped frame within the last 34 ms).

## 6. Playground layout

**Header (52px):** brand link back to the course, "PLAYGROUND", the Old/New toggle, a Compare toggle (inverted light when on), and the Motion toggle.

**Three columns at 1180px and wider:** `340px | minmax(0,1fr) | 320px`. Each column scrolls internally.

- **Left**
  - Preset select.
  - Description.
  - Code panel with editable params: input boxes with `#5fd3e6aa` borders and a cyan background at 8% alpha.
  - Phone, 220×400, which accepts taps and scrolls.
- **Center**
  - Time axis, then one lane group per trace (Old/New).
  - 150px lane label column with live readouts:
    - JS: call stack (`a › b`) and JS queue.
    - Bridge: queue depth (red at 4 or more).
    - JSI: "no JSON · values via JSI".
    - UI: 16.6 ms frame-budget bar (pink, red when dropped).
  - Track:
    - Lanes 40px tall; task blocks 22px tall. A live block is filled with the lane color; past blocks use 25% alpha; future blocks are outlines only.
    - Bridge packets: 9px rows, stacked up to 3, clickable.
    - JSI calls: vertical 2px cyan lines with a dot at the target, clickable.
    - Frame strip: 10px, `#3a4a3f` for OK frames and `#f0694f` for dropped ones.
    - Cursor: a 2px white line.
  - Legend.
- **Right**
  - Metrics: dropped frames, queue depth (now / max), the preset metric, bytes serialized. Shows two columns in Compare.
  - Message inspector: the selected or latest message. Old shows route, time, in-flight, size and the JSON payload. New shows the call, route (marked "queued for JS thread" if scheduled) and "bytes copied 0".
  - Native module status: not loaded `#6b7480`, loading `#eef1f4`, ready (amber in Old, cyan in New).
  - Element, Shadow and Host trees.

**Controls bar (pinned to the bottom):** ‹ Back, Play, Step ›, scrubber, "c / total ms", speed, event rate (10–120/s; dimmed for presets that don't use it), status chip. Below it, the mentor caption for the latest event.

**Below 1180px:** tabs (Code / Threads / Inspect, 44px tall, active tab has an accent underline) show one panel at a time, with controls stay pinned to the bottom.

## 7. Design tokens

### Colors

| Token       | Value                  | Use                                                |
| ----------- | ---------------------- | -------------------------------------------------- |
| bg          | #0f1216                | page                                               |
| panel       | #12161b                | sim cards                                          |
| surface     | #151a20                | cards, lanes                                       |
| raised      | #1b2129                | buttons                                            |
| code-bg     | #0f1317                | code, captions                                     |
| line        | #262e38                | borders                                            |
| line-soft   | #1e252d                | dividers                                           |
| line-strong | #333d49                | controls                                           |
| text        | #e7eaee                | body                                               |
| text-bright | #eef1f4                | headings                                           |
| text-prose  | #d5dae0                | prose                                              |
| text-muted  | #c4cbd3                | secondary                                          |
| text-dim    | #a1aab5                | labels                                             |
| text-faint  | #8a94a0                | meta                                               |
| old         | #f2b35b (tint #2a2216) | old architecture, bridge, JSON                     |
| new         | #5fd3e6 (tint #11262b) | New Architecture, JSI, C++, Turbo Modules, Codegen |
| load        | #f0694f (tint #2c1714) | overload, dropped frames, errors                   |
| js          | #b39dff                | JS thread                                          |
| shadow      | #79d49c                | Shadow / background thread                         |
| ui          | #f291c4                | UI thread                                          |
| native      | #9fb0c3                | native modules                                     |

Alpha suffixes are used throughout (e.g. `#5fd3e61f` for the chip background, `14` for button tints, `22` for live activity).

### Type (IBM Plex Sans / IBM Plex Mono)

| Role          | Spec                                         |
| ------------- | -------------------------------------------- |
| Display       | 600, clamp(44px, 7.4vw, 88px)/0.98, −0.035em |
| Chapter h2    | 600, clamp(30px, 4.2vw, 48px)/1.08, −0.02em  |
| Section h3    | 600, 22/1.2                                  |
| Lede          | 400, clamp(17px, 1.6vw, 20px)/1.55           |
| Prose         | 400, 17/1.65                                 |
| Caption       | 400, 15/1.6                                  |
| Eyebrow       | Mono 500, 12, +0.1em, uppercase              |
| Code          | Mono 400, 13/1.75 (12.5 in the playground)   |
| Meta / packet | Mono 500, 11                                 |

### Radius and spacing

- Radius: 12 (cards), 10 (sub-cards), 8 (lanes), 6–7 (buttons), 4–5 (chips, packets), 2 (squares).
- Spacing: section padding 96px; block gap 44px; grid gaps 24/44; control gap 8; card padding 14–18.

### Motion

- Lane and border color fades: 250 ms.
- Packets: ease-in-out quad.
- Reduced motion: no travel or flashes, discrete steps, instant scrolling.

## 8. Technical accuracy rules (must hold)

- Old architecture: JS ↔ native only through the asynchronous, batched JSON bridge. Module calls carry numeric module and method IDs. The Shadow thread runs Yoga on its own copy of the tree. Most modules are created at launch by default.
- New Architecture:
  - JSI lets JS hold host objects and call C++ directly, synchronously or asynchronously.
  - Events from native are C++ events **scheduled onto the JS thread**. They still wait their turn; they are not JSON.
  - Turbo Modules load on first use. Codegen generates typed interfaces at build time, and the compiler flags mismatches.
  - Fabric: render (element tree → C++ shadow nodes) → commit (Yoga layout, sealed immutable tree) → mount (diff → mutations → host views on the UI thread). Synchronous layout reads in `useLayoutEffect`.
- Neither architecture fixes a busy JS thread. The heavy-loop preset must show equal tap delay in both.
- Scroll events are merged into the latest one in both architectures.
- Timeline: 0.68 opt-in, 0.74 bridgeless by default when the New Architecture is on, 0.76 on by default, 0.80 legacy frozen, 0.82 New Architecture only.

## 9. Acceptance criteria

- [ ] Every chapter and the playground match the prototypes at 1440px and 390px, in both toggle positions.
- [ ] Every simulation supports play, pause, step, speed, reset and shows its status (idle / running / paused / complete, plus overloaded or error where relevant).
- [ ] The toggle rewires all diagrams without reloading. Reduced motion is honoured from the OS and from the toggle.
- [ ] Unit tests: ScrollRace (load 0 → 0 drops on both; load 100 → Old drops more than New), startup totals (970 / 295), every playground preset (deterministic output, heavy-loop tap wait equal across modes, payload New faster than Old, measure New = 0 wrong-place frames).
- [ ] Playground fits the viewport with no page scroll at 1440×900 and 390×844.
- [ ] URL params are validated and invalid values ignored. Timeline dates persist.
- [ ] `npm run build` passes with no type errors. Lighthouse accessibility ≥ 95.

## 10. Files

| File                                   | Contents                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `design/React Native Internal.dc.html` | Course page (all chapter copy, startup plan, quiz, glossary, timeline) |
| `design/SimPanel.dc.html`              | Reusable lanes + code panel, all chapter scenarios                     |
| `design/ScrollRace.dc.html`            | Chapter 3 simulation                                                   |
| `design/Playground.dc.html`            | Playground layout and preset generators                                |
| `design/Component Sheet.dc.html`       | Tokens and component states                                            |
| `design/Screens.dc.html`               | Review board only (desktop/mobile × old/new iframes)                   |
| `design/support.js`                    | Runtime needed to open the prototypes in a browser                     |

To view the prototypes, run `npx serve design` and open `React Native Internal.dc.html`. Add `?mode=new`, `?ch=3` or `?demo=1` to see other states.
