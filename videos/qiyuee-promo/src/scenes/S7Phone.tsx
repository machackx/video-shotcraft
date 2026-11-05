// S7 移动办公 —— 镜头卡 radial-ripple-phone-chips（demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx）
// 保留（参数原样）：4 层同心圆 2240/1760/1280/840px（最外两层出画）、scale 1±0.06、1.5 周期/全片、相邻相位差 1.7 rad、
// 受光上沿 + 白色发丝外缘 + 中心柔光；手机 430×900（占画高 83%）、12px 边框 + 9px 黑边 + 灵动岛 + 侧键 + 玻璃斜反光、
// 0–26f 从下方 90px snappy 升起、投影随落位收紧；chip spring（damping 13 / stiffness 190）scale 0.8→1 + 从手机侧边外移 28px、
// opacity 5f 跳满，左 37f / 右 67f，pop 后 18f 起 24f smooth 渐入 ±8px、2 周期悬浮；左下角品牌行 90f 起升起。
// 适配：暖沙 → 企悦浅蓝（同心圆由深到浅换成站点蓝灰）；暖钛边框 → 站点手机样机同款深海军蓝边框；
// 屏内 = 首页真实手机截图（人名已抹，见 scripts/crop-portal.py）。该截图只有一屏、没有可滚动的下文——
// 卡片已知坑「滚到底露白」，因此不做假滚动，改为让屏内两个真实角标（铃铛 4 / 消息 92）在对应 chip 弹出时各 pop 一次，
// 证明「里面有内容在跑」；两侧 chip = 官网 hero 上的两张真实悬浮卡（待办流程 12 / 消息提醒 92，4x 截图）。
// 左下品牌行 → 「移动办公」+ 两行说明（官网原文；单行会压到手机，故拆两行）。
import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../fixtures/Polish';
import { LOOKS, Stage, TextReveal, alpha, springAt, type Look } from '../fixtures/Look';
import { QiyueMark } from '../fixtures/Brand';
import { FONT_CN, Q, qiyueStageBg } from '../theme';
import { DIP } from '../timeline';
import layout from '../layout.json';

export const S7_DEFAULTS = {
  title: '移动办公',
  // 两行：官网产品能力页「iOS、Android、微信小程序随时处理」+ 首页副标「随时随地，高效推进每一项工作」
  subtitle: 'iOS、Android、微信小程序\n随时随地，高效推进每一项工作',
  badgeColor: '#F04438',
};

const L: Look = { ...LOOKS.porcelain, bg: ['#F4F7FC', '#EDF2FA', '#E3EAF5'], accent: Q.accent, ink: Q.ink, ink2: Q.muted, shadow: Q.shadow };
const ANIM = 168;

const RINGS = [
  { size: 2240, color: '#D5E1F3' },
  { size: 1760, color: '#DEE7F6' },
  { size: 1280, color: '#E8EEF9' },
  { size: 840, color: '#F1F5FC' },
].map((r, i) => ({ ...r, phase: i * 1.7 }));

const PW = 430;
const PH = 900;
const FRAME = 12;
const BLACK = 9;
const PX = (1920 - PW) / 2;
const PY = (1080 - PH) / 2;
const CHIP_GAP = 64;
const SCREEN_W = PW - 2 * FRAME - 2 * BLACK; // 388
const SCREEN_H = PH - 2 * FRAME - 2 * BLACK; // 858
// 截图 853×1844 → 按屏高铺满（cover），左右各裁约 4.5px
const IMG_H = SCREEN_H;
const IMG_W = (853 / 1844) * IMG_H;
const IMG_X = (SCREEN_W - IMG_W) / 2;
const imgPt = (x: number, y: number) => ({ x: IMG_X + (x / 853) * IMG_W, y: (y / 1844) * IMG_H });

// 悬浮卡（首页 .qiyue-floating-status article，190×112 css）按 2.4× 显示：卡内标签字号到 ≥32px（Q11）
const CHIP_K = 2.4;
const CHIP = layout.chips.card[0];
const CHIP_W = CHIP.w * CHIP_K;
const CHIP_H = CHIP.h * CHIP_K;

const Badge: React.FC<{ f: number; at: number; x: number; y: number; d: number; color: string }> = ({ f, at, x, y, d, color }) => {
  if (f < at) return null;
  const s = springAt(f, at, { damping: 12, stiffness: 220 });
  const ring = ramp(f, at, 22, EASE.out);
  const bump = 1 + 0.32 * Math.sin(Math.min(1, (f - at) / 10) * Math.PI) * (1 - Math.min(1, (f - at) / 14));
  return (
    <>
      <div style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: d, border: `2px solid ${alpha(color, 0.7 * (1 - ring))}`, transform: `scale(${1 + ring * 1.4})` }} />
      <div style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: d, background: alpha(color, 0.18 * (1 - ring)), transform: `scale(${(bump * (0.9 + 0.1 * s)).toFixed(3)})` }} />
    </>
  );
};

export const S7Phone: React.FC<Partial<typeof S7_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S7_DEFAULTS, ...p };
  const f = useCurrentFrame();
  const t = Math.min(1, f / (ANIM - 1));

  const rise = ramp(f, 0, 26, EASE.snappy);
  const phoneY = (1 - rise) * 90;
  const phoneOp = Math.min(1, rise * 2.2);

  const chip = (t0: number, ph: number, side: -1 | 1): React.CSSProperties => {
    const s = springAt(f, t0, { damping: 13, stiffness: 190 });
    const slide = ramp(f, t0, 20, EASE.snappy);
    const floatIn = ramp(f, t0 + 18, 24, EASE.smooth);
    const fl = Math.sin(t * Math.PI * 2 * 2 + ph) * 8 * floatIn;
    return {
      opacity: Math.min(1, Math.max(0, (f - t0) / 5)),
      transform: `translateX(${(side * (1 - slide) * -28).toFixed(2)}px) translateY(${fl.toFixed(2)}px) scale(${(0.8 + 0.2 * s).toFixed(4)})`,
      transformOrigin: side < 0 ? 'right center' : 'left center',
    };
  };
  const chipBase: React.CSSProperties = {
    position: 'absolute', width: CHIP_W, height: CHIP_H, borderRadius: 18 * CHIP_K, overflow: 'hidden',
    boxShadow: `0 0 0 1px ${alpha(L.shadow, 0.06)}, 0 3px 6px ${alpha(L.shadow, 0.08)}, 0 26px 50px -16px ${alpha(L.shadow, 0.32)}`,
  };
  const wordmark = 90;
  const duration = p.duration ?? ANIM;
  const dip = Math.max(ramp(f, duration - DIP, DIP, EASE.smooth), 1 - ramp(f, 0, DIP, EASE.smooth)); // 首 8f 从底色淡入（接 S6）、末 8f 淡到底色（接 S8）
  const bell = imgPt(698, 140);
  const msg = imgPt(598, 1688);

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT_CN }}>
      <Stage look={L} keyLight={{ x: 0.4, y: 0.0 }} fill={null} vignette={0.18} grain={0.04}>
        {RINGS.map(({ size, color, phase }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: 960 - size / 2, top: 540 - size / 2, width: size, height: size, borderRadius: '50%',
              background: `linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 40%), ${color}`,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.85), 0 0 0 1.5px rgba(255,255,255,0.55), 0 -4px 22px rgba(255,255,255,0.4), 0 10px 40px ${alpha(L.shadow, 0.05 + i * 0.012)}`,
              transform: `scale(${(1 + 0.06 * Math.sin(t * Math.PI * 2 * 1.5 + phase)).toFixed(5)})`,
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 26% 44% at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }} />
      </Stage>

      <div style={{ position: 'absolute', left: PX, top: PY, width: PW, height: PH, transform: `translateY(${phoneY.toFixed(2)}px)`, opacity: phoneOp }}>
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 70,
            boxShadow: `0 4px 10px ${alpha(L.shadow, 0.2)}, 0 ${40 + (1 - rise) * 30}px ${80 + (1 - rise) * 40}px -20px ${alpha(L.shadow, 0.42)}, 0 90px 140px -40px ${alpha(L.shadow, 0.25)}`,
          }}
        />
        {[{ side: -1, y: 190, h: 64 }, { side: -1, y: 272, h: 64 }, { side: 1, y: 230, h: 104 }].map((b, i) => (
          <div key={i} style={{ position: 'absolute', top: b.y, width: 5, height: b.h, borderRadius: 3, left: b.side < 0 ? -3.5 : PW - 1.5, background: 'linear-gradient(90deg, #1B2740, #45577A, #1B2740)' }} />
        ))}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 70, padding: FRAME,
            background: 'linear-gradient(145deg, #3B4A68 0%, #18243D 30%, #2E3D5C 55%, #0F1A30 80%, #2A3856 100%)',
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 0 0 3px rgba(5,10,25,0.35)',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 58, background: '#070B14', padding: BLACK, boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 50, background: '#F3F7FD', overflow: 'hidden' }}>
              <Img src={staticFile('textures/phone-home.png')} style={{ position: 'absolute', left: IMG_X, top: 0, width: IMG_W, height: IMG_H }} />
              <Badge f={f} at={40} x={bell.x} y={bell.y} d={26} color={o.badgeColor} />
              <Badge f={f} at={70} x={msg.x} y={msg.y} d={26} color={o.badgeColor} />
              <div style={{ position: 'absolute', left: '50%', top: 12, width: 112, height: 32, marginLeft: -56, borderRadius: 16, background: '#05080F' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(118deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.14) 44%, rgba(255,255,255,0) 56%)' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...chipBase, top: 270, right: 1920 - PX + CHIP_GAP, ...chip(37, 0, -1) }}>
        <Img src={staticFile('textures/home-chip-todo.png')} style={{ width: CHIP_W, height: CHIP_H }} />
      </div>
      <div style={{ ...chipBase, top: 540, left: PX + PW + CHIP_GAP, ...chip(67, 1.8, 1) }}>
        <Img src={staticFile('textures/home-chip-msg.png')} style={{ width: CHIP_W, height: CHIP_H }} />
      </div>

      <div style={{ position: 'absolute', left: 120, bottom: 104, color: L.ink }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ opacity: ramp(f, wordmark, 10, EASE.out), transform: `translateY(${((1 - ramp(f, wordmark, 18, EASE.snappy)) * 30).toFixed(2)}px)` }}>
            <QiyueMark size={84} />
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.15 }}>
            <TextReveal text={o.title} by="char" variant="rise" start={wordmark} each={18} gap={3} />
          </div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 500, color: L.ink2, marginTop: 12, letterSpacing: '0.02em', lineHeight: 1.45 }}>
          <TextReveal text={o.subtitle} by="word" variant="blur" start={wordmark + 8} each={16} gap={4} />
        </div>
      </div>
      {dip > 0 && <div style={{ position: 'absolute', inset: 0, background: qiyueStageBg({ x: 50, y: 34 }), opacity: dip }} />}
    </div>
  );
};
