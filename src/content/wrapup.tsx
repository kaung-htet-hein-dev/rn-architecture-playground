import type { ReactNode } from "react";
import { C, alpha } from "../sim/colors";

export interface MapCard {
  name: string;
  c: string;
  bd: string;
  bg: string;
  body: ReactNode;
  mono?: boolean;
}

export const NEW_MAP: MapCard[] = [
  {
    name: "JS thread",
    c: C.js,
    bd: alpha(C.js, 40),
    bg: C.surface,
    body: "React and your code. Holds host objects for modules it has used."
  },
  {
    name: "JSI",
    c: C.new,
    bd: C.new,
    bg: C.newTint,
    body: "Direct calls between JS and C++. Sync or async, no JSON."
  },
  {
    name: "C++ core",
    c: C.new,
    bd: alpha(C.new, 40),
    bg: C.surface,
    mono: true,
    body: (
      <>
        Fabric renderer
        <br />
        Shared shadow tree
        <br />
        Turbo Modules (lazy)
      </>
    )
  },
  {
    name: "Background thread",
    c: C.shadow,
    bd: alpha(C.shadow, 40),
    bg: C.surface,
    body: "Yoga layout in C++ during commit, off the UI thread. Can run synchronously for urgent work."
  },
  {
    name: "UI thread",
    c: C.ui,
    bd: alpha(C.ui, 40),
    bg: C.surface,
    body: "Applies mutations to host views, handles touches."
  }
];

export const OLD_MAP: MapCard[] = [
  {
    name: "JS thread",
    c: C.js,
    bd: alpha(C.js, 40),
    bg: C.surface,
    body: "React and your code. Reaches native only by sending JSON messages."
  },
  {
    name: "Bridge",
    c: C.old,
    bd: C.old,
    bg: C.oldTint,
    body: "Async JSON messages, sent in batches. The only way across."
  },
  {
    name: "Shadow thread",
    c: C.shadow,
    bd: alpha(C.shadow, 40),
    bg: C.surface,
    body: "Its own copy of the tree. Yoga layout."
  },
  {
    name: "UI thread",
    c: C.ui,
    bd: alpha(C.ui, 40),
    bg: C.surface,
    body: "Creates views, handles touches."
  },
  {
    name: "Native modules",
    c: C.native,
    bd: alpha(C.native, 40),
    bg: C.surface,
    body: "Mostly created at launch. Nothing checks their types."
  }
];

export const NOTES = [
  "Upgrade to a current React Native version. The New Architecture is on by default from 0.76, and from 0.82 it is the only option.",
  "Check your libraries first. The interop layer lets many old-style modules and components run unchanged while their authors catch up.",
  "Move your own native modules to Turbo Modules: write a TypeScript spec, run Codegen, implement the generated interface.",
  "Search for code built around the bridge: setNativeProps, findNodeHandle, direct UIManager calls. Test those screens closely.",
  "Measure your app again after migrating. JSI removes the cost of JSON, but it won’t make slow JavaScript faster."
];

export const SUMMARY: [string, string][] = [
  ["01 · One tap", "A tap is a round trip: native to JS, and back to native."],
  [
    "02 · The old map",
    "Three threads that could only talk through an asynchronous JSON bridge."
  ],
  [
    "03 · Where it hurt",
    "Under load, JSON on the bridge pushes each event past the 16.6 ms frame, and frames drop."
  ],
  ["04 · JSI", "JS holds a reference to a C++ object and calls it directly."],
  [
    "05 · Turbo Modules",
    "Modules load when first used, and Codegen keeps JS and native types in agreement."
  ],
  [
    "06 · Fabric",
    "Render, commit, mount, on one shadow tree in C++ that every thread can read."
  ]
];
