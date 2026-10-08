import { cl, type PresetGen } from './builder'
import { FRAME_MS } from './types'

/** Animation with and without the native driver while JS is busy. */
export const genAnim: PresetGen = (b, P) => {
  const { old, task, send } = b
  const D = cl(P.duration, 50, 1000, 300)
  const B = cl(P.busy, 0, 600, 120)
  const nat = String(P.native).trim() === 'true'
  const bs = 40
  task('js', 0, 2, 'timing().start()', {
    ln: [1, 5],
    stack: ['Animated.timing', 'start'],
    cap: nat
      ? 'useNativeDriver is true: the whole animation is described once and handed to native.'
      : 'useNativeDriver is false: JS will compute every single frame of this animation itself.',
  })
  if (B)
    task('js', bs, B, 'JSON.parse(feed)', {
      ln: 7,
      stack: ['JSON.parse'],
      cap: 'Meanwhile JS starts parsing a big response. It will be busy for ' + B + ' ms.',
    })
  if (nat) {
    const s0 = old
      ? send(2, 'js', 'ui', 'startAnimation', '{"type":"timing","toValue":1,"duration":' + D + ',"nodeTag":7}')
      : send(2, 'js', 'ui', 'startAnimation', null, { sig: 'startAnimation(config)' })
    for (let ft = s0; ft <= s0 + D + 0.1; ft += FRAME_MS) {
      const pr = Math.min(1, (ft - s0) / D)
      const e = task(
        'ui',
        ft,
        1.2,
        'frame',
        ft === s0 ? { cap: 'The UI thread now runs every frame on its own. JS being busy doesn’t matter.' } : {},
      )
      b.uiPatches.push({ t: e, x: pr })
    }
    return { metric: { l: 'Longest freeze', v: 0, u: 'ms' } }
  }
  let jsF = 2
  let first = true
  let after = false
  for (let ft = 2 + FRAME_MS; ft <= 2 + D + FRAME_MS; ft += FRAME_MS) {
    const pr = Math.min(1, (ft - 2) / D)
    if (B && ft >= bs && ft < bs + B) {
      b.stalls.push({ from: ft, to: ft + FRAME_MS })
      after = true
      continue
    }
    const s = Math.max(ft, jsF)
    let cap: string | undefined
    if (first) cap = 'Every frame, JS computes the next position and sends it to the UI thread.'
    else if (after) {
      cap = 'JS was busy, so no frames were computed for ' + B + ' ms. The animation froze, then jumped ahead.'
      after = false
    }
    first = false
    jsF = task('js', s, 0.8, 'frame x', { stack: ['Animated', 'update'], cap })
    const a = old
      ? send(jsF, 'js', 'ui', 'updateProps', '{"tag":7,"props":{"transform":[{"translateX":' + Math.round(pr * 160) + '}]}}', {
          d: 2.5,
        })
      : send(jsF, 'js', 'ui', 'updateProps', null, { sig: 'updateProps(x: ' + Math.round(pr * 160) + ')' })
    const e = task('ui', a, 0.6, 'apply')
    b.uiPatches.push({ t: e, x: pr })
  }
  return { metric: { l: 'Longest freeze', v: Math.min(B, D), u: 'ms' } }
}
