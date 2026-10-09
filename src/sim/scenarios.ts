import { C, type Mode } from "./colors";

/** Typed port of SimPanel.dc.html `static LN` / `static LIB`. Copy is verbatim. */

export type LaneId =
  | "js"
  | "bridge"
  | "jsi"
  | "shadow"
  | "ui"
  | "native"
  | "core"
  | "spec"
  | "cg"
  | "out";

export interface LaneDef {
  name: string;
  sub: string;
  c: string;
  k?: "bridge" | "jsi";
  narrow?: boolean;
}

/** [depth, label, highlightWhenUpdated?] */
export type TreeNode = [number, string, 1?];

export interface Step {
  /** active lane */
  l: LaneId;
  /** active code line(s), 0-based; [from, to] inclusive */
  ln?: number | [number, number];
  /** activity text */
  a: string;
  /** mentor caption */
  c: string;
  /** packet: [from, to, label, kind] — kind 'ref' = JSI line, default JSON packet */
  p?: [LaneId, LaneId, string, "ref"?];
  /** bridge queue after this step */
  q?: string[];
  /** screen readout after this step */
  ui?: string;
  /** phase index (Fabric) */
  ph?: number;
  /** tree updates */
  tr?: Partial<Record<"e" | "s" | "h", TreeNode[]>>;
  /** runtime error */
  err?: boolean;
  /** custom duration in seconds */
  d?: number;
}

export interface Scenario {
  title: string;
  file: string;
  lanes: LaneId[];
  screen?: boolean;
  ui0?: string;
  intro: string;
  code: string[];
  steps: Step[];
  phases?: string[];
  trees?: boolean;
  treeNames?: [string, string, string];
}

export type ScenarioId = "tap" | "map" | "jsi" | "codegen" | "fabric";

export const LN: Record<LaneId, LaneDef> = {
  js: { name: "JS thread", sub: "runs your React code", c: C.js },
  bridge: {
    name: "Bridge",
    sub: "queue of JSON text",
    c: C.old,
    k: "bridge",
    narrow: true
  },
  jsi: {
    name: "JSI",
    sub: "direct C++ calls",
    c: C.new,
    k: "jsi",
    narrow: true
  },
  shadow: { name: "Shadow thread", sub: "layout with Yoga", c: C.shadow },
  ui: { name: "UI thread", sub: "draws, gets touches", c: C.ui },
  native: { name: "Native module", sub: "platform code", c: C.native },
  core: { name: "C++ core", sub: "Fabric, shared tree", c: C.new },
  spec: { name: "TS spec", sub: "you write this", c: C.muted },
  cg: {
    name: "Codegen",
    sub: "runs at build time",
    c: C.new,
    narrow: true
  },
  out: { name: "Native interface", sub: "generated for you", c: C.native }
};

export const LIB: Record<ScenarioId, Record<Mode, Scenario>> = {
  tap: {
    old: {
      title: "one tap · old architecture",
      file: "Counter.tsx",
      lanes: ["js", "bridge", "ui"],
      screen: true,
      ui0: "1",
      intro:
        "Press Play. We will follow a single press of this counter button, one stop at a time. Use Step to move at your own pace.",
      code: [
        "function Counter() {",
        "  const [count, setCount] = useState(1);",
        "  return (",
        "    <Pressable onPress={() => setCount(c => c + 1)}>",
        "      <Text>{count}</Text>",
        "    </Pressable>",
        "  );",
        "}"
      ],
      steps: [
        {
          l: "ui",
          ln: 3,
          a: "Touch on view #12",
          c: "Your finger touches the screen. The UI thread owns the screen, so it gets the touch first: a press on the native view with id 12. It doesn’t know about onPress. It reports the raw touch to JavaScript, where React Native decides whether it counts as a press."
        },
        {
          l: "bridge",
          a: "Serialize to JSON",
          p: ["ui", "bridge", '{"type":"topTouchEnd","target":12}'],
          q: ["touchEnd #12"],
          c: "The bridge only carries text. So the touch is serialized: turned into a JSON string. It joins a queue of other messages waiting to cross."
        },
        {
          l: "js",
          a: "Parse JSON",
          p: ["bridge", "js", '{"type":"topTouchEnd","target":12}'],
          q: [],
          c: "The bridge sends its queue over in a batch, a group of messages sent together. The JS thread parses the string back into an object."
        },
        {
          l: "js",
          ln: 3,
          a: "onPress → setCount(2)",
          c: "React Native’s touch system, which runs in JS, sees a finished press on your Pressable and calls onPress. onPress calls setCount, asking React to change the state from 1 to 2."
        },
        {
          l: "js",
          ln: 4,
          a: 'Render: "1" → "2"',
          c: "React runs Counter again and compares the result with the last one. Only one thing changed: the Text now says 2."
        },
        {
          l: "bridge",
          a: "Serialize update",
          p: ["js", "bridge", '["updateView",14,{"text":"2"}]'],
          q: ["updateView #14"],
          c: "That change is serialized into another JSON message and queued on the bridge."
        },
        {
          l: "ui",
          a: "Parse → update view #14",
          p: ["bridge", "ui", '["updateView",14,{"text":"2"}]'],
          q: [],
          c: "Native parses the message. It passes through a third thread first, the Shadow thread, which works out layout (chapter 2). Then the UI thread updates the real text view."
        },
        {
          l: "ui",
          a: 'Frame shows "2"',
          ui: "2",
          c: "On the next frame the screen shows 2. One tap cost two trips React Native Internal and four rounds of JSON writing and reading."
        }
      ]
    },
    new: {
      title: "one tap · new architecture",
      file: "Counter.tsx",
      lanes: ["js", "jsi", "ui"],
      screen: true,
      ui0: "1",
      intro:
        "Same button, same code, New Architecture. Press Play and count the stops.",
      code: [
        "function Counter() {",
        "  const [count, setCount] = useState(1);",
        "  return (",
        "    <Pressable onPress={() => setCount(c => c + 1)}>",
        "      <Text>{count}</Text>",
        "    </Pressable>",
        "  );",
        "}"
      ],
      steps: [
        {
          l: "ui",
          ln: 3,
          a: "Touch on view #12",
          c: "Your finger touches the screen. The UI thread gets the touch on view 12 and needs JavaScript to decide what happens."
        },
        {
          l: "jsi",
          a: "C++ event, no JSON",
          p: ["ui", "js", "touchEnd → JS thread", "ref"],
          c: "There is no bridge here. The touch becomes a C++ event that is scheduled onto the JS thread, and JS reads it through JSI as a normal object. It still waits its turn on the JS thread, but nothing is turned into text or batched with other messages."
        },
        {
          l: "js",
          ln: 3,
          a: "onPress → setCount(2)",
          c: "React Native’s touch system turns the touch into a press and calls onPress, which calls setCount. This part is exactly the same as before: your code did not change."
        },
        {
          l: "js",
          ln: 4,
          a: "Render → C++ tree",
          c: "React runs Counter again. Fabric, the new renderer, writes the result into a tree that lives in C++ memory, which the UI side can read as well."
        },
        {
          l: "jsi",
          a: "Hand over the tree",
          p: ["js", "ui", "commit(tree)", "ref"],
          c: "React commits the new tree, and Fabric schedules the mount on the UI thread. It hands over a reference to the tree in C++, not a JSON copy of it."
        },
        {
          l: "ui",
          a: 'Frame shows "2"',
          ui: "2",
          c: "The UI thread applies the change and the next frame shows 2. Same result, and no JSON anywhere on the way."
        }
      ]
    }
  },
  map: {
    old: {
      title: "the old map",
      file: "App.tsx",
      lanes: ["js", "bridge", "shadow", "ui"],
      intro:
        "Press Play for a tour of who does what when your app starts and draws its first screen.",
      code: [
        "AppRegistry.registerComponent('App', () => App);",
        "",
        "function App() {",
        "  const [items, setItems] = useState([]);",
        "  useEffect(() => { api.load().then(setItems); }, []);",
        "  return <FlatList data={items} renderItem={Row} />;",
        "}"
      ],
      steps: [
        {
          l: "ui",
          a: "Start app, start JS thread",
          c: "The UI thread is the app’s main thread. It starts first and sets up React Native, which starts the JS thread and hands it your JS bundle: all of your code, packed into one file."
        },
        {
          l: "js",
          ln: 0,
          a: "Run your code",
          c: "The JS thread loads and runs that bundle. Every component, hook and handler you write runs here, one thing at a time."
        },
        {
          l: "js",
          ln: 5,
          a: "Render App",
          c: "React renders App and works out which views should exist."
        },
        {
          l: "bridge",
          a: "Batch of view commands",
          p: ["js", "bridge", '[["createView",2,"RCTView"],…]'],
          q: ["createView #2", "createView #3", "setChildren #1"],
          c: "React’s output can’t cross as objects. It becomes a batch of JSON commands: create this view, put it inside that one."
        },
        {
          l: "shadow",
          a: "Yoga: compute layout",
          p: ["bridge", "shadow", '[["createView",2,…]]'],
          q: [],
          c: "The Shadow thread reads the batch and runs Yoga, a layout engine. Yoga turns your flexbox styles into exact positions and sizes."
        },
        {
          l: "ui",
          a: "Create real views",
          p: ["shadow", "ui", "x, y, width, height"],
          c: "The UI thread creates the real platform views at those positions and draws them."
        },
        {
          l: "bridge",
          a: "Events go back as JSON",
          p: ["ui", "bridge", '{"type":"scroll","y":120}'],
          q: ["scroll y=120"],
          c: "When the user scrolls or taps, events travel back over the same bridge. Everything between JS and native is asynchronous: sent now, handled later."
        }
      ]
    },
    new: {
      title: "the new map",
      file: "App.tsx",
      lanes: ["js", "jsi", "shadow", "ui"],
      intro:
        "Same app, New Architecture. The three threads are still here. Watch what connects them.",
      code: [
        "AppRegistry.registerComponent('App', () => App);",
        "",
        "function App() {",
        "  const [items, setItems] = useState([]);",
        "  useEffect(() => { api.load().then(setItems); }, []);",
        "  return <FlatList data={items} renderItem={Row} />;",
        "}"
      ],
      steps: [
        {
          l: "ui",
          a: "Start app, start JS thread",
          c: "The UI thread starts first, and the JS thread loads your bundle, just like before."
        },
        {
          l: "js",
          ln: 0,
          a: "Run your code",
          c: "The JS thread runs your code. Still one thing at a time: that never changed."
        },
        { l: "js", ln: 5, a: "Render App", c: "React renders App." },
        {
          l: "jsi",
          a: "Tree built in C++",
          p: ["js", "shadow", "shadow tree (C++)", "ref"],
          c: "Instead of JSON commands, React’s output becomes a shadow tree in C++. Through JSI, every thread can reach it."
        },
        {
          l: "shadow",
          a: "Yoga: compute layout",
          c: "Layout still uses Yoga, now in C++, as part of committing the tree. It runs off the UI thread, and can run synchronously when an urgent update or a measurement needs the answer right away."
        },
        {
          l: "ui",
          a: "Create real views",
          p: ["shadow", "ui", "tree ref", "ref"],
          c: "The UI thread reads the finished tree and creates the real views."
        },
        {
          l: "jsi",
          a: "Events without JSON",
          p: ["ui", "js", "onScroll(y: 120)", "ref"],
          c: "Events come back as C++ events scheduled onto the JS thread, with no JSON. And when JS needs an answer from native right now, a synchronous call can return it on the same line."
        }
      ]
    }
  },
  jsi: {
    old: {
      title: "calling a native module · bridge",
      file: "Battery.tsx",
      lanes: ["js", "bridge", "native"],
      intro:
        "You want the battery level. Press Play and count how many times data changes form on the way.",
      code: [
        "// Old: ask through the bridge",
        "const level = await NativeModules.Battery.getLevel();",
        "setBattery(level);"
      ],
      steps: [
        {
          l: "js",
          ln: 1,
          a: "getLevel() → Promise",
          c: "You call the module. Nothing native happens yet. The call hands you a Promise: a placeholder for a value that will arrive later."
        },
        {
          l: "bridge",
          a: "Serialize the call",
          p: [
            "js",
            "bridge",
            '{"moduleID":23,"methodID":4,"args":[],"callID":7}'
          ],
          q: ["call #7"],
          c: "The call is written into JSON: a number for the module, a number for the method, the arguments, and an id so the reply can find its Promise. Then it is queued."
        },
        {
          l: "native",
          a: "Parse, look up module #23",
          p: ["bridge", "native", '{"moduleID":23,…}'],
          q: [],
          c: "Native parses the JSON, finds module 23 and method 4 in a table it built at startup, and calls the method."
        },
        {
          l: "native",
          a: "Read battery: 0.82",
          c: "The actual work is tiny: read one number."
        },
        {
          l: "bridge",
          a: "Serialize the reply",
          p: ["native", "bridge", '{"callID":7,"result":0.82}'],
          q: ["reply #7"],
          c: "The answer makes the same trip back, as JSON."
        },
        {
          l: "js",
          ln: 2,
          a: "Promise resolves → setBattery",
          p: ["bridge", "js", '{"callID":7,"result":0.82}'],
          q: [],
          c: "On a later turn of the JS thread the Promise resolves and your next line runs. Four rounds of writing and reading JSON, for one number."
        }
      ]
    },
    new: {
      title: "calling a native module · JSI",
      file: "Battery.tsx",
      lanes: ["js", "jsi", "native"],
      intro:
        "Same question, New Architecture. JS already holds the module. Press Play.",
      code: [
        "// New: call the host object directly",
        "const level = Battery.getLevel();",
        "setBattery(level);"
      ],
      steps: [
        {
          l: "js",
          ln: 0,
          a: "Holds Battery (host object)",
          c: "When the module was first used, JS received a host object: it looks like a normal JS object, but its methods are C++ functions. JS keeps a reference to it, like keeping a phone number instead of mailing a letter each time."
        },
        {
          l: "jsi",
          ln: 1,
          a: "Direct C++ call",
          p: ["js", "native", "Battery.getLevel()", "ref"],
          c: "Calling getLevel runs the C++ function directly through JSI, right here on the JS thread. There is no JSON, queue or lookup table in between, because JS already holds the function."
        },
        {
          l: "native",
          a: "Read battery: 0.82",
          c: "Native reads the value and returns it as a plain number."
        },
        {
          l: "js",
          ln: 2,
          a: "level = 0.82, same line",
          p: ["native", "js", "0.82", "ref"],
          c: "The number comes straight back, so the very next line can use it. Slow work can still be async, but now you get to choose."
        }
      ]
    }
  },
  codegen: {
    old: {
      title: "types React Native Internal · old",
      file: "Battery (JS + Obj-C)",
      lanes: ["js", "bridge", "native"],
      intro:
        "In the old architecture, JS and native are written separately and nothing checks that they agree. Press Play to see when a mistake is found.",
      code: [
        "// JS side: nothing describes the native API",
        "const level = await NativeModules.Battery.getLevel(true);",
        "",
        "// Objective-C side, written by hand",
        "RCT_EXPORT_METHOD(getLevel:(RCTPromiseResolveBlock)resolve",
        "                  rejecter:(RCTPromiseRejectBlock)reject)"
      ],
      steps: [
        {
          l: "js",
          ln: 1,
          a: "getLevel(true)",
          c: "Here JS passes an argument the native method doesn’t take. TypeScript can’t warn you: NativeModules.Battery is typed as “anything”."
        },
        {
          l: "bridge",
          a: "Carry it anyway",
          p: ["js", "bridge", '{"method":"getLevel","args":[true]}'],
          q: ["getLevel(true)"],
          c: "The bridge doesn’t know about types either. It just carries the JSON."
        },
        {
          l: "native",
          ln: [4, 5],
          a: "Argument mismatch!",
          p: ["bridge", "native", '{"args":[true]}'],
          q: [],
          err: true,
          c: "Only now, while the app is running on a user’s phone, does native notice the mismatch. The result is a red error screen in development or a crash in production."
        }
      ]
    },
    new: {
      title: "codegen · spec → native",
      file: "NativeBattery.ts",
      lanes: ["spec", "cg", "out"],
      intro:
        "Codegen runs when you build the app. Press Play to watch a TypeScript spec become native code.",
      code: [
        "import type { TurboModule } from 'react-native';",
        "import { TurboModuleRegistry } from 'react-native';",
        "",
        "export interface Spec extends TurboModule {",
        "  getLevel(): number;",
        "  setLowPowerMode(enabled: boolean): void;",
        "  getModel(): Promise<string>;",
        "}",
        "",
        "export default TurboModuleRegistry.getEnforcing<Spec>('Battery');"
      ],
      steps: [
        {
          l: "spec",
          ln: [3, 7],
          a: "interface Spec",
          c: "You write a spec: a TypeScript interface that lists every method and its types. Both the JS side and the native side are built from this one file."
        },
        {
          l: "cg",
          ln: 4,
          a: "number → double",
          p: ["spec", "cg", "getLevel(): number"],
          c: "Codegen reads each method. Every JS type maps to one native type. A number becomes a double, the native word for a decimal number."
        },
        {
          l: "out",
          a: "double getLevel(rt)",
          p: ["cg", "out", "double getLevel(…)"],
          c: "It writes the matching C++ method. You never edit this file by hand."
        },
        {
          l: "cg",
          ln: 5,
          a: "boolean → bool",
          p: ["spec", "cg", "setLowPowerMode(boolean)"],
          c: "A boolean becomes a bool. A void return means native sends nothing back."
        },
        {
          l: "out",
          a: "void setLowPowerMode(rt, bool)",
          p: ["cg", "out", "void setLowPowerMode(…)"],
          c: "Another method is added to the generated interface."
        },
        {
          l: "cg",
          ln: 6,
          a: "Promise<string> → Promise",
          p: ["spec", "cg", "getModel(): Promise<string>"],
          c: "A Promise becomes an async method that native resolves later with a string."
        },
        {
          l: "out",
          ln: 9,
          a: "class NativeBatterySpecJSI",
          p: ["cg", "out", "NativeBatterySpecJSI"],
          c: "The result is an abstract class: a list of methods your Swift, Kotlin or C++ must provide. If they don’t match, the compiler flags it at build time, before any user sees it."
        }
      ]
    }
  },
  fabric: {
    old: {
      title: "rendering · old renderer",
      file: "Profile.tsx",
      lanes: ["js", "bridge", "shadow", "ui"],
      phases: ["Render", "Commit", "Mount"],
      trees: true,
      treeNames: [
        "Element tree · JS",
        "Shadow tree · Shadow thread",
        "Host views · UI"
      ],
      intro:
        "Before we meet Fabric, here is how the old renderer turned a component into views. Press Play or Step.",
      code: [
        "function Profile({ user }) {",
        "  return (",
        "    <View style={styles.card}>",
        "      <Image source={user.avatar} />",
        "      <Text>{user.name}</Text>",
        "    </View>",
        "  );",
        "}"
      ],
      steps: [
        {
          l: "js",
          ph: 0,
          ln: [2, 5],
          a: "Run Profile()",
          tr: {
            e: [
              [0, "<View card>", 1],
              [1, "<Image>", 1],
              [1, '<Text> "Ada"', 1]
            ]
          },
          c: "Render: React runs your component and gets an element tree: plain JS objects describing what you want on screen."
        },
        {
          l: "bridge",
          ph: 0,
          a: "JSON view commands",
          p: ["js", "bridge", '[["createView",21,"RCTView"],…]'],
          q: ["createView #21", "createView #22", "createView #23"],
          c: "The element tree can’t cross. It becomes JSON commands, queued on the bridge."
        },
        {
          l: "shadow",
          ph: 1,
          a: "Rebuild tree, run Yoga",
          p: ["bridge", "shadow", '[["createView",…]]'],
          q: [],
          tr: {
            s: [
              [0, "View 0,0 320×88", 1],
              [1, "Image 16,16 56×56", 1],
              [1, "Text 88,32 200×24", 1]
            ]
          },
          c: "Commit: the Shadow thread builds its own copy of the tree and runs layout. JS can’t see this copy. If JS wants a size, it must ask over the bridge and wait."
        },
        {
          l: "ui",
          ph: 2,
          a: "Create views",
          p: ["shadow", "ui", "3 views + frames"],
          tr: {
            h: [
              [0, "View #21", 1],
              [1, "Image #22", 1],
              [1, "Text #23", 1]
            ]
          },
          c: "Mount: the UI thread creates the real views. Three separate copies of your UI now exist, in three places, kept in sync by messages."
        }
      ]
    },
    new: {
      title: "rendering · fabric",
      file: "Profile.tsx",
      lanes: ["js", "core", "ui"],
      phases: ["Render", "Commit", "Mount"],
      trees: true,
      treeNames: ["Element tree · JS", "Shadow tree · C++", "Host views · UI"],
      intro:
        "Fabric renders in three phases: render, commit, mount. Press Step to go through them one at a time.",
      code: [
        "function Profile({ user }) {",
        "  return (",
        "    <View style={styles.card}>",
        "      <Image source={user.avatar} />",
        "      <Text>{user.name}</Text>",
        "    </View>",
        "  );",
        "}"
      ],
      steps: [
        {
          l: "js",
          ph: 0,
          ln: [2, 5],
          a: "Run Profile()",
          tr: {
            e: [
              [0, "<View card>", 1],
              [1, "<Image>", 1],
              [1, '<Text> "Ada"', 1]
            ]
          },
          c: "Render: React runs your component and gets an element tree, plain JS objects describing what you want."
        },
        {
          l: "core",
          ph: 0,
          a: "Create shadow nodes",
          p: ["js", "core", "createNode × 3", "ref"],
          tr: {
            s: [
              [0, "ViewShadowNode", 1],
              [1, "ImageShadowNode", 1],
              [1, "ParagraphShadowNode", 1]
            ]
          },
          c: "Fabric turns each element into a shadow node in C++ right away, through JSI. Together they form the shadow tree, a C++ copy of your UI."
        },
        {
          l: "core",
          ph: 1,
          a: "Yoga: layout",
          tr: {
            s: [
              [0, "View 0,0 320×88", 1],
              [1, "Image 16,16 56×56", 1],
              [1, "Text 88,32 200×24", 1]
            ]
          },
          c: "Commit: Yoga computes each node’s position and size."
        },
        {
          l: "core",
          ph: 1,
          a: 'Seal tree → "next"',
          tr: {
            s: [
              [0, "View 0,0 320×88"],
              [1, "Image 16,16 56×56"],
              [1, "Text 88,32 200×24"]
            ]
          },
          c: "The tree is then sealed: it can never change, only be replaced. That makes it safe for any thread to read at the same time. It becomes the next tree to show."
        },
        {
          l: "core",
          ph: 2,
          a: "Diff → 3 mutations",
          c: "Mount: Fabric compares the new tree with what’s on screen and lists the differences, called mutations: create, update, delete."
        },
        {
          l: "ui",
          ph: 2,
          a: "Apply to host views",
          p: ["core", "ui", "3 mutations", "ref"],
          tr: {
            h: [
              [0, "View (host)", 1],
              [1, "Image (host)", 1],
              [1, "Text (host)", 1]
            ]
          },
          c: "The UI thread applies those mutations to host views, the real iOS or Android views. The next frame shows the result."
        }
      ]
    }
  }
};

export const scenarioFor = (id: ScenarioId, mode: Mode): Scenario =>
  LIB[id][mode];
