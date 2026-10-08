import { cl, type PresetGen } from './builder'

/** Heavy JS loop: taps wait in both architectures. */
export const genHeavy: PresetGen = (b, P, rate) => {
  const { old, task, send } = b
  const N = cl(P.iterations, 0, 1e10, 5e7)
  const B = Math.max(2, Math.min(800, N / 250000))
  b.uiPatches.push({ t: 0, building: true, sent: 0, done: 0 })
  task('ui', 0, 1, 'tap: Build', { cap: 'You tap “Build report”.' })
  const a = old
    ? send(1, 'ui', 'js', 'press', '{"type":"press","target":3}')
    : send(1, 'ui', 'js', 'press', null, { sig: 'dispatchEvent(press, 3)', sched: true })
  const loopEnd = task('js', a, B, 'onBuild: for loop', {
    ln: [1, 4],
    stack: ['onBuild', 'for (…)'],
    cap:
      'The loop runs ' +
      Math.round(N).toLocaleString('en-US') +
      ' times. That keeps the JS thread busy for ' +
      Math.round(B) +
      ' ms, and nothing else in JS can run.',
  })
  const iv = 1000 / rate
  const taps: number[] = []
  for (let tt = a + 15; tt < loopEnd - 2 && taps.length < 12; tt += iv) taps.push(tt)
  taps.forEach((tt, i) => {
    task(
      'ui',
      tt,
      0.8,
      'tap',
      i === 0 ? { cap: 'The user taps “Tap me”. The UI thread is fine: it registers the tap right away.' } : {},
    )
    b.uiPatches.push({ t: tt, sent: i + 1 })
    if (old)
      b.pushMsg({
        t: tt + 0.8,
        d: loopEnd - tt - 0.8,
        from: 'ui',
        to: 'js',
        label: 'press',
        payload: '{"type":"press","target":5}',
        bytes: 28,
        cap: i === 1 ? 'The tap waits in the bridge queue. JS can’t take it until the loop ends.' : undefined,
      })
    else {
      send(tt + 0.8, 'ui', 'js', 'press', null, {
        sig: 'dispatchEvent(press, 5)',
        sched: true,
        cap:
          i === 1
            ? 'New: the event is scheduled onto the JS thread without JSON, but JS is still inside the loop. It waits its turn.'
            : undefined,
      })
      b.queue.push({ t: tt + 1.2, u: loopEnd, label: 'onTap' })
    }
  })
  let t = loopEnd
  let worst = 0
  taps.forEach((tt, i) => {
    worst = Math.max(worst, t - tt)
    t = task('js', t, 0.6, 'onTap', {
      ln: 6,
      stack: ['onTap', 'setTaps'],
      cap: i === 0 ? 'The loop is done. Only now do the waiting taps run, one after another.' : undefined,
    })
  })
  t = task('js', t, 2, 'render', { stack: ['Report()'] })
  b.trees.push({ t, k: 'e' })
  t = old
    ? send(t, 'js', 'ui', 'updateView', '["updateView",8,{"text":"Taps: ' + taps.length + '"}]', { d: 2 })
    : send(t, 'js', 'ui', 'mount', null, { sig: 'mount(text)' })
  t = task('ui', t, 1, 'apply', {
    cap:
      'Same story in both architectures: taps waited up to ' +
      Math.round(worst) +
      ' ms. Move heavy work off the JS thread, or split it into chunks.',
  })
  b.trees.push({ t, k: 'h' })
  b.uiPatches.push({ t, done: taps.length, building: false })
  return { metric: { l: 'Longest tap wait', v: worst, u: 'ms' } }
}
