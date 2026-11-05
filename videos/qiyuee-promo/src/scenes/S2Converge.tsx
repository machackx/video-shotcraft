// S2 统一平台 —— 镜头卡 bezier-source-converge-merge
// （demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx）
// 保留（参数原样）：设计坐标 480×270 + 440×240 画布、汇聚点 (332,120)、四路 y=36/92/148/204、
// draw-on 0.04+i·0.045 窗 0.17 outQuad、汇聚 conv 0.34→0.74 inOutCubic、三段式缩小 44→15→0（拐点 0.75）、
// 数据包 2 个整数周期 + i·0.13 相位 + 彗尾、擦除 0.78→0.9 dashoffset 取负、徽标 outBack +12% 接收脉冲、
// 接收涟漪 0.72→0.86、结尾居中平移 0.76→0.93、结语 0.84 后逐词加深。
// 适配：四路来源 = 项目 / 人员 / 流程 / 消息（站点同款 Lucide 图标）；节点左侧加中文标签（汇聚开始前淡出），
// 因此直线段起点从画框外 -22 改为标签右缘 x=50（f0 按新直线段长重新标定，见卡片已知坑）；
// 汇聚点 = 白瓷圆片托企悦标志；强调色 = 企悦蓝；结语 = 官网副标「一套系统，连接项目、人员、流程与消息」。
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DesignStage, E, lerp, seg } from '../fixtures/Motion';
import { EASE, Grain, softShadow } from '../fixtures/Polish';
import { QiyueMark } from '../fixtures/Brand';
import { FONT_CN, Q, hexA, mixHex, qiyueStageBg } from '../theme';

export const S2_DEFAULTS = {
  labels: '项目|人员|流程|消息',
  caption: '一套系统，|连接|项目、|人员、|流程|与消息',
  accent: Q.accent as string,
  ink: Q.ink as string,
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const XC = 332;
const YC = 120;
const X_START = 50; // 直线段起点（标签右缘）
const X_NODE = 74; // 节点驻留位
const LINE_LEN = X_NODE - X_START;

const SRCS = [
  { y: 36, icon: 'project', c: Q.ink },
  { y: 92, icon: 'people', c: '#2B3D63' },
  { y: 148, icon: 'flow', c: '#465A80' },
  { y: 204, icon: 'message', c: '#61759A' },
];

// Lucide 图标（ISC），与站点同款：briefcase-business / users / clipboard-check / message-circle
const ICON: Record<string, React.ReactNode> = {
  project: (
    <>
      <path d="M12 12h.01" />
      <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M22 13a18.15 18.15 0 0 1-20 0" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  flow: (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
};

type Pt = { x: number; y: number };
const cubic = (y0: number, u: number): Pt => {
  const v = 1 - u;
  return {
    x: v * v * v * X_NODE + 3 * v * v * u * 186 + 3 * v * u * u * 214 + u * u * u * XC,
    y: v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * YC + u * u * u * YC,
  };
};
const SAMPLES = 1600;
const mkPathGeom = (y0: number) => {
  const cum: number[] = [0];
  let px = X_NODE, py = y0, acc = 0;
  for (let k = 1; k <= SAMPLES; k++) {
    const p = cubic(y0, k / SAMPLES);
    acc += Math.hypot(p.x - px, p.y - py);
    cum.push(acc);
    px = p.x;
    py = p.y;
  }
  const len = LINE_LEN + acc;
  const pointAt = (s: number): Pt => {
    const sc = Math.max(0, Math.min(len, s));
    if (sc <= LINE_LEN) return { x: X_START + sc, y: y0 };
    const target = sc - LINE_LEN;
    let lo = 0, hi = SAMPLES;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const i = Math.max(1, lo);
    const s0 = cum[i - 1], s1 = cum[i];
    const u = (i - 1 + (s1 > s0 ? (target - s0) / (s1 - s0) : 0)) / SAMPLES;
    return cubic(y0, u);
  };
  return { len, pointAt, f0: LINE_LEN / len };
};
const GEOMS = SRCS.map((s) => mkPathGeom(s.y));

const BADGE_SIZE = 50;
const MARK_SIZE = 32;
const TAIL = 9;
const TAIL_GAP = 0.0055;
const SHIFT = 352 - 240;
const ANIM = 168;

export const S2Converge: React.FC<Partial<typeof S2_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S2_DEFAULTS, ...p };
  // 动画时基固定 168f（demo 原长，所有窗口按它标定）；镜头时长多出的部分是结语静止 hold（R1）
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / (ANIM - 1));
  const labels = o.labels.split('|');
  const capWords = o.caption.split('|');
  const capSt = 0.78 / capWords.length;
  const capWin = capSt * 1.5;
  const ACCENT = o.accent;

  const conv = seg(t, 0.34, 0.74, E.inOutCubic);
  const erase = seg(t, 0.78, 0.9, E.outQuad);
  const pkCycle = (seg(t, 0.1, 0.74, E.linear) * 2) % 1;
  const pan = seg(t, 0.76, 0.93, EASE.smooth);
  const bp = seg(t, 0.16, 0.26, E.outCubic);
  const badgeScale = lerp(bp, 0.7, 1) * (1 + seg(t, 0.7, 0.78, E.outBack) * 0.12 - seg(t, 0.78, 0.86, E.outQuad) * 0.12);
  const ripple = seg(t, 0.72, 0.86, EASE.out);
  const capShow = seg(t, 0.84, 0.9, EASE.out);
  const capInn = seg(t, 0.84, 0.95);
  const labelOut = seg(t, 0.3, 0.4, EASE.out);

  return (
    <AbsoluteFill style={{ background: qiyueStageBg({ x: 62, y: 30 }) }}>
      <Grain opacity={0.035} />
      <DesignStage bg="transparent" raster="zoom">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: FONT_CN }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 440,
              height: 240,
              margin: '-120px 0 0 -220px',
              transform: `translateX(${(-pan * SHIFT).toFixed(2)}px)`,
            }}
          >
            <svg width={440} height={240} viewBox="0 0 440 240" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              <defs>
                <linearGradient id="qs2-stroke" gradientUnits="userSpaceOnUse" x1={X_START} y1={0} x2={XC} y2={0}>
                  <stop offset="0" stopColor="#B9C6DC" />
                  <stop offset="0.45" stopColor="#7A8BAA" />
                  <stop offset="1" stopColor={o.ink} />
                </linearGradient>
              </defs>
              {SRCS.map((s, i) => {
                const { len } = GEOMS[i];
                const draw = seg(t, 0.04 + i * 0.045, 0.04 + i * 0.045 + 0.17, E.outQuad);
                const off = erase > 0 ? -erase * len : len * (1 - draw);
                return (
                  <path
                    key={i}
                    d={`M ${X_START},${s.y} L ${X_NODE},${s.y} C 186,${s.y} 214,${YC} ${XC},${YC}`}
                    fill="none"
                    stroke="url(#qs2-stroke)"
                    strokeWidth={0.9}
                    strokeLinecap="round"
                    strokeDasharray={len}
                    strokeDashoffset={off.toFixed(1)}
                    opacity={(draw * (1 - clamp01((erase - 0.85) / 0.15))).toFixed(3)}
                  />
                );
              })}
            </svg>

            {/* 来源标签：节点左侧、右对齐；汇聚开始前淡出 */}
            {SRCS.map((s, i) => {
              const ap = seg(t, 0.02 + i * 0.04, 0.02 + i * 0.04 + 0.08, EASE.out);
              return (
                <div
                  key={`lb${i}`}
                  style={{
                    position: 'absolute',
                    right: 440 - (X_START - 3),
                    top: s.y - 9,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: o.ink,
                    whiteSpace: 'nowrap',
                    opacity: ap * (1 - labelOut),
                    transform: `translateX(${((1 - ap) * -6 - labelOut * 4).toFixed(2)}px)`,
                  }}
                >
                  {labels[i]}
                </div>
              );
            })}

            <div style={{ position: 'absolute', left: 0, top: 0, width: 440, height: 240 }}>
              {SRCS.map((s, i) => {
                const { len, pointAt, f0 } = GEOMS[i];
                const tt = conv;
                const pt = pointAt(len * (f0 + (1 - f0) * tt));
                const size = tt < 0.75 ? lerp(tt / 0.75, 44, 15) : lerp((tt - 0.75) / 0.25, 15, 0);
                const appear = seg(t, 0.02 + i * 0.04, 0.02 + i * 0.04 + 0.1, EASE.overshoot);
                const appearOp = seg(t, 0.02 + i * 0.04, 0.02 + i * 0.04 + 0.06, EASE.out);
                const ph = (pkCycle + i * 0.13) % 1;
                const pkOn = seg(t, 0.1, 0.16) * (1 - seg(t, 0.7, 0.76));
                const pkOp = pkOn * (1 - Math.abs(ph - 0.5) * 0.6);
                const k = size / 44;
                return (
                  <React.Fragment key={i}>
                    {pkOp > 0.01 &&
                      Array.from({ length: TAIL }, (_, j) => TAIL - j).map((j) => {
                        const pj = ph - j * TAIL_GAP;
                        if (pj < 0) return null;
                        const q = pointAt(len * (f0 + (1 - f0) * pj));
                        const r = 2.6 * (1 - j / (TAIL + 1));
                        return (
                          <div
                            key={`tail${j}`}
                            style={{
                              position: 'absolute', left: 0, top: 0, width: r * 2, height: r * 2, borderRadius: '50%',
                              background: ACCENT,
                              transform: `translate(${(q.x - r).toFixed(2)}px,${(q.y - r).toFixed(2)}px)`,
                              opacity: (pkOp * 0.38 * (1 - j / (TAIL + 1))).toFixed(3),
                            }}
                          />
                        );
                      })}
                    {pkOp > 0.01 && (() => {
                      const q = pointAt(len * (f0 + (1 - f0) * ph));
                      return (
                        <div
                          style={{
                            position: 'absolute', left: 0, top: 0, width: 6, height: 6, borderRadius: '50%',
                            background: `radial-gradient(circle at 35% 35%, #7FB0FF, ${ACCENT})`,
                            boxShadow: `0 0 0 1.5px ${hexA(ACCENT, 0.16)}, 0 1px 3px ${hexA(ACCENT, 0.45)}`,
                            transform: `translate(${(q.x - 3).toFixed(2)}px,${(q.y - 3).toFixed(2)}px)`,
                            opacity: pkOp.toFixed(3),
                          }}
                        />
                      );
                    })()}
                    <div
                      style={{
                        position: 'absolute', left: 0, top: 0, borderRadius: '50%',
                        background: 'linear-gradient(180deg, #ffffff 0%, #F3F6FB 100%)',
                        border: `0.5px solid ${hexA(Q.shadow, 0.1)}`,
                        boxSizing: 'border-box',
                        boxShadow: `inset 0 0.5px 0 rgba(255,255,255,1), ${softShadow(2 + 4 * k, { strength: 0.8, color: Q.shadow })}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.c,
                        width: Math.max(0.1, size),
                        height: Math.max(0.1, size),
                        transform: `translate(${(pt.x - size / 2).toFixed(2)}px,${(pt.y - size / 2).toFixed(2)}px) scale(${appear.toFixed(3)})`,
                        opacity: (appearOp * (tt > 0.92 ? clamp01((1 - tt) / 0.08) : 1)).toFixed(3),
                      }}
                    >
                      <svg width={Math.max(0.1, size * 0.46)} height={Math.max(0.1, size * 0.46)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                        {ICON[s.icon]}
                      </svg>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div
              style={{
                position: 'absolute', left: XC - BADGE_SIZE / 2, top: YC - BADGE_SIZE / 2, width: BADGE_SIZE, height: BADGE_SIZE,
                borderRadius: '50%', border: `0.75px solid ${ACCENT}`, boxSizing: 'border-box',
                transform: `scale(${lerp(ripple, 1, 2.1)})`,
                opacity: ripple > 0 && ripple < 1 ? (1 - ripple) * 0.55 : 0,
              }}
            />
            <div
              style={{
                position: 'absolute', width: BADGE_SIZE, height: BADGE_SIZE, left: XC - BADGE_SIZE / 2, top: YC - BADGE_SIZE / 2,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #ffffff 0%, #F3F6FB 100%)',
                border: `0.5px solid ${hexA(Q.shadow, 0.1)}`,
                boxSizing: 'border-box',
                boxShadow: `inset 0 0.5px 0 rgba(255,255,255,1), ${softShadow(8, { strength: 1, color: Q.shadow })}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: bp,
                transform: `scale(${badgeScale})`,
              }}
            >
              <QiyueMark size={MARK_SIZE} style={{ marginTop: 1 }} />
            </div>

            <div
              style={{
                position: 'absolute', display: 'flex', alignItems: 'baseline', justifyContent: 'center', whiteSpace: 'nowrap',
                left: XC - 220, width: 440, top: YC + 40,
                opacity: capShow,
                transform: `translateY(${((1 - capShow) * 4).toFixed(2)}px)`,
              }}
            >
              {capWords.map((w, i) => {
                const q = clamp01((capInn - i * capSt) / capWin);
                return (
                  <span key={i} style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, letterSpacing: '0.02em', color: mixHex('#C3CCDB', o.ink, q) }}>
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </DesignStage>
    </AbsoluteFill>
  );
};
