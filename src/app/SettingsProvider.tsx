import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { MotionConfig } from "motion/react";
import { readStore, writeStore } from "../lib/storage";
import { readParam, replaceUrl } from "../lib/url";
import { accentOf, isMode, type Mode } from "../sim/colors";

interface Settings {
  mode: Mode;
  setMode: (m: Mode) => void;
  reduced: boolean;
  accent: string;
}

const SettingsContext = createContext<Settings | null>(null);

const MODE_KEY = "atb-mode";
const REDUCED_MOTION = true;

function initialMode(): Mode {
  const p = readParam("mode");
  if (isMode(p)) return p;
  const s = readStore(MODE_KEY);
  return isMode(s) ? s : "old";
}

/** Keep `?mode=` in the URL and discard old motion overrides. */
function syncModeToUrl(mode: Mode) {
  replaceUrl((url) => {
    url.searchParams.set("mode", mode);
    url.searchParams.delete("motion");
  });
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    writeStore(MODE_KEY, mode);
    syncModeToUrl(mode);
  }, [mode]);

  const value = {
    mode,
    setMode,
    reduced: REDUCED_MOTION,
    accent: accentOf(mode)
  };

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
