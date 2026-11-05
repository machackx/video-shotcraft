// 帧级时间轴 —— 唯一事实源（SPEC.md §3）。字幕、转场、SFX 全部从 SHOTS 派生；
// src/workbench.ts 只 import 这里的表。30fps。
export const FPS = 30;

const order = [
  ['open', 96],        // S1 brand-ink-open
  ['converge', 198],   // S2 bezier-source-converge-merge（动画 168f + 结语 hold 30f）
  ['crane', 165],      // S3 crane-rise-reveal（经营概览）
  ['ai', 105],         // S4 glass-pill-dictation-typing（AI 助手）
  ['rows', 105],       // S5 row-embed（流程审批 · 待办行嵌入）
  ['exploded', 200],   // S6 space-camera-moves · exploded-view（业财一体 · 门户工作台；动画 170f + 海报 hold 30f）
  ['phone', 168],      // S7 radial-ripple-phone-chips（移动办公）
  ['industries', 150], // S8 vertical-word-roll-blur-cycle（多行业适配）
  ['outro', 165],      // S9 outro-group-photo-launch
] as const;

export type ShotKey = (typeof order)[number][0];
export const SHOTS = (() => {
  const out = {} as Record<ShotKey, { from: number; duration: number }>;
  let at = 0;
  for (const [k, d] of order) {
    out[k] = { from: at, duration: d };
    at += d;
  }
  return out;
})();
export const SHOT_ORDER = order.map(([k]) => k) as ShotKey[];
export const TOTAL = SHOT_ORDER.reduce((s, k) => s + SHOTS[k].duration, 0);
export const at = (k: ShotKey, offset = 0) => SHOTS[k].from + offset;

// 白闪盖切（shot-transitions A 式）：切点 = 后一镜起点；Sequence from = 切点 − 5、时长 10
export const FLASH_CUTS = [at('crane'), at('exploded')];

// 叙事字幕（Q11：58px 档）。品牌开场 / 汇聚（自带结语）/ AI（胶囊即文字）/ 炸开（自带标注与标题）/
// 手机（自带标题）/ 行业（本身就是字）/ 收尾不加字幕（C1 例外：自带文字或品牌镜头）。
export const CAPTIONS = [
  { from: at('crane', 58), duration: 107, text: '项目、人员与经营数据，一屏掌握' },
  { from: at('rows', 14), duration: 88, text: '流程审批：待办与进度，实时可见' },
];

// 每镜验收帧（局部帧号）：入场中 / 动作峰值 / 落定后
export const QA_FRAMES: Record<ShotKey, number[]> = {
  open: [14, 34, 70],
  converge: [30, 100, 160],
  crane: [10, 70, 150],
  ai: [12, 50, 92],
  rows: [20, 48, 95],
  exploded: [30, 90, 170],
  phone: [20, 80, 160],
  industries: [30, 70, 125],
  outro: [30, 70, 150],
};
