import { cl, type PresetGen } from './builder'
import { MODULE_POOL } from './presets'

/** App startup: eager module creation (old) vs lazy Turbo Modules (new). */
export const genStartup: PresetGen = (b, P) => {
  const { old, task, send } = b
  const N = Math.round(cl(P.modules, 2, 40, 12))
  const names = Array.from({ length: N }, (_, i) => MODULE_POOL[i] ?? 'Module' + (i + 1))
  b.uiPatches.push({ t: 0, screen: 'splash' })
  let t = task('ui', 0, 8, 'launch', { cap: 'The app process starts. The UI thread comes up first.' })
  if (old) {
    names.forEach((n, i) => {
      const d = 4 + ((i * 7) % 9)
      b.modules.push({ t, n, s: 'loading' }, { t: t + d, n, s: 'ready' })
      t = task(
        'native',
        t,
        d,
        n,
        i === 0
          ? { ln: 1, cap: 'Old: every linked native module is created now, before any of your JS runs, used or not.' }
          : { ln: 1 },
      )
    })
    t = task('js', t, 40, 'load bundle', { ln: 3, stack: ['(bundle)'], cap: 'Only now does the JS bundle load and run.' })
    t = task('js', t, 2, 'App()', { ln: 4, stack: ['App'] })
    b.trees.push({ t, k: 'e' })
    const s1 = send(t, 'js', 'native', 'Storage.getString', '{"moduleID":12,"methodID":0,"args":["theme"],"callID":1}', {
      cap: 'Even reading a saved setting is a message. The value comes back later, so the first render can’t use it.',
    })
    task('native', s1, 1, 'getString')
    t = send(
      t + 0.5,
      'js',
      'shadow',
      'createView ×6',
      '[["createView",2,"RCTView",{}],["createView",3,"RCTScrollView",{}],…]',
      { bytes: 1800 },
    )
    t = task('shadow', t, 4, 'layout (Yoga)')
    b.trees.push({ t, k: 's' })
    t = send(t, 'shadow', 'ui', 'frames', '[{"tag":2,"frame":[0,0,390,844]},…]', { d: 2 })
  } else {
    t = task('js', t, 40, 'load bundle', {
      ln: 3,
      stack: ['(bundle)'],
      cap: 'New: the JS bundle loads right away. No native module has been created yet.',
    })
    t = task('js', t, 1, 'App()', { ln: 4, stack: ['App'] })
    const lazy: [string, number, number, string][] = [
      ['Storage', 5, 5, "Storage.getString('theme')"],
      ['Analytics', 4, 6, "Analytics.track('open')"],
    ]
    lazy.forEach(([n, d, ln, sig], i) => {
      send(t, 'js', 'native', n, null, { sig })
      b.modules.push({ t, n, s: 'loading' }, { t: t + d, n, s: 'ready' })
      task(
        'native',
        t + 0.4,
        d,
        n + ' init',
        i === 0
          ? {
              cap: 'First call to Storage. This is the moment its Turbo Module is created, and JS gets the value back on the same line.',
            }
          : {},
      )
      task('js', t, d + 0.4, sig, { ln, stack: ['App', sig] })
      t += d + 0.4
    })
    t = task('js', t, 3, 'render + commit', { ln: 7, stack: ['App', 'commit'] })
    b.trees.push({ t, k: 'e' }, { t, k: 's' })
    t = send(t, 'js', 'ui', 'mount', null, { sig: 'mount(6 mutations)' })
  }
  t = task('ui', t, 5, 'mount views', {
    cap: old
      ? 'First screen is on. Everything before this point was startup.'
      : 'First screen is on. ' + (N - 2) + ' other modules still haven’t been created, and won’t be until something uses them.',
  })
  b.trees.push({ t, k: 'h' })
  b.uiPatches.push({ t, screen: 'home' })
  return { metric: { l: 'Startup time', v: t, u: 'ms' }, mods: names }
}
