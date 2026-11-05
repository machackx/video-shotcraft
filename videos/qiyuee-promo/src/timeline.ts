// 帧级时间轴 —— 唯一事实源（SPEC.md §3）。字幕、转场、SFX 全部从 SHOTS 派生；
// src/workbench.ts 只 import 这里的表。30fps。
//
// BGM = assets/audio/bgm/cat-walk.mp3（Arulo · House · Mixkit 免费可商用），节奏分析见 analysis/bgm-cat-walk.json：
// 130.0 BPM（T=0.46156s，网格残差 ≤9ms）。片头对齐歌曲第 15 拍（SOURCE_BEAT0 + 15T = 7.170s），
// 于是「片内第 k 拍 = 歌曲第 k+15 拍」，歌曲的 drop（第 63 拍，29.33s，onset 峰）落在片内第 48 拍 = S6 业财一体切点。
// 硬切点全部钉在整拍上（music-beat-sync §4），两处白闪 + 收尾字标压印分别钉第 22 / 48 / 90 拍（kick 1.06 / 1.13 / 0.93）。
export const FPS = 30;
export const SOURCE_BEAT0 = 0.2469; // 源音乐分析 t0（秒），与 analysis/bgm-cat-walk.json 一致
export const BEAT_INT = 0.46156; // T（秒）
export const BGM_FIRST_BEAT = 15; // 片头 = 歌曲第 15 拍
export const BGM_START_SEC = SOURCE_BEAT0 + BGM_FIRST_BEAT * BEAT_INT; // 7.170s
/** 片内第 k 拍 → 帧（浮点秒最后一步才取整） */
export const beatF = (k: number) => Math.round(k * BEAT_INT * FPS);

const CUTS = {
  converge: beatF(7), //   97：S1 → S2（品牌 lockup 静止 ≥30f 后溶出）
  crane: beatF(22), //    305：白闪 #1（kick 1.06）
  ai: beatF(34), //       471：S3 落定 hold 后进入景深（kick 0.63）
  rows: beatF(41), //     568：S4 景深回实 = S5 首帧（连续镜头）
  exploded: beatF(48), // 665：白闪 #2 = 歌曲 drop（kick 1.13）
  phone: beatF(63), //    872：底色过渡（dip）
  industries: beatF(75), // 1039：底色过渡（dip）
  outro: beatF(90) - 44, // 1202：S9 第 44 帧（字标压印）= 第 90 拍（kick 0.93）
  end: beatF(90) - 44 + 165, // 1367
};

const order = [
  ['open', CUTS.converge],                        // S1 brand-ink-open
  ['converge', CUTS.crane - CUTS.converge],       // S2 bezier-source-converge-merge（动画 168f + 结语 hold）
  ['crane', CUTS.ai - CUTS.crane],                // S3 crane-rise-reveal（经营概览）
  ['ai', CUTS.rows - CUTS.ai],                    // S4 glass-pill-dictation-typing（AI 助手）
  ['rows', CUTS.exploded - CUTS.rows],            // S5 row-embed（流程审批 · 待办行嵌入）
  ['exploded', CUTS.phone - CUTS.exploded],       // S6 space-camera-moves · exploded-view（业财一体；动画 170f + 海报 hold）
  ['phone', CUTS.industries - CUTS.phone],        // S7 radial-ripple-phone-chips（移动办公）
  ['industries', CUTS.outro - CUTS.industries],   // S8 vertical-word-roll-blur-cycle（多行业适配）
  ['outro', CUTS.end - CUTS.outro],               // S9 outro-group-photo-launch
] as const;

export type ShotKey = (typeof order)[number][0];
export const SHOTS = (() => {
  const out = {} as Record<ShotKey, { from: number; duration: number }>;
  let acc = 0;
  for (const [k, d] of order) {
    out[k] = { from: acc, duration: d };
    acc += d;
  }
  return out;
})();
export const SHOT_ORDER = order.map(([k]) => k) as ShotKey[];
export const TOTAL = SHOT_ORDER.reduce((s, k) => s + SHOTS[k].duration, 0);
export const at = (k: ShotKey, offset = 0) => SHOTS[k].from + offset;

// 白闪盖切（shot-transitions A 式）：切点 = 后一镜起点；Sequence from = 切点 − 5、时长 10。
// 全画面级冲击全片 ≤3 处、间隔 ≥16 拍（R4）：第 22 / 48 拍两处白闪，收尾压印是元素层。
export const FLASH_CUTS = [at('crane'), at('exploded')];
// 底色过渡（dip）：S6→S7、S7→S8 前镜末 8f 淡到底色、后镜首 8f 从底色淡入
export const DIP = 8;

// 叙事字幕（Q11：58px 档）。品牌开场 / 汇聚（自带结语）/ AI（胶囊即文字）/ 炸开（自带标注与标题）/
// 手机（自带标题）/ 行业（本身就是字）/ 收尾不加字幕（C1 例外：自带文字或品牌镜头）。
export const CAPTIONS = [
  { from: at('crane', 58), duration: SHOTS.crane.duration - 58, text: '项目、人员与经营数据，一屏掌握' },
  { from: at('rows', 14), duration: SHOTS.rows.duration - 14, text: '流程审批：待办与进度，实时可见' },
];

// 每镜验收帧（局部帧号）：入场中 / 动作峰值 / 落定后
export const QA_FRAMES: Record<ShotKey, number[]> = {
  open: [14, 34, 70],
  converge: [30, 100, 160],
  crane: [10, 70, 150],
  ai: [12, 50, 80],
  rows: [20, 48, 90],
  exploded: [30, 90, 190],
  phone: [20, 80, 150],
  industries: [30, 70, 125],
  outro: [30, 70, 150],
};
