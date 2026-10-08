import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { MotionConfig } from "motion/react";
import { accentOf, type Mode } from "../sim/colors";

interface Settings {
  mode: Mode;
  setMode: (m: Mode) => void;
  reduced: boolean;
  accent: string;
}

const SettingsContext = createContext<Settings | null>(null);

const MODE_KEY = "atb-mode";

function readParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}
function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const isMode = (v: unknown): v is Mode => v === "old" || v === "new";

function initialMode(): Mode {
  const p = readParam("mode");
  if (isMode(p)) return p;
  const s = readStore(MODE_KEY);
  return isMode(s) ? s : "old";
}

/** Keep `?mode=` in the URL without a navigation and discard old motion overrides. */
function syncUrl(mode: Mode) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    url.searchParams.delete("motion");
    window.history.replaceState(window.history.state, "", url);
  } catch {
    /* ignore */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const reduced = true;

  useEffect(() => {
    writeStore(MODE_KEY, mode);
    syncUrl(mode);
  }, [mode]);

  const setMode = useCallback((m: Mode) => setModeState(m), []);

  const value = useMemo(
    () => ({ mode, setMode, reduced, accent: accentOf(mode) }),
    [mode, setMode]
  );

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion="always">{children}</MotionConfig>
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
