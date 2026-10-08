import { cl, type PresetGen } from './builder'
import { FRAME_MS } from './types'

/** Measuring layout: async round trip (old) vs synchronous read before mount (new). */
export const genMeasure: PresetGen = (b, P) => {
  const { old, task, send } = b
  const G = cl(P.gap, 0, 80, 8)
  const Y = 194 + G
  let t = task('js', 0, 4, 'render Tooltip', {
    ln: 6,
    stack: ['Tooltip'],
    cap: 'React renders the tooltip with top: 0, because nobody knows the button’s position yet.',
  })
  b.trees.push({ t, k: 'e' })
  if (old) {
    t = send(t, 'js', 'shadow', 'createView', '[["createView",40,"RCTView",{"top":0}]]')
    t = task('shadow', t, 3, 'layout (Yoga)')
    b.trees.push({ t, k: 's' })
    t = send(t, 'shadow', 'ui', 'frames', '[{"tag":40,"frame":[36,0,148,30]}]', { d: 2 })
    const m1 = task('ui', t, 1.5, 'mount (top: 0)', {
      cap: 'Old: the tooltip reaches the screen before JS can measure anything, so for now it sits at the top.',
    })
    b.trees.push({ t: m1, k: 'h' })
    b.uiPatches.push({ t: m1, tip: true, tipY: 0 })
    t = task('js', m1 + 0.5, 1, 'measure()', {
      ln: [2, 3],
      stack: ['useLayoutEffect', 'measure'],
      cap: 'The layout effect calls measure(). Over the bridge, that’s a request and a reply.',
    })
    t = send(t, 'js', 'ui', 'measure', '["measure",12,{"callbackId":4}]')
    t = task('ui', t, 1, 'measure #12')
    t = send(t, 'ui', 'js', 'result', '{"callbackId":4,"args":[20,150,180,44]}')
    t = task('js', t, 3, 'setTop → render', { ln: 4, stack: ['measure callback', 'setTop', 'Tooltip'] })
    b.trees.push({ t, k: 'e' })
    t = send(t, 'js', 'shadow', 'updateView', '["updateView",40,{"top":' + Y + '}]')
    t = task('shadow', t, 2, 'layout')
    b.trees.push({ t, k: 's' })
    t = send(t, 'shadow', 'ui', 'frames', '[{"tag":40,"frame":[36,' + Y + ',148,30]}]', { d: 2 })
    t = task('ui', t, 1.5, 'move tooltip', {
      cap: 'The tooltip jumps into place several frames later. That jump is the flicker users notice.',
    })
    b.trees.push({ t, k: 'h' })
    b.uiPatches.push({ t, tipY: Y })
    b.stalls.push({ from: m1, to: t })
    return { metric: { l: 'Frames in wrong place', v: Math.ceil((t - m1) / FRAME_MS), u: 'frames' } }
  }
  t = task('js', t, 1.5, 'commit + layout', {
    stack: ['commit'],
    cap: 'New: Fabric commits the tree and runs layout in C++, before anything is mounted.',
  })
  b.trees.push({ t, k: 's' })
  send(t, 'js', 'shadow', 'measure', null, { sig: 'measure(12) → {y: 150, h: 44}' })
  t = task('js', t, 0.6, 'measure()', {
    ln: [2, 3],
    stack: ['useLayoutEffect', 'measure'],
    cap: 'useLayoutEffect runs before mount. measure() reads the C++ shadow tree synchronously through JSI.',
  })
  t = task('js', t, 3, 'setTop → render', { ln: 4, stack: ['setTop', 'Tooltip'] })
  b.trees.push({ t, k: 'e' })
  t = task('js', t, 1.2, 'commit')
  b.trees.push({ t, k: 's' })
  t = send(t, 'js', 'ui', 'mount', null, { sig: 'mount(1 view)' })
  t = task('ui', t, 1.5, 'mount (correct top)', { cap: 'The tooltip is mounted once, already in the right place. No flicker.' })
  b.trees.push({ t, k: 'h' })
  b.uiPatches.push({ t, tip: true, tipY: Y })
  return { metric: { l: 'Frames in wrong place', v: 0, u: 'frames' } }
}
