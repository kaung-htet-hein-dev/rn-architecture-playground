export const CHAPTER_TITLES = [
  "What happens when you tap a button",
  "React Native threads and the old bridge",
  "How bridge traffic can drop frames",
  "JSI: calling native modules directly",
  "Turbo Modules: lazy loading and Codegen",
  "Fabric: render, commit, and mount",
  "Migrating to the New Architecture"
] as const;

export const CHAPTER_COUNT = CHAPTER_TITLES.length;

/** DOM id of the section for the 0-based chapter index. */
export const chapterId = (i: number) => `ch${i + 1}`;
