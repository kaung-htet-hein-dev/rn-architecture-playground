import { useSyncExternalStore } from "react";

/** Chosen option per question index, shared by the chapter checks and the review. */
let answers: Readonly<Record<number, number>> = {};
const listeners = new Set<() => void>();

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

export function answerQuiz(question: number, option: number) {
  answers = { ...answers, [question]: option };
  listeners.forEach((l) => l());
}

export function useQuizAnswers() {
  return useSyncExternalStore(subscribe, () => answers, () => answers);
}
