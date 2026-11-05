// 企悦视觉 tokens —— 全部取自 qiyuee.com computed styles 与站点资源（见 SPEC.md §1）。
// 片中所有文字、字幕、标注、光效、粒子的颜色只从这里取。
export const Q = {
  bg: '#F7F9FC',
  bg2: '#F2F6FC',
  bg3: '#E8EEF7',
  surface: '#FFFFFF',
  line: '#E6ECF5',
  ink: '#102146',
  body: '#162133',
  muted: '#667085',
  muted2: '#7D8CA4',
  accent: '#2F7CFF',
  accentDeep: '#1D5FE0',
  indigo: '#5267DF',
  green: '#25B96F',
  purple: '#8B5CF6',
  orange: '#F79009',
  cyan: '#15A9C7',
  logoBlue: '#017FF7',
  logoGreen: '#01D696',
  navyTop: '#13295A',
  navyBottom: '#0B1A3C',
  navyBright: '#1E4FB8',
  shadow: '#0C1F4A',
} as const;

export const FONT_CN = '"Qiyue Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';

export const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const k = Math.max(0, Math.min(1, t));
  const ch = (s: number) => Math.round((((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/** 企悦淡蓝舞台底：站点 hero 的雾白蓝 + 一处柔光（CSS background 串） */
export const qiyueStageBg = (light = { x: 50, y: 30 }) =>
  `radial-gradient(ellipse 62% 70% at ${light.x}% ${light.y}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 72%),` +
  `radial-gradient(ellipse 55% 50% at 85% 90%, ${hexA(Q.accent, 0.07)} 0%, ${hexA(Q.accent, 0)} 70%),` +
  `linear-gradient(180deg, ${Q.bg} 0%, ${Q.bg2} 55%, ${Q.bg3} 100%)`;
