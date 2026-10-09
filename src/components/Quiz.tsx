import { AnimatePresence, motion } from 'motion/react'
import { QUIZ } from '../content/quiz'
import { answerQuiz, useQuizAnswers } from '../hooks/useQuizAnswers'

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
        <span className="font-mono text-[13px] leading-[1.6] font-medium text-text-faint">{String(index + 1).padStart(2, '0')}</span>
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
                borderColor: isOk ? OK : sel ? BAD : '#404756',
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

function QuestionList({ indices }: { indices: number[] }) {
  const answers = useQuizAnswers()
  return (
    <div className="flex flex-col gap-3">
      {indices.map((i) => {
        const q = QUIZ[i]
        return (
          <QuizQuestion
            key={i}
            index={i}
            question={q.question}
            options={q.options}
            correct={q.correct}
            why={q.why}
            answer={answers[i]}
            onAnswer={(oi) => answerQuiz(i, oi)}
          />
        )
      })}
    </div>
  )
}

/** One or two questions right after a chapter's simulation. */
export function ChapterCheck({ ch }: { ch: number }) {
  const indices = QUIZ.flatMap((q, i) => (q.ch === ch ? [i] : []))
  if (!indices.length) return null
  return (
    <section aria-label="Check yourself" className="flex max-w-[780px] flex-col gap-4">
      <h3 className="m-0 text-lg leading-tight font-semibold text-text-bright">Check yourself</h3>
      <QuestionList indices={indices} />
    </section>
  )
}

/** Every chapter question again, with a running score. Answers are shared with the chapter checks. */
export function Quiz() {
  const answers = useQuizAnswers()
  const answered = Object.keys(answers).length
  const right = QUIZ.filter((q, i) => answers[i] === q.correct).length

  return (
    <div className="flex max-w-[780px] flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="h3">All questions</h3>
        <span className="text-sm leading-none font-medium text-text-dim" aria-live="polite">
          {answered ? `${right} of ${QUIZ.length} correct` : `${QUIZ.length} questions`}
        </span>
      </div>
      <QuestionList indices={QUIZ.map((_, i) => i)} />
    </div>
  )
}
