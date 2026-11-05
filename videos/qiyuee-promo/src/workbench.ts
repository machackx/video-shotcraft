// 动效工作台清单（references/workbench.md §2–3）：把成片拆成镜头 / 转场 / 字幕 / 音效 / BGM 多轨。
// 所有时间表都从 timeline.ts / audio.tsx import，不另抄一份；镜头的语境级参数（文案 / 颜色 / 字号）
// 来自各场景导出的 *_DEFAULTS，属性面板改的就是屏幕上的值；缓动 / 时值 / 相机键不暴露（节奏命门）。
import { createElement, type FC } from 'react';
import { QiyueMain } from './Main';
import { CAPTIONS, FLASH_CUTS, SHOTS, TOTAL, type ShotKey } from './timeline';
import { BGM, SFX } from './audio';
import { Q } from './theme';
import { S1Open, S1_DEFAULTS } from './scenes/S1Open';
import { S2Converge, S2_DEFAULTS } from './scenes/S2Converge';
import { S3Crane, S3_DEFAULTS } from './scenes/S3Crane';
import { S4AiPill, S4_DEFAULTS } from './scenes/S4AiPill';
import { S5RowEmbed, S5_DEFAULTS } from './scenes/S5RowEmbed';
import { S6Exploded, S6_DEFAULTS } from './scenes/S6Exploded';
import { S7Phone, S7_DEFAULTS } from './scenes/S7Phone';
import { S8Industries, S8_DEFAULTS } from './scenes/S8Industries';
import { S9Outro, S9_DEFAULTS } from './scenes/S9Outro';
import { Caption, CAPTION_DEFAULTS } from './lib/Caption';
import { FlashCut } from './lib/FlashCut';

type Field = Record<string, unknown> & { type: string; key: string; label: string; default: unknown };
const text = (key: string, label: string, def: string): Field => ({ type: 'text', key, label, default: def });
const textarea = (key: string, label: string, def: string): Field => ({ type: 'textarea', key, label, default: def });
const color = (key: string, label: string, def: string): Field => ({ type: 'color', key, label, default: def });
const size = (key: string, label: string, def: number, min: number, max: number): Field => ({
  type: 'slider', key, label, default: def, min, max, step: 1, unit: 'px',
});

type CaptionProps = Partial<typeof CAPTION_DEFAULTS> & { text?: string; bottom?: number; duration?: number };
export const CaptionUnit: FC<CaptionProps> = ({ text = '', bottom = 64, duration = 60, ...style }) =>
  createElement(Caption, { text, bottom, duration, ...style });
CaptionUnit.displayName = 'Caption';

export const FlashUnit: FC<{ duration?: number }> = ({ duration = 10 }) => createElement(FlashCut, { duration });
FlashUnit.displayName = 'FlashCut';

const SCHEMAS: Record<ShotKey, Field[]> = {
  open: [
    text('wordmark', '字标', S1_DEFAULTS.wordmark),
    size('wordmarkSize', '字标字号', S1_DEFAULTS.wordmarkSize, 72, 180),
    text('kicker', '眉题（打字机）', S1_DEFAULTS.kicker),
    size('kickerSize', '眉题字号', S1_DEFAULTS.kickerSize, 28, 64),
    color('ink', '字标颜色', S1_DEFAULTS.ink),
    color('accent', '强调色（准星 / 光标）', S1_DEFAULTS.accent),
    color('muted', '眉题颜色', S1_DEFAULTS.muted),
  ],
  converge: [
    text('labels', '四路来源（| 分隔）', S2_DEFAULTS.labels),
    text('caption', '结语（| 分隔逐词加深）', S2_DEFAULTS.caption),
    color('accent', '数据包 / 涟漪色', S2_DEFAULTS.accent),
    color('ink', '文字 / 曲线终端色', S2_DEFAULTS.ink),
  ],
  crane: [color('accent', '追踪框 / 洗光色', S3_DEFAULTS.accent), color('alertColor', '铃铛提醒点颜色', S3_DEFAULTS.alertColor)],
  ai: [
    text('query', '胶囊里听写的问题', S4_DEFAULTS.query),
    text('label', '功能名', S4_DEFAULTS.label),
    text('sub', '功能说明', S4_DEFAULTS.sub),
    color('accent', '内嵌光（主）', S4_DEFAULTS.accent),
    color('glow', '内嵌光（亮端）', S4_DEFAULTS.glow),
  ],
  rows: [color('accent', '嵌入缝颜色', S5_DEFAULTS.accent)],
  exploded: [
    text('title', '收尾标题', S6_DEFAULTS.title),
    text('subtitle', '收尾副标', S6_DEFAULTS.subtitle),
    textarea('callouts', '五条标注（每行：标题|说明）', S6_DEFAULTS.callouts),
  ],
  phone: [
    text('title', '左下标题', S7_DEFAULTS.title),
    textarea('subtitle', '左下说明（可换行）', S7_DEFAULTS.subtitle),
    color('badgeColor', '角标脉冲色', S7_DEFAULTS.badgeColor),
  ],
  industries: [
    text('stem', '句干', S8_DEFAULTS.stem),
    text('words', '滚轮词（| 分隔，建议等长）', S8_DEFAULTS.words),
    text('note', '下方说明', S8_DEFAULTS.note),
    color('accent', '落定染色', S8_DEFAULTS.accent),
  ],
  outro: [
    text('wordmark', '字标', S9_DEFAULTS.wordmark),
    size('wordmarkSize', '字标字号', S9_DEFAULTS.wordmarkSize, 72, 140),
    text('slogan', '标语', S9_DEFAULTS.slogan),
    text('url', '网址', S9_DEFAULTS.url),
    color('ink', '字标颜色', S9_DEFAULTS.ink),
    color('tagColor', '标语颜色', S9_DEFAULTS.tagColor),
  ],
};

const COMPONENTS: Record<ShotKey, [string, FC<Record<string, unknown>>, Record<string, unknown>]> = {
  open: ['S1 品牌开场 · brand-ink-open', S1Open as FC<Record<string, unknown>>, S1_DEFAULTS],
  converge: ['S2 统一平台 · bezier-source-converge-merge', S2Converge as FC<Record<string, unknown>>, S2_DEFAULTS],
  crane: ['S3 经营概览 · crane-rise-reveal', S3Crane as FC<Record<string, unknown>>, S3_DEFAULTS],
  ai: ['S4 AI 助手 · glass-pill-dictation-typing', S4AiPill as FC<Record<string, unknown>>, S4_DEFAULTS],
  rows: ['S5 流程审批 · row-embed', S5RowEmbed as FC<Record<string, unknown>>, S5_DEFAULTS],
  exploded: ['S6 业财一体 · exploded-view', S6Exploded as FC<Record<string, unknown>>, S6_DEFAULTS],
  phone: ['S7 移动办公 · radial-ripple-phone-chips', S7Phone as FC<Record<string, unknown>>, S7_DEFAULTS],
  industries: ['S8 多行业 · vertical-word-roll-blur-cycle', S8Industries as FC<Record<string, unknown>>, S8_DEFAULTS],
  outro: ['S9 品牌收尾 · outro-group-photo-launch', S9Outro as FC<Record<string, unknown>>, S9_DEFAULTS],
};

export const WORKBENCH = {
  name: '企悦业务协同系统 · 宣传片',
  fps: 30,
  width: 1920,
  height: 1080,
  total: TOTAL,
  background: Q.bg,
  shots: (Object.keys(COMPONENTS) as ShotKey[]).map((key) => {
    const [label, component, defaults] = COMPONENTS[key];
    return {
      id: key,
      label,
      from: SHOTS[key].from,
      duration: SHOTS[key].duration,
      component,
      props: { ...defaults },
      schema: SCHEMAS[key],
      durationProp: 'duration',
    };
  }),
  transitions: FLASH_CUTS.map((cut, i) => ({
    id: `flash-${i + 1}`,
    label: `白闪 @${cut}f`,
    from: cut - 5,
    duration: 10,
    component: FlashUnit as FC<Record<string, unknown>>,
    durationProp: 'duration',
    cardId: 'flash-cut',
    cardName: '冷白闪转场',
  })),
  captions: CAPTIONS.map((c, i) => ({
    id: `caption-${i + 1}`,
    label: c.text,
    from: c.from,
    duration: c.duration,
    component: CaptionUnit as FC<Record<string, unknown>>,
    props: { text: c.text, ...CAPTION_DEFAULTS },
    schema: [
      text('text', '解说文案', ''),
      size('fontSize', '字号', CAPTION_DEFAULTS.fontSize, 40, 80),
      color('color', '文字色', CAPTION_DEFAULTS.color),
      color('accent', '方点色', CAPTION_DEFAULTS.accent),
    ],
    durationProp: 'duration',
    cardId: 'caption',
    cardName: '解说字幕条',
  })),
  sfx: SFX.map((s) => ({ from: s.from, duration: s.duration, src: s.src, volume: s.volume })),
  bgm: [{ from: 0, duration: TOTAL, src: BGM.src, volume: BGM.volume, label: 'Cat Walk · Arulo（Mixkit）' }],
  order: ['transitions', 'captions', 'overlays'] as const,
  original: QiyueMain as FC<Record<string, unknown>>,
};
