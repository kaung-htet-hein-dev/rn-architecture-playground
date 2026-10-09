export interface QuizItem {
  /** 0-based chapter the question checks */
  ch: number
  question: string
  options: string[]
  correct: number
  why: string
}

export const QUIZ: QuizItem[] = [
  {
    ch: 0,
    question: 'You tap a button. Which thread receives the touch first?',
    options: ['The JS thread', 'The UI thread', 'The bridge'],
    correct: 1,
    why: 'The UI thread owns the screen, so it gets the touch and reports it to JavaScript.',
  },
  {
    ch: 1,
    question: 'In the old architecture, how does JS call a native module?',
    options: ['A direct C++ function call', 'A JSON message over the bridge', 'It reads native memory'],
    correct: 1,
    why: 'Every call was serialized to JSON, queued, and parsed on the native side.',
  },
  {
    ch: 2,
    question: 'Both phones do the same JS work per scroll event. Why does the old one drop more frames?',
    options: [
      'Its scrolling runs in JavaScript',
      'Every event and row update also pays for JSON',
      'It renders more rows',
    ],
    correct: 1,
    why: 'The old phone serializes the scroll event in and the row updates out, and the batches grow as JS falls behind.',
  },
  {
    ch: 3,
    question: 'Your JS runs a loop for 400 ms. Does the New Architecture keep taps responsive?',
    options: ['Yes, JSI makes the loop async', 'No, the JS thread is still busy', 'Only on Android'],
    correct: 1,
    why: 'JSI removes the JSON and the queue, but the JS thread still does one thing at a time. Move heavy work off it.',
  },
  {
    ch: 4,
    question: 'When does a Turbo Module get created?',
    options: ['At app launch', 'The first time JS uses it', 'After the first frame'],
    correct: 1,
    why: 'Turbo Modules load lazily, which is why startup gets faster.',
  },
  {
    ch: 4,
    question: 'What does Codegen read?',
    options: ['Your component tree', 'A TypeScript spec', 'The JS bundle at runtime'],
    correct: 1,
    why: 'It reads the spec at build time and writes typed native interfaces.',
  },
  {
    ch: 5,
    question: 'Which Fabric phase applies changes to the real views?',
    options: ['Render', 'Commit', 'Mount'],
    correct: 2,
    why: 'Mount finds what changed between the old and new tree and applies those changes to the real views.',
  },
  {
    ch: 6,
    question: 'The screen update is wrapped in startTransition. The user taps another tab halfway through rendering it. What happens to the half-finished render?',
    options: [
      'It finishes first, then the tap is handled',
      'React throws it away and handles the tap first',
      'It moves to another thread',
    ],
    correct: 1,
    why: 'Transition renders can be interrupted. React drops the unfinished tree, renders the urgent update, then starts the transition over.',
  },
  {
    ch: 6,
    question: 'Does concurrent rendering run your components on several threads at once?',
    options: ['Yes, each transition gets its own thread', 'No, it’s one JS thread working in a better order', 'Only in release builds'],
    correct: 1,
    why: 'Concurrent means interruptible, not parallel. React still renders on the JS thread, but it pauses every few milliseconds so urgent work can go first.',
  },
  {
    ch: 7,
    question: 'After you migrate, does a slow JavaScript function get faster?',
    options: ['Yes, JSI compiles it to C++', 'No, only the cost of crossing to native goes down', 'Only in release builds'],
    correct: 1,
    why: 'JSI removes the cost of JSON, but it won’t make slow JavaScript faster. Measure again after migrating.',
  },
]
