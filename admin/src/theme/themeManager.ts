export type ThemeMode = 'ocean' | 'emerald' | 'sunset'

export interface ThemePalette {
  mode: ThemeMode
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface ThemeConfigInput {
  theme_primary_color?: string
  theme_secondary_color?: string
}

const THEME_MODE_KEY = 'admin_theme_mode'
const THEME_COLORS_KEY = 'admin_theme_colors'
export const ADMIN_THEME_EVENT = 'admin-theme-change'

const PRESET_PALETTES: Record<ThemeMode, Omit<ThemePalette, 'mode'>> = {
  ocean: {
    primary: '#1677FF',
    secondary: '#13C2C2',
    accent: '#FF9F1C',
    background: '#F3F8FF',
    text: '#102A43'
  },
  emerald: {
    primary: '#2F855A',
    secondary: '#68D391',
    accent: '#D69E2E',
    background: '#F4FBF6',
    text: '#1C4532'
  },
  sunset: {
    primary: '#D97706',
    secondary: '#E11D48',
    accent: '#7C3AED',
    background: '#FFF7ED',
    text: '#4A2C2A'
  }
}

const safeMode = (mode?: string | null): ThemeMode => {
  if (mode === 'ocean' || mode === 'emerald' || mode === 'sunset') return mode
  return 'ocean'
}

const readLocalMemory = () => {
  const mode = safeMode(localStorage.getItem(THEME_MODE_KEY))

  try {
    const raw = localStorage.getItem(THEME_COLORS_KEY)
    if (!raw) return { mode }
    const parsed = JSON.parse(raw) as Partial<Pick<ThemePalette, 'primary' | 'secondary'>>
    return { mode, ...parsed }
  } catch {
    return { mode }
  }
}

const validHex = (value?: string) => {
  if (!value) return false
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export const buildTheme = (input?: ThemeConfigInput): ThemePalette => {
  // 双记忆优先级：本地记忆（用户偏好） > 后端配置（站点默认） > 预设默认
  const local = readLocalMemory()
  const base = PRESET_PALETTES[local.mode]

  const primary =
    (validHex(local.primary) && local.primary) ||
    (validHex(input?.theme_primary_color) && input?.theme_primary_color) ||
    base.primary

  const secondary =
    (validHex(local.secondary) && local.secondary) ||
    (validHex(input?.theme_secondary_color) && input?.theme_secondary_color) ||
    base.secondary

  return {
    mode: local.mode,
    primary,
    secondary,
    accent: base.accent,
    background: base.background,
    text: base.text
  }
}

export const applyTheme = (palette: ThemePalette) => {
  const root = document.documentElement
  root.style.setProperty('--primary', palette.primary)
  root.style.setProperty('--secondary', palette.secondary)
  root.style.setProperty('--accent', palette.accent)
  root.style.setProperty('--background', palette.background)
  root.style.setProperty('--text', palette.text)
  window.dispatchEvent(new CustomEvent<ThemePalette>(ADMIN_THEME_EVENT, { detail: palette }))
}

export const rememberTheme = (input: { mode: ThemeMode; primary: string; secondary: string }) => {
  localStorage.setItem(THEME_MODE_KEY, input.mode)
  localStorage.setItem(
    THEME_COLORS_KEY,
    JSON.stringify({ primary: input.primary, secondary: input.secondary })
  )
}

export const clearThemeMemory = () => {
  localStorage.removeItem(THEME_COLORS_KEY)
}

export const getPresetPalette = (mode: ThemeMode): ThemePalette => ({
  mode,
  ...PRESET_PALETTES[mode]
})

export const bootstrapTheme = () => {
  const palette = buildTheme()
  applyTheme(palette)
}

export const getCurrentTheme = () => buildTheme()
