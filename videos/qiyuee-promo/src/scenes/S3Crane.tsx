// S3 经营概览 —— 镜头卡 crane-rise-reveal（demos/opening/crane-rise-reveal/CraneRiseReveal.tsx）
// 保留（参数原样）：165f 时间表（特写 hold 24f + 拉升 102f + 落定/余波/hold 39f）；起点 scale 3.0、
// hold 内 +1.5% 呼吸预备推近；对准点与 scale 共用一条 bezier(0.2,0,0.25,1)；translate = 屏幕中心 − 对准点×scale；
// 特写时非追踪内容压到 38%、起吊后 ~28f 回满；越线触发的强调色洗光（3f 起、6f 后 18f 落）；
// KPI 计数 expo-out 与运镜同期收（ramp(HOLD+6, MOVE_END−HOLD+4, snappy)）；窗口阴影随拉开从贴近升到悬浮；
// 背景点阵 0.35 视差；前 ~40f 快速段包 CameraMotionBlur（shutter 150 / samples 10），慢段与洗光层不进模糊；
// 余波 FLIP=134f 弹簧（damping 16 / stiffness 190）。
// 适配（真实素材）：世界 = 产品能力页「经营概览」看板正视截图（6x 纹理，3.0× 特写时 ≈1:1 采样，Q2）；
// 追踪对象 = KPI「在岗人员 326」卡（看板是卡片网格而非表格，洗光按卡片触发：完整进入视野的那一帧）；
// 对焦压暗用「挖洞」薄雾层实现（纹理是一张图）；其余三张 KPI 与拉升同期计数（覆盖层同字号同色重绘，
// 数到终值即撤覆盖、露出纹理本身）；余波 = 页头铃铛上弹出一枚红色提醒点（引出下一镜 AI 问待办）。
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { bezier, ramp, mix, EASE } from '../fixtures/Polish';
import { springAt } from '../fixtures/Look';
import { FONT_CN, Q, hexA, qiyueStageBg } from '../theme';
import { CAP, DashTexture, K, toWorld, type Rect } from './CapWorld';

export const S3_DEFAULTS = {
  accent: Q.accent as string,
  alertColor: '#F04438',
};

const HOLD = 24;
const MOVE_END = 126;
const BLUR_END = 64;
export const FLIP = 134;
export const S3_LAST = 164; // S3 末帧（S4 景深背景从这一帧的状态开始）
const crane = bezier(0.2, 0, 0.25, 1);

const TRACK = toWorld(CAP.metric[1]); // 在岗人员 326
const S0 = 3.0;
const BREATH = 0.015;
const F0 = { x: TRACK.x + TRACK.w / 2, y: TRACK.y + TRACK.h / 2 + (540 - 330) / S0 }; // 卡心落在画面 (960, 330)
const F1 = { x: 960, y: 540 };

export const camAt = (frame: number) => {
  const breath = ramp(frame, 0, HOLD, EASE.smooth);
  const e = crane(Math.min(1, Math.max(0, (frame - HOLD) / (MOVE_END - HOLD))));
  const s0 = S0 * (1 + BREATH * breath);
  const s = mix(s0, 1, e);
  const fx = mix(F0.x, F1.x, e);
  const fy = mix(F0.y, F1.y, e);
  return { s, e, tx: 960 - fx * s, ty: 540 - fy * s, vis: { x0: fx - 960 / s, x1: fx + 960 / s, y0: fy - 540 / s, y1: fy + 540 / s } };
};

// 洗光目标：完整进入视野的第一帧触发（开场就完整在画内的不触发）
const WASH_TARGETS: Array<{ r: Rect; radius: number }> = [
  { r: toWorld({ x: CAP.header.x - 8, y: CAP.header.y - 6, w: CAP.header.w + 16, h: CAP.header.h + 12 }), radius: 10 * K },
  ...[0, 2, 3].map((i) => ({ r: toWorld(CAP.metric[i]), radius: CAP.style.cardRadius * K })),
  { r: toWorld(CAP.chart), radius: CAP.style.panelRadius * K },
  { r: toWorld(CAP.todo), radius: CAP.style.panelRadius * K },
];
const inside = (r: Rect, f: number) => {
  const v = camAt(f).vis;
  return r.x >= v.x0 && r.x + r.w <= v.x1 && r.y >= v.y0 && r.y + r.h <= v.y1;
};
const WASH_TRIG = WASH_TARGETS.map(({ r }) => {
  if (inside(r, HOLD)) return -1;
  for (let f = HOLD; f <= MOVE_END; f++) if (inside(r, f)) return f;
  return MOVE_END;
});

// KPI 计数：管理项目 58 / 待办流程 12 / 本月出勤 92%
const COUNTERS = [
  { i: 0, to: 58, suffix: '' },
  { i: 2, to: 12, suffix: '' },
  { i: 3, to: 92, suffix: '%' },
];

const Counters: React.FC<{ frame: number }> = ({ frame }) => {
  const p = ramp(frame, HOLD + 6, MOVE_END - HOLD + 4, EASE.snappy);
  if (p >= 0.999) return null; // 数到终值：撤掉覆盖层，纹理里的真数字接手
  const st = CAP.style;
  return (
    <>
      {COUNTERS.map(({ i, to, suffix }) => {
        const b = toWorld(CAP.metricValue[i]);
        const v = Math.round(to * p);
        return (
          <div key={i} style={{ position: 'absolute', left: b.x - 2 * K, top: b.y, width: b.w + 2 * K, height: b.h, background: '#FFFFFF' }}>
            <div
              style={{
                position: 'absolute', left: 2 * K, top: 0, height: b.h, lineHeight: `${b.h}px`,
                fontFamily: FONT_CN, fontSize: st.valueSize * K, fontWeight: 700, color: st.valueColor, whiteSpace: 'nowrap',
              }}
            >
              {p > 0.01 ? `${v}${suffix}` : ''}
            </div>
          </div>
        );
      })}
    </>
  );
};

export const Focus: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => {
  const veil = 1 - ramp(frame, HOLD - 2, 28, EASE.out); // 38% → 100%（薄雾 0.62 → 0）
  const beat = 0.5 + 0.5 * Math.sin(frame / 5.5);
  const settle = 1 - 0.55 * ramp(frame, MOVE_END - 10, 30, EASE.out);
  const r = CAP.style.cardRadius * K;
  return (
    <>
      {veil > 0.002 && (
        <div
          style={{
            position: 'absolute', left: TRACK.x, top: TRACK.y, width: TRACK.w, height: TRACK.h, borderRadius: r,
            boxShadow: `0 0 0 4000px ${hexA(Q.bg, 0.62 * veil)}`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute', left: TRACK.x - 3, top: TRACK.y - 3, width: TRACK.w + 6, height: TRACK.h + 6, borderRadius: r + 3,
          boxShadow: `inset 0 0 0 ${2.2}px ${hexA(accent, 0.55 * settle)}, 0 0 0 ${6}px ${hexA(accent, 0.08 * settle)}`,
        }}
      />
      <div style={{ position: 'absolute', left: TRACK.x + TRACK.w - 26, top: TRACK.y + 20, width: 10, height: 10, borderRadius: 5, background: accent, opacity: settle }} />
      <div
        style={{
          position: 'absolute', left: TRACK.x + TRACK.w - 26 - 6 * beat, top: TRACK.y + 20 - 6 * beat, width: 10 + 12 * beat, height: 10 + 12 * beat,
          borderRadius: 20, border: `1.5px solid ${hexA(accent, 0.5 * (1 - beat) * settle)}`,
        }}
      />
    </>
  );
};

export const BellAlert: React.FC<{ frame: number; color: string }> = ({ frame, color }) => {
  if (frame < FLIP) return null;
  const b = toWorld(CAP.bell);
  const pop = springAt(frame, FLIP, { damping: 16, stiffness: 190 });
  const ring = ramp(frame, FLIP + 2, 20, EASE.out);
  const d = 7 * K;
  const cx = b.x + b.w * 0.86;
  const cy = b.y + b.h * 0.12;
  return (
    <>
      <div style={{ position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d, background: color, border: `${1.2 * K}px solid #fff`, boxSizing: 'border-box', transform: `scale(${pop})` }} />
      <div style={{ position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d, border: `1.5px solid ${hexA(color, 0.6 * (1 - ring))}`, transform: `scale(${1 + ring * 1.6})` }} />
    </>
  );
};

const World: React.FC<{ frame: number; accent: string; alert: string }> = ({ frame, accent, alert }) => {
  const elev = mix(6, 30, ramp(frame, HOLD + 30, MOVE_END - HOLD - 20, EASE.swift));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <DashTexture variant="empty" elev={elev} />
      <Counters frame={frame} />
      <Focus frame={frame} accent={accent} />
      <BellAlert frame={frame} color={alert} />
    </div>
  );
};

const Cam: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const { s, tx, ty } = camAt(frame);
  return (
    <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
      {children}
    </div>
  );
};

const DOTS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let y = -600; y <= 1700; y += 48) for (let x = -900; x <= 2800; x += 48) out.push({ x, y });
  return out;
})();
export const BackDots: React.FC<{ s: number; tx: number; ty: number }> = ({ s, tx, ty }) => {
  const k = 0.35;
  const sp = 1 + (s - 1) * k;
  const px = 960 + (tx + 960 * s - 960) * k - 960 * sp;
  const py = 540 + (ty + 540 * s - 540) * k - 540 * sp;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${sp.toFixed(4)})`}>
        {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.6} fill={hexA(Q.ink, 0.1)} />)}
      </g>
    </svg>
  );
};

const Page: React.FC<{ accent: string; alert: string }> = ({ accent, alert }) => {
  const frame = useCurrentFrame();
  const c = camAt(frame);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: qiyueStageBg({ x: 50, y: 4 }) }}>
      <BackDots s={c.s} tx={c.tx} ty={c.ty} />
      <Cam frame={frame}>
        <World frame={frame} accent={accent} alert={alert} />
      </Cam>
    </AbsoluteFill>
  );
};

const Sweeps: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => (
  <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
    <Cam frame={frame}>
      {WASH_TARGETS.map(({ r, radius }, i) => {
        const t = WASH_TRIG[i];
        if (t < 0) return null;
        const p = ramp(frame, t, 20, EASE.out);
        const op = Math.min(1, ramp(frame, t, 3, EASE.linear)) * (1 - ramp(frame, t + 6, 18, EASE.out));
        if (op <= 0.002) return null;
        const head = mix(-0.2, 1.1, p);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, opacity: op,
              background: `linear-gradient(90deg, ${hexA(accent, 0.03)} 0%, ${hexA(accent, 0.14)} ${(head * 100).toFixed(1)}%, ${hexA(accent, 0)} ${((head + 0.22) * 100).toFixed(1)}%)`,
              boxShadow: `inset 0 0 0 1.5px ${hexA(accent, 0.2)}`,
            }}
          />
        );
      })}
    </Cam>
  </AbsoluteFill>
);

export const S3Crane: React.FC<Partial<typeof S3_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S3_DEFAULTS, ...p };
  const frame = useCurrentFrame();
  const fast = frame > HOLD + 1 && frame < BLUR_END;
  const vig = 1 - ramp(frame, HOLD, 60, EASE.swift);
  return (
    <AbsoluteFill style={{ background: Q.bg, overflow: 'hidden' }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={150} samples={10}>
          <Page accent={o.accent} alert={o.alertColor} />
        </CameraMotionBlur>
      ) : (
        <Page accent={o.accent} alert={o.alertColor} />
      )}
      <Sweeps frame={frame} accent={o.accent} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: vig,
          background: `radial-gradient(ellipse 75% 70% at 50% 40%, ${hexA(Q.shadow, 0)} 55%, ${hexA(Q.shadow, 0.14)} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
