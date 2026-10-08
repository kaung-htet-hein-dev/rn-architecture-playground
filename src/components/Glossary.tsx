const G: [string, string, string][] = [
  ['Thread', 'A single line of work. It does one thing at a time, in order.', '#e7eaee'],
  ['JS thread', 'Where your React code, hooks and handlers run.', '#b39dff'],
  ['UI thread', 'The app’s main thread. Draws the screen and receives touches.', '#f291c4'],
  ['Shadow thread', 'In the old architecture, the thread that ran layout on its own copy of the tree.', '#79d49c'],
  ['Bridge', 'The old connection between JS and native. Carries batched, asynchronous JSON messages.', '#f2b35b'],
  ['Serialize', 'Turn an object into text, like JSON, so it can be sent. Parsing turns it back.', '#f2b35b'],
  ['Batch', 'A group of messages sent together.', '#f2b35b'],
  ['Asynchronous', 'You send a request and carry on; the answer arrives later.', '#e7eaee'],
  ['Frame', 'One picture on screen. At 60 per second, each gets 16.6 ms.', '#e7eaee'],
  ['Dropped frame', 'A frame that wasn’t ready in time. The user sees a stutter.', '#f0694f'],
  ['Native module', 'Platform code (Swift, Kotlin, Java, Objective-C) that JS can call.', '#9fb0c3'],
  ['C++', 'A fast, lower-level language that runs on iOS and Android. The New Architecture’s shared core.', '#5fd3e6'],
  ['JSI', 'JavaScript Interface. Lets JS hold references to C++ objects and call them directly.', '#5fd3e6'],
  ['Host object', 'A C++ object JS can use like a normal object.', '#5fd3e6'],
  ['Turbo Module', 'A native module built on JSI that loads the first time it’s used.', '#5fd3e6'],
  ['Codegen', 'A build-time tool that turns a TypeScript spec into typed native code.', '#5fd3e6'],
  ['Fabric', 'The New Architecture’s renderer.', '#5fd3e6'],
  ['Yoga', 'The layout engine that turns flexbox styles into positions and sizes.', '#79d49c'],
  ['Shadow tree', 'A C++ copy of your UI with layout information.', '#5fd3e6'],
  ['Render · Commit · Mount', 'Fabric’s phases: build the tree, compute layout and seal it, apply changes to views.', '#5fd3e6'],
  ['Host view', 'A real platform view, like UIView on iOS or View on Android.', '#f291c4'],
  ['Interop layer', 'Lets old-style modules and components run in the New Architecture.', '#5fd3e6'],
]

export function Glossary() {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="h3">Glossary</h3>
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-x-10">
        {G.map(([t, d, c]) => (
          <div key={t} className="flex flex-col gap-1 border-b border-line-soft py-3.5">
            <dt className="font-mono text-sm leading-[1.3] font-semibold" style={{ color: c }}>
              {t}
            </dt>
            <dd className="m-0 text-[15px] leading-[1.55] text-text-muted">{d}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
