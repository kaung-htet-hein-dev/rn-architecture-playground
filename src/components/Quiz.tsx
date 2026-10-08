import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { QUIZ } from '../content/quiz'

const OK = '#79d49c'
const BAD = '#f0694f'

interface QuestionProps {
  index: number
  question: string
  options: string[]
  correct: number
  why: string
  /** chosen option, or undefined while unanswered */
  answer: number | undefined
  onAnswer: (option: number) => void
}

function QuizQuestion({ index, question, options, correct, why, answer, onAnswer }: QuestionProps) {
  const has = answer !== undefined
  const good = has && answer === correct
  return (
    <div
      role="group"
      aria-labelledby={`quiz-q${index}`}
      className="flex flex-col gap-3 rounded-[10px] border border-line bg-surface p-[18px]"
    >
      <div className="flex gap-3">
        <span className="font-mono text-[13px] leading-[1.6] font-medium text-text-faint">0{index + 1}</span>
        <span id={`quiz-q${index}`} className="text-base leading-normal font-medium text-text-bright">
          {question}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o, oi) => {
          const sel = answer === oi
          const isOk = has && oi === correct
          return (
            <motion.button
              key={oi}
              type="button"
              aria-pressed={sel}
              onClick={() => onAnswer(oi)}
              whileTap={{ scale: 0.97 }}
              animate={sel && !isOk ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-10 rounded-[7px] border px-3.5 py-2 text-left text-sm leading-[1.35] text-text transition-colors duration-200 hover:bg-raised"
              style={{
                borderColor: isOk ? OK : sel ? BAD : '#3d4856',
                background: isOk ? OK + '14' : sel ? BAD + '14' : undefined,
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
}

export function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const answered = Object.keys(answers).length
  const right = QUIZ.filter(([, , correct], i) => answers[i] === correct).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="h3">Quick check</h3>
        <span className="font-mono text-[13px] leading-none font-medium text-text-dim" aria-live="polite">
          {answered ? `${right} / ${QUIZ.length} correct` : `${QUIZ.length} questions`}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {QUIZ.map(([question, options, correct, why], i) => (
          <QuizQuestion
            key={i}
            index={i}
            question={question}
            options={options}
            correct={correct}
            why={why}
            answer={answers[i]}
            onAnswer={(oi) => setAnswers((s) => ({ ...s, [i]: oi }))}
          />
        ))}
      </div>
    </div>
  )
}
