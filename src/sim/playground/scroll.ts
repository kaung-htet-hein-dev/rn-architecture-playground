import { cl, type PresetGen } from './builder'
import { FRAME_MS } from './types'

/** onScroll with setState: both architectures merge stale events. */
export const genScroll: PresetGen = (b, P, rate) => {
  const { old, task, send } = b
  const W = cl(P.work, 0.5, 40, 6)
  const iv = 1000 / rate
  const evs: number[] = []
  for (let i = 0; i * iv < 300; i++) evs.push(4 + i * iv)
  evs.forEach((et, i) => {
    task(
      'ui',
      et,
      0.6,
      'scroll',
      i === 0 ? { cap: 'The user scrolls. Native moves the list by itself and sends scroll events to JS.' } : {},
    )
    b.uiPatches.push({ t: et, scroll: (i + 1) * 12 })
  })
  const lat = old ? 3.6 : 1
  let jsFree = 0
  let maxLag = 0
  let capM = false
  let idx = 0
  while (idx < evs.length) {
    const start = Math.max(jsFree, evs[idx] + lat)
    let j = idx
    while (j + 1 < evs.length && evs[j + 1] + lat <= start) j++
    const sk = j - idx
    const et = evs[j]
    const y = (j + 1) * 12
    let cap: string | undefined
    if (sk && !capM) {
      capM = true
      cap =
        'While JS was busy, ' +
        sk +
        ' newer scroll events arrived. Both architectures merge them into the latest one, so JS skips the old positions.'
    } else if (idx === 0)
      cap = old
        ? 'The event is serialized to JSON and sent with the next bridge batch. JS parses it and runs your handler: ' +
          W +
          ' ms of work plus about 1 ms of JSON.'
        : 'The event is scheduled onto the JS thread and read through JSI, with no JSON. Your handler runs: ' + W + ' ms of work.'
    if (old)
      b.pushMsg({
        t: et + 0.6,
        d: start - et - 0.6,
        from: 'ui',
        to: 'js',
        label: 'onScroll',
        payload: '{"type":"topScroll","target":7,"contentOffset":{"y":' + y + '}}',
        bytes: 160,
      })
    else send(et + 0.6, 'ui', 'js', 'onScroll', null, { sig: 'onScroll(y: ' + y + ')', sched: true })
    jsFree = task('js', start, W + (old ? 1 : 0), sk ? 'onScroll (+' + sk + ' merged)' : 'onScroll', {
      ln: [3, 4],
      stack: ['onScroll', 'setY', 'formatHeader'],
      cap,
    })
    const a = old
      ? send(jsFree, 'js', 'ui', 'updateView', '["updateView",31,{"text":"y = ' + y + '"}]', { d: 2 })
      : send(jsFree, 'js', 'ui', 'mount', null, { sig: 'mount(header text)' })
    const e = task('ui', a, 0.5, 'apply')
    b.uiPatches.push({ t: e, shown: y })
    for (let k = idx; k <= j; k++) {
      if (e - evs[k] > FRAME_MS) b.stalls.push({ from: evs[k] + FRAME_MS, to: e })
      maxLag = Math.max(maxLag, e - evs[k])
    }
    idx = j + 1
  }
  return { metric: { l: 'Worst header lag', v: maxLag, u: 'ms' } }
}
