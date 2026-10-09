import { cl, type PresetGen } from './builder'

/** Button tap → native module. */
export const genTap: PresetGen = (b, P) => {
  const { old, task, send } = b
  const step = cl(P.step, -99, 99, 1)
  const style = String(P.style).replace(/[^\w-]/g, '')
  b.uiPatches.push({ t: 0, pressed: true })
  let t = task('ui', 0, 2, 'touch', {
    ln: 6,
    cap: 'Your finger lands. The UI thread sees a press on the Pressable and has to ask JS what to do.',
  })
  t = old
    ? send(t, 'ui', 'js', 'touchEnd', '{"type":"topTouchEnd","target":12}', {
        cap: 'Old: the touch is serialized to JSON and waits in the bridge queue for the next batch.',
      })
    : send(t, 'ui', 'js', 'press', null, {
        sig: 'dispatchEvent("press", 12)',
        sched: true,
        cap: 'New: the touch becomes a C++ event scheduled onto the JS thread. JS reads it through JSI as a normal object, with no JSON.',
      })
  t = task('js', t, 1.5, 'onPress', {
    ln: 2,
    stack: ['onPress'],
    cap: 'React Native’s touch system in JS turns the touch into a press and calls your onPress.',
  })
  const tm = t
  t = task('js', t, 1, 'Haptics.impact', {
    ln: 3,
    stack: ['onPress', 'Haptics.impact'],
    cap: old
      ? 'Calling the module only queues another message. The vibration happens later, on the native side.'
      : 'Haptics is a Turbo Module. This first call creates it. impact() returns nothing, so native runs it on its own queue and JS moves on.',
  })
  if (old) {
    const a = send(t, 'js', 'native', 'Haptics.impact', '{"moduleID":41,"methodID":2,"args":["' + style + '"],"callID":3}')
    const e = task('native', a, 2.5, 'impact()', {
      cap: 'Native parses the JSON, finds module 41 and method 2 in its startup table, and vibrates.',
    })
    b.uiPatches.push({ t: e, buzz: true })
  } else {
    send(tm + 0.5, 'js', 'native', 'Haptics.impact', null, { sig: "Haptics.impact('" + style + "')" })
    b.modules.push({ t: tm + 0.5, n: 'Haptics', s: 'loading' }, { t: tm + 2, n: 'Haptics', s: 'ready' })
    const e = task('native', tm + 0.9, 2.5, 'load + impact()')
    b.uiPatches.push({ t: e, buzz: true })
  }
  t = task('js', t, 3, 'render Counter', {
    ln: 4,
    stack: ['setCount', 'Counter()'],
    cap: 'setCount adds ' + step + ', and React re-renders Counter.',
  })
  b.trees.push({ t, k: 'e' })
  if (old) {
    t = send(t, 'js', 'shadow', 'updateView', '["updateView",14,"RCTText",{"text":"' + step + '"}]')
    t = task('shadow', t, 2, 'layout (Yoga)', { cap: 'The Shadow thread recalculates layout for the changed text.' })
    b.trees.push({ t, k: 's' })
    t = send(t, 'shadow', 'ui', 'frames', '[{"tag":14,"frame":[16,40,120,24]}]', { d: 1.5 })
  } else {
    t = task('js', t, 1.2, 'commit + layout', {
      stack: ['commit'],
      cap: 'Fabric commits the new shadow tree in C++ and runs layout as part of that commit, off the UI thread.',
    })
    b.trees.push({ t, k: 's' })
    t = send(t, 'js', 'ui', 'mount', null, { sig: 'mount(1 mutation)' })
  }
  t = task('ui', t, 1.5, 'mount: set text', {
    cap: 'The UI thread updates the real text view. The next frame shows the new count.',
  })
  b.trees.push({ t, k: 'h' })
  b.uiPatches.push({ t, count: step, pressed: false })
  return { metric: { l: 'Tap → screen', v: t, u: 'ms' } }
}
