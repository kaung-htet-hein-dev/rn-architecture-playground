import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/** [question, options, correct index, why] */
const Q: [string, string[], number, string][] = [
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

export function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  let right = 0
  let answered = 0
  Q.forEach((q, i) => {
    if (answers[i] !== undefined) {
      answered++
      if (answers[i] === q[2]) right++
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="h3">Quick check</h3>
        <span className="font-mono text-[13px] leading-none font-medium text-text-dim" aria-live="polite">
          {answered ? `${right} / ${Q.length} correct` : `${Q.length} questions`}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {Q.map(([q, opts, ok, why], qi) => {
          const a = answers[qi]
          const has = a !== undefined
          const good = has && a === ok
          return (
            <div
              key={qi}
              role="group"
              aria-labelledby={`quiz-q${qi}`}
              className="flex flex-col gap-3 rounded-[10px] border border-line bg-surface p-[18px]"
            >
              <div className="flex gap-3">
                <span className="font-mono text-[13px] leading-[1.6] font-medium text-text-faint">0{qi + 1}</span>
                <span id={`quiz-q${qi}`} className="text-base leading-normal font-medium text-text-bright">
                  {q}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {opts.map((o, oi) => {
                  const sel = a === oi
                  const isOk = has && oi === ok
                  return (
                    <motion.button
                      key={oi}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => setAnswers((s) => ({ ...s, [qi]: oi }))}
                      whileTap={{ scale: 0.97 }}
                      animate={sel && !isOk ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-10 rounded-[7px] border px-3.5 py-2 text-left text-sm leading-[1.35] text-text transition-colors duration-200 hover:bg-raised"
                      style={{
                        borderColor: isOk ? '#79d49c' : sel ? '#f0694f' : '#3d4856',
                        background: isOk ? '#79d49c14' : sel ? '#f0694f14' : undefined,
                      }}
                    >
                      {o}
                    </motion.button>
                  )
                })}
              </div>
              <AnimatePresence initial={false}>
                {has && (
                  <motion.p
                    key={String(good)}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="m-0 overflow-hidden text-sm leading-[1.55]"
                    style={{ color: good ? '#9fe0b4' : '#f5a08f' }}
                  >
                    {(good ? 'Right. ' : 'Not quite. ') + why}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
