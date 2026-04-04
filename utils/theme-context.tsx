import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ALL_THEMES, AppTheme, THEME_MAP, THEME_MINIMAL } from '../constants/app-themes';
import { loadData, loadThemeId, saveThemeId } from './storage';

interface ThemeCtx {
  theme: AppTheme;
  setTheme: (id: string) => Promise<void>;
  unlockedThemes: AppTheme[];   // themes available to the user right now
  newUnlockTheme: AppTheme | null; // theme just unlocked this session (for notification)
  morningDays: number;
}

const ThemeContext = createContext<ThemeCtx>({
  theme:           THEME_MINIMAL,
  setTheme:        async () => {},
  unlockedThemes:  [THEME_MINIMAL],
  newUnlockTheme:  null,
  morningDays:     0,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,           setThemeState]   = useState<AppTheme>(THEME_MINIMAL);
  const [morningDays,     setMorningDays]  = useState(0);
  const [unlockedThemes,  setUnlocked]     = useState<AppTheme[]>([THEME_MINIMAL]);
  const [newUnlockTheme,  setNewUnlock]    = useState<AppTheme | null>(null);

  useEffect(() => {
    (async () => {
      const [data, savedId] = await Promise.all([loadData(), loadThemeId()]);
      const days = data.records.filter(r => r.morningDone).length;
      setMorningDays(days);

      // compute which themes are unlocked
      const unlocked = ALL_THEMES.filter(t => t.unlockDay <= days);
      setUnlocked(unlocked);

      // detect new unlock: a theme whose threshold == days (just crossed it today)
      const justUnlocked = ALL_THEMES.find(t => t.unlockDay > 0 && t.unlockDay === days);
      if (justUnlocked) setNewUnlock(justUnlocked);

      // dev preview: ?theme=wabi-sabi overrides everything
      if (typeof window !== 'undefined') {
        const devTheme = new URLSearchParams(window.location.search).get('theme');
        if (devTheme && THEME_MAP[devTheme]) { setThemeState(THEME_MAP[devTheme]); return; }
      }
      // restore saved theme (only if still unlocked)
      if (savedId && THEME_MAP[savedId] && THEME_MAP[savedId].unlockDay <= days) {
        setThemeState(THEME_MAP[savedId]);
      }
    })();
  }, []);

  const setTheme = useCallback(async (id: string) => {
    const t = THEME_MAP[id];
    if (!t || t.unlockDay > morningDays) return;
    setThemeState(t);
    await saveThemeId(id);
  }, [morningDays]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, unlockedThemes, newUnlockTheme, morningDays }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
