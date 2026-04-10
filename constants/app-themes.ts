/**
 * ZenWakeup UI 主题系统
 *
 * 三套风格，通过 ThemeContext 在 app 内动态切换。
 * unlockDay: 解锁所需的晨间冥想天数（0 = 默认开放）
 * mountain:  对应哪套山体 SVG 组件
 */

export type MountainStyle = 'geometric' | 'brushstroke' | 'weathered';

export interface AppTheme {
  id: string;
  name: string;
  nameZh: string;
  tagline: string;
  unlockDay: number;
  mountain: MountainStyle;

  // ── 底色 ──
  bg:     string;
  bgCard: string;
  bgMist: string;

  // ── 墨色层次 ──
  ink:  string;
  ink2: string;
  ink3: string;
  gold: string;

  // ── 笔触不透明度 ──
  strokeHeavy: number;
  strokeMid:   number;
  strokeLight: number;

  // ── 字体 ──
  fontTitle:   { fontSize: number; letterSpacing: number; fontWeight: string };
  fontBody:    { fontSize: number; letterSpacing: number; lineHeight: number };
  fontCaption: { fontSize: number; letterSpacing: number };
  fontQuote:   { fontSize: number; letterSpacing: number; fontStyle: string; lineHeight: number };

  // ── 间距 ──
  radiusBtn:  number;
  radiusCard: number;

  // ── SVG 特征 ──
  pathStroke:  number;
  mountainOp:  number;
  mistOp:      number;

  // ── 可选：印章字 (水墨专用) ──
  seal?: string;
}

// ─────────────────────────────────────────────────────────────
// 1. 极简禅意（默认，始终开放）
//    米白底 · 墨绿线 · 金点缀 · 几何对称山形
// ─────────────────────────────────────────────────────────────
export const THEME_MINIMAL: AppTheme = {
  id:        'minimal',
  name:      'Minimal Zen',
  nameZh:    '无印极简',
  tagline:   'clean lines · geometric forms',
  unlockDay: 0,
  mountain:  'geometric',

  bg:     '#dedad2',
  bgCard: 'rgba(220,216,206,0.85)',
  bgMist: 'rgba(220,216,206,0.45)',

  ink:  '#2a2e24',
  ink2: '#485040',
  ink3: '#7a8472',
  gold: '#8a7040',

  strokeHeavy: 0.72,
  strokeMid:   0.45,
  strokeLight: 0.22,

  fontTitle:   { fontSize: 28, letterSpacing: 8,   fontWeight: '300' },
  fontBody:    { fontSize: 14, letterSpacing: 1.5, lineHeight: 24 },
  fontCaption: { fontSize: 10, letterSpacing: 3 },
  fontQuote:   { fontSize: 14, letterSpacing: 1.5, fontStyle: 'italic', lineHeight: 24 },

  radiusBtn:  2,
  radiusCard: 4,

  pathStroke:  1.1,
  mountainOp:  0.25,
  mistOp:      0.07,
};

// ─────────────────────────────────────────────────────────────
// 2. 中国水墨（第 30 天解锁）
//    宣纸底 · 浓墨 · 朱砂红印章 · 笔压不均山形
// ─────────────────────────────────────────────────────────────
export const THEME_INK_WASH: AppTheme = {
  id:        'ink-wash',
  name:      'Sumi-e',
  nameZh:    '水墨',
  tagline:   'brushstroke weight · ink wash · negative space',
  unlockDay: 30,
  mountain:  'brushstroke',
  seal:      '禅',

  bg:     '#e8e2d6',
  bgCard: 'rgba(232,226,214,0.9)',
  bgMist: 'rgba(232,226,214,0.55)',

  ink:  '#1a1208',
  ink2: '#38300a',
  ink3: '#6b6050',
  gold: '#8a2020',   // 朱砂红

  strokeHeavy: 0.85,
  strokeMid:   0.55,
  strokeLight: 0.28,

  fontTitle:   { fontSize: 28, letterSpacing: 6,  fontWeight: '200' },
  fontBody:    { fontSize: 14, letterSpacing: 1.5, lineHeight: 24 },
  fontCaption: { fontSize: 10, letterSpacing: 4 },
  fontQuote:   { fontSize: 14, letterSpacing: 1.5, fontStyle: 'italic', lineHeight: 26 },

  radiusBtn:  0,     // 方正，印章感
  radiusCard: 0,

  pathStroke:  1.6,
  mountainOp:  0.35,
  mistOp:      0.06,
};

// ─────────────────────────────────────────────────────────────
// 3. 侘寂（第 90 天解锁）
//    灰棕和纸底 · 暖棕墨 · 锖铜绿 · 风化侵蚀山形
// ─────────────────────────────────────────────────────────────
export const THEME_WABI_SABI: AppTheme = {
  id:        'wabi-sabi',
  name:      'Wabi-Sabi',
  nameZh:    '侘寂',
  tagline:   'imperfection · erosion · the mark of time',
  unlockDay: 90,
  mountain:  'weathered',

  bg:     '#c8c0b0',
  bgCard: 'rgba(200,192,176,0.88)',
  bgMist: 'rgba(200,192,176,0.50)',

  ink:  '#2e2a24',   // 深炭
  ink2: '#4a4438',
  ink3: '#7a7268',
  gold: '#8a8272',   // 石橄榄

  strokeHeavy: 0.65,
  strokeMid:   0.40,
  strokeLight: 0.20,

  fontTitle:   { fontSize: 26, letterSpacing: 4,   fontWeight: '300' },
  fontBody:    { fontSize: 14, letterSpacing: 0.8, lineHeight: 23 },
  fontCaption: { fontSize: 10, letterSpacing: 5 },
  fontQuote:   { fontSize: 13, letterSpacing: 0.8, fontStyle: 'italic', lineHeight: 23 },

  radiusBtn:  0,   // 方正无圆角
  radiusCard: 0,

  pathStroke:  1.0,
  mountainOp:  0.75,
  mistOp:      0.06,
};

export const ALL_THEMES: AppTheme[] = [THEME_MINIMAL, THEME_INK_WASH, THEME_WABI_SABI];

export const THEME_MAP: Record<string, AppTheme> = {
  'minimal':   THEME_MINIMAL,
  'ink-wash':  THEME_INK_WASH,
  'wabi-sabi': THEME_WABI_SABI,
};
