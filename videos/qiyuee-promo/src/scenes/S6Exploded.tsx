// S6 业财一体 —— 镜头卡 space-camera-moves · A 式 exploded-view（demos/camera/space-camera-moves/ExplodedView.tsx）
// 保留（参数原样）：perspective 2400；3/4 轴测 rotateX 54° / rotateZ −34°→−32°，悬停环绕 +10°、俯角收 4°；
// 炸开时机位拉远 0.56→0.47 并下移、合体后推回；5 层 translateZ 150/270/…/640 弹簧（damping 15、stiffness 120）错峰 5f，
// 页面上越靠远端（顶部）的层越高；18–24f 预备下压 6px；标注 52f 起每条 8f 描线 + 12f 升起、错峰 6f，104f 起撤；
// 108f 起逆序 ease-in 合体（每层 14f、错峰 3f），落座后整组 8px 阻尼下沉回弹 + 台面接触影一紧（不抖屏，Q3），
// 扫光一次（裁进底板圆角，Q4）；140f 起左上角字标 + 标题逐字升起 + 副标；层影随高度下移变虚、厚度边、底板虚线插槽。
// 适配（真实素材）：页面 = 门户登录页「工作台」示意（.preview-window，4x 元素截图），按构件逐块截图
// 绝对定位复刻原网格（页面坐标 = CSS px × 1.6）；5 层：导航侧栏 / 收支概览 + 费用趋势 / 常用应用 / 流程进度 / 四张指标卡；
// 顶栏「工作台」留在底板上；标注与标题改为中文（标题 44px、说明 32px，Q11）；动画 170f 后加 30f 海报 hold（R1）。
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { LOOKS, Sheen, Stage, TextReveal, alpha, springAt, type Look } from '../fixtures/Look';
import { EASE, mix, ramp } from '../fixtures/Polish';
import { QiyueWordmark } from '../fixtures/Brand';
import { FONT_CN, Q } from '../theme';
import layout from '../layout.json';

export const S6_DEFAULTS = {
  title: '业财一体',
  subtitle: '审批、合同、开票、收付款，一体化管理',
  callouts: '导航|首页、流程、合同、财务\n业财报表|收支概览与费用趋势联动\n常用应用|报销、采购、合同、开票、收款\n流程审批|从发起到完成，每一步可见\n实时指标|待办、审批、应收一目了然',
};

const P = layout.portal;
const PK = 1.6; // 页面坐标 = CSS px × PK
const W = P.root.w * PK; // 1600
const H = P.root.h * PK; // ≈768
const R = P.style.rootRadius * PK;
const PR = P.style.panelRadius * PK;
const PERSP = 2400;
const EXPLODE = 24;
const STAGGER = 5;
const ASSEMBLE = 108;
const BACK = 3;
const BACK_DUR = 14;

const L: Look = { ...LOOKS.porcelain, accent: Q.accent, ink: Q.ink, ink2: Q.muted, ink3: Q.muted2, shadow: Q.shadow, bg: [Q.bg, Q.bg2, Q.bg3] };

type Piece = { src: string; r: { x: number; y: number; w: number; h: number }; crop?: { x: number; y: number; w: number; h: number; tw: number; th: number }; radius: number | string };
type Layer = { key: string; z: number; side: 'L' | 'R'; pieces: Piece[]; anchor: { x: number; y: number; w: number; h: number } };

const pk = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x * PK, y: r.y * PK, w: r.w * PK, h: r.h * PK });
const bbox = (rs: { x: number; y: number; w: number; h: number }[]) => {
  const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

const statPieces: Piece[] = P.stat.map((s) => ({
  src: 'textures/portal-stats.png',
  r: pk(s),
  crop: { x: (s.x - P.statRow.x) * PK, y: (s.y - P.statRow.y) * PK, w: s.w * PK, h: s.h * PK, tw: P.statRow.w * PK, th: P.statRow.h * PK },
  radius: P.style.statRadius * PK,
}));

// 底 → 顶（页面越靠上的层越高）
const LAYERS: Layer[] = [
  { key: 'side', z: 150, side: 'L', pieces: [{ src: 'textures/portal-sidebar.png', r: pk(P.sidebar), radius: `${R}px 0 0 ${R}px` }], anchor: pk(P.sidebar) },
  {
    key: 'charts', z: 270, side: 'L',
    pieces: [
      { src: 'textures/portal-income.png', r: pk(P.income), radius: PR },
      { src: 'textures/portal-trend.png', r: pk(P.trend), radius: PR },
    ],
    anchor: bbox([pk(P.income), pk(P.trend)]),
  },
  { key: 'apps', z: 400, side: 'R', pieces: [{ src: 'textures/portal-apps.png', r: pk(P.apps), radius: PR }], anchor: pk(P.apps) },
  { key: 'flow', z: 520, side: 'R', pieces: [{ src: 'textures/portal-flow.png', r: pk(P.flow), radius: PR }], anchor: pk(P.flow) },
  { key: 'stats', z: 640, side: 'R', pieces: statPieces, anchor: bbox(statPieces.map((p) => p.r)) },
];
const N = LAYERS.length;

const PieceView: React.FC<{ p: Piece; dz: number; lifted: number }> = ({ p, dz, lifted }) => (
  <>
    {lifted > 0.02 && (
      <div style={{ position: 'absolute', left: p.r.x, top: p.r.y, width: p.r.w, height: p.r.h, borderRadius: p.radius, background: '#B6C4DE', transform: `translateZ(${Math.max(2.5, dz - 8).toFixed(2)}px)` }} />
    )}
    <div
      style={{
        position: 'absolute', left: p.r.x, top: p.r.y, width: p.r.w, height: p.r.h, borderRadius: p.radius, overflow: 'hidden',
        transform: `translateZ(${dz.toFixed(2)}px)`,
        boxShadow: lifted > 0.02 ? `0 0 0 2px ${alpha('#ffffff', 0.9 * lifted)}` : undefined,
        ...(p.crop
          ? { backgroundImage: `url(${staticFile(p.src)})`, backgroundSize: `${p.crop.tw}px ${p.crop.th}px`, backgroundPosition: `${-p.crop.x}px ${-p.crop.y}px` }
          : {}),
      }}
    >
      {!p.crop && <Img src={staticFile(p.src)} style={{ position: 'absolute', left: 0, top: 0, width: p.r.w, height: p.r.h }} />}
    </div>
  </>
);

type Cam = { rx: number; rz: number; s: number; cx: number; cy: number };
const camAt = (f: number): Cam => {
  const orbit = ramp(f, 30, 74, EASE.smooth);
  const push = ramp(f, 0, 170, EASE.smooth);
  const outro = ramp(f, 132, 30, EASE.smooth);
  const tall = ramp(f, 22, 40, EASE.smooth) * (1 - ramp(f, 106, 30, EASE.smooth));
  return {
    rx: mix(54, 50, orbit),
    rz: mix(-34, -32, ramp(f, 0, 30, EASE.out)) + 10 * orbit,
    s: mix(0.62, 0.5, tall) * mix(1, 1.04, push),
    cx: mix(-20, 190, outro),
    cy: mix(30, 150, tall) + 80 * outro,
  };
};
const project = (c: Cam, px: number, py: number, pz: number) => {
  const X = px - W / 2, Y = py - H / 2;
  const a = (c.rz * Math.PI) / 180, b = (c.rx * Math.PI) / 180;
  const x1 = X * Math.cos(a) - Y * Math.sin(a);
  const y1 = X * Math.sin(a) + Y * Math.cos(a);
  const y2 = y1 * Math.cos(b) - pz * Math.sin(b);
  const z2 = y1 * Math.sin(b) + pz * Math.cos(b);
  const x4 = x1 * c.s + c.cx, y4 = y2 * c.s + c.cy;
  const k = PERSP / (PERSP - z2);
  return { x: 960 + x4 * k, y: 540 + y4 * k };
};
const layerP = (f: number, i: number) => {
  const up = springAt(f, EXPLODE + i * STAGGER, { damping: 15, stiffness: 120 });
  const down = ramp(f, ASSEMBLE + (N - 1 - i) * BACK, BACK_DUR, EASE.exit);
  return up * (1 - down);
};
const CLOSE = ASSEMBLE + (N - 1) * BACK + BACK_DUR;

export const S6Exploded: React.FC<Partial<typeof S6_DEFAULTS> & { duration?: number }> = (props) => {
  const o = { ...S6_DEFAULTS, ...props };
  const f = useCurrentFrame();
  const cam = camAt(f);
  const crouch = -6 * (ramp(f, 18, 6, EASE.out) * (1 - ramp(f, EXPLODE, 6, EASE.out)));
  const since = f - CLOSE;
  const thud = since >= 0 ? 8 * Math.exp(-since / 3) * Math.cos(since * 0.9) : 0;
  const spread = ramp(f, EXPLODE, 30, EASE.out) * (1 - ramp(f, ASSEMBLE, CLOSE - ASSEMBLE, EASE.exit));
  const sheen = ramp(f, CLOSE + 4, 24, EASE.swift);
  const labels = o.callouts.split('\n').map((l) => l.split('|'));

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: FONT_CN }}>
      <Stage look={L} keyLight={{ x: 0.36, y: 0.05 }} fill={{ x: 0.85, y: 0.9 }} />

      <AbsoluteFill style={{ perspective: PERSP }}>
        <div
          style={{
            position: 'absolute', left: 960 - W / 2, top: 540 - H / 2, width: W, height: H, transformStyle: 'preserve-3d',
            transform: `translate(${cam.cx}px, ${cam.cy + thud}px) scale(${cam.s}) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg)`,
          }}
        >
          <div
            style={{
              position: 'absolute', left: -20, top: 10, width: W + 40, height: H + 40, borderRadius: R + 20,
              background: alpha(L.shadow, 0.28 - 0.08 * spread + 0.06 * Math.max(0, thud / 8)),
              filter: `blur(${40 - 10 * Math.max(0, thud / 8)}px)`, transform: 'translateZ(-30px) translate(30px, 40px)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, borderRadius: R, background: '#C3CFE4', transform: 'translateZ(-14px)' }} />
          {/* 底板：窗口 + 工作台底色（构件已隐藏）+ 顶栏 + 构件虚线插槽 */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: R, overflow: 'hidden', boxShadow: `inset 0 0 0 2px ${L.line}` }}>
            <Img src={staticFile('textures/portal-base.png')} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
            <Img src={staticFile('textures/portal-topbar.png')} style={{ position: 'absolute', left: P.topbar.x * PK, top: P.topbar.y * PK, width: P.topbar.w * PK, height: P.topbar.h * PK }} />
            {LAYERS.flatMap((ly) => ly.pieces).map((pc, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', left: pc.r.x + 8, top: pc.r.y + 8, width: pc.r.w - 16, height: pc.r.h - 16,
                  borderRadius: typeof pc.radius === 'number' ? Math.max(8, pc.radius - 6) : 12,
                  border: `3px dashed ${alpha(L.accent, 0.3)}`, background: alpha(L.accent, 0.03), boxSizing: 'border-box', opacity: Math.min(1, spread * 2),
                }}
              />
            ))}
            <Sheen progress={sheen} color="#ffffff" strength={0.6} width={0.18} />
          </div>
          {LAYERS.map((ly, i) => {
            const p = Math.max(0, layerP(f, i));
            if (p < 0.01) return null;
            const h = ly.z * p;
            return ly.pieces.map((pc, j) => (
              <div
                key={`sh-${ly.key}-${j}`}
                style={{
                  position: 'absolute', left: pc.r.x + h * 0.18, top: pc.r.y + h * 0.26, width: pc.r.w, height: pc.r.h, borderRadius: pc.radius,
                  background: alpha(L.shadow, 0.3), filter: `blur(${(10 + h * 0.09).toFixed(1)}px)`, opacity: Math.min(1, p * 1.5) * (0.8 - h / 1400),
                  transform: 'translateZ(1px)',
                }}
              />
            ));
          })}
          {LAYERS.map((ly, i) => {
            const p = layerP(f, i);
            const z = ly.z * p + 2 + crouch;
            const lifted = Math.min(1, Math.max(0, p) * 4);
            return (
              <React.Fragment key={ly.key}>
                {ly.pieces.map((pc, j) => <PieceView key={j} p={pc} dz={z} lifted={lifted} />)}
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

      <Callouts f={f} cam={cam} labels={labels} />

      <div style={{ position: 'absolute', left: 120, top: 104 }}>
        <div style={{ opacity: ramp(f, 140, 14, EASE.out) }}>
          <QiyueWordmark size={34} gap={14} />
        </div>
        <div style={{ fontFamily: FONT_CN, fontSize: 112, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.1, color: L.ink, marginTop: 22 }}>
          <TextReveal text={o.title} by="char" variant="rise" start={144} each={18} gap={4} />
        </div>
        <div
          style={{
            fontFamily: FONT_CN, fontSize: 42, fontWeight: 500, letterSpacing: '0.02em', color: L.ink2, marginTop: 20,
            opacity: ramp(f, 156, 14, EASE.out), transform: `translateY(${(1 - ramp(f, 156, 14, EASE.out)) * 16}px)`,
          }}
        >
          {o.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const COL = { L: 470, R: 1420 }; // 右栏左对齐线内收 30px：最长说明 14 字×32px 不出 96px 安全边
const Callouts: React.FC<{ f: number; cam: Cam; labels: string[][] }> = ({ f, cam, labels }) => {
  const items = LAYERS.map((ly, i) => {
    const z = ly.z * layerP(f, i) + 2;
    const a0 = ly.anchor;
    const cs = [[a0.x, a0.y], [a0.x + a0.w, a0.y], [a0.x, a0.y + a0.h], [a0.x + a0.w, a0.y + a0.h]].map(([x, y]) => project(cam, x, y, z));
    cs.sort((u, v) => (ly.side === 'L' ? u.x - v.x : v.x - u.x));
    return { ly, i, a: { x: (cs[0].x + cs[1].x) / 2, y: (cs[0].y + cs[1].y) / 2 } };
  });
  const placed: { it: (typeof items)[number]; y: number }[] = [];
  (['L', 'R'] as const).forEach((sd) => {
    const col = items.filter((it) => it.ly.side === sd).sort((u, v) => u.a.y - v.a.y);
    const ys: number[] = [];
    col.forEach((it, k) => { ys[k] = k === 0 ? Math.max(150, it.a.y) : Math.max(ys[k - 1] + 140, it.a.y); });
    const over = (ys[ys.length - 1] ?? 0) - 940;
    col.forEach((it, k) => placed.push({ it, y: ys[k] - Math.max(0, over) }));
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {placed.map(({ it, y: ly }) => {
        const start = 52 + it.i * 6;
        const draw = ramp(f, start, 8, EASE.out);
        const rise = ramp(f, start + 6, 12, EASE.snappy);
        const out = ramp(f, 104 + (N - 1 - it.i) * 2, 8, EASE.exit);
        if (draw <= 0 || out >= 1) return null;
        const L_ = it.ly.side === 'L';
        const ax = it.a.x, ay = it.a.y;
        const ex = L_ ? COL.L + 24 : COL.R - 24;
        const kx = L_ ? Math.min(ax - 40, ex + 70) : Math.max(ax + 40, ex - 70);
        const len = Math.abs(kx - ax) + Math.hypot(ex - kx, ly - ay);
        const [t, d] = labels[it.i] ?? ['', ''];
        return (
          <React.Fragment key={it.ly.key}>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - out }}>
              <path d={`M${ax},${ay} L${kx},${ay} L${ex},${ly}`} fill="none" stroke={L.accent} strokeWidth={2.5} strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
              <circle cx={ax} cy={ay} r={9 * Math.min(1, draw * 3)} fill={L.accent} stroke="#fff" strokeWidth={4} />
            </svg>
            <div
              style={{
                position: 'absolute', top: ly - 34, opacity: rise * (1 - out),
                ...(L_ ? { right: 1920 - COL.L, textAlign: 'right' as const } : { left: COL.R }),
                transform: `translateY(${(1 - rise) * 22 + out * -10}px)`,
                fontFamily: FONT_CN,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, justifyContent: L_ ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: L.accent, fontVariantNumeric: 'tabular-nums' }}>{String(it.i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 44, fontWeight: 700, color: L.ink, letterSpacing: '0.02em' }}>{t}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 500, color: L.ink2, marginTop: 6, whiteSpace: 'nowrap' }}>{d}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
