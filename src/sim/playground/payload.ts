import { cl, type PresetGen } from './builder'

/** Large payload: JSON string over the bridge (old) vs shared ArrayBuffer through JSI (new). */
export const genPayload: PresetGen = (b, P) => {
  const { old, task, send } = b
  const R = Math.round(cl(P.rows, 1, 50000, 2000))
  const bytes = R * 140
  const kb = Math.round(bytes / 1024)
  b.uiPatches.push({ t: 0, status: 'Saving ' + R.toLocaleString('en-US') + ' rows…' })
  let t = task('js', 0, 2, 'makeRows', {
    ln: 0,
    stack: ['makeRows'],
    cap: 'You build ' + R.toLocaleString('en-US') + ' rows, about ' + kb + ' KB of data.',
  })
  if (old) {
    t = task('js', t, bytes / 15000, 'JSON.stringify', {
      ln: 1,
      stack: ['saveRows', 'JSON.stringify'],
      cap: 'Old: all ' + kb + ' KB become one big JSON string, on the JS thread.',
    })
    t = send(
      t,
      'js',
      'native',
      'Db.saveRows',
      '{"module":"Db","method":"saveRows","args":[[{"id":1,"title":"Row 1","qty":3},{"id":2,…}, … ' + R + ' rows]]}',
      { bytes, cap: 'The whole string crosses the bridge as one message.' },
    )
    t = task('native', t, bytes / 15000, 'JSON parse', {
      cap: 'Native parses the entire string back into objects before it can save anything.',
    })
    t = task('native', t, 6, 'write to disk')
    t = send(t, 'native', 'js', 'resolve', '{"callId":9,"result":true}')
  } else {
    t = task('js', t, bytes / 250000 + 0.5, 'pack ArrayBuffer', {
      ln: 1,
      stack: ['saveRows', 'pack'],
      cap: 'New: the rows are packed into an ArrayBuffer, raw bytes that JS and C++ can both read.',
    })
    send(t, 'js', 'native', 'Db.saveRows', null, { sig: 'Db.saveRows(buffer)', ref: bytes })
    b.modules.push({ t, n: 'Db', s: 'loading' }, { t: t + 1, n: 'Db', s: 'ready' })
    t = task('native', t + 0.4, bytes / 400000 + 1.5, 'read buffer', {
      cap: 'Native reads the same memory JS wrote. Nothing is copied into text.',
    })
    t = task('native', t, 6, 'write to disk')
    t = send(t, 'native', 'js', 'resolve', null, { sig: 'resolve(true)' })
  }
  t = task('js', t, 1, 'showToast', {
    ln: 2,
    stack: ['showToast'],
    cap: old ? 'Saved. Most of that time went into writing and reading JSON.' : 'Saved. What’s left is mostly the disk write itself.',
  })
  b.uiPatches.push({ t, status: 'Saved ✓' })
  return { metric: { l: 'Time to saved', v: t, u: 'ms' } }
}
