/** [question, options, correct index, why] */
export const QUIZ: [string, string[], number, string][] = [
  [
    'In the old architecture, how does JS call a native module?',
    ['A direct C++ function call', 'A JSON message over the bridge', 'It reads native memory'],
    1,
    'Every call was serialized to JSON, queued, and parsed on the native side.',
  ],
  [
    'Your JS runs a loop for 400 ms. Does the New Architecture keep taps responsive?',
    ['Yes, JSI makes the loop async', 'No, the JS thread is still busy', 'Only on Android'],
    1,
    'JSI removes the JSON and the queue, but the JS thread still does one thing at a time. Move heavy work off it.',
  ],
  [
    'When does a Turbo Module get created?',
    ['At app launch', 'The first time JS uses it', 'After the first frame'],
    1,
    'Turbo Modules load lazily, which is why startup gets faster.',
  ],
  [
    'What does Codegen read?',
    ['Your component tree', 'A TypeScript spec', 'The JS bundle at runtime'],
    1,
    'It reads the spec at build time and writes typed native interfaces.',
  ],
  [
    'Which Fabric phase applies changes to the real views?',
    ['Render', 'Commit', 'Mount'],
    2,
    'Mount finds what changed between the old and new tree and applies those changes to the real views.',
  ],
]
