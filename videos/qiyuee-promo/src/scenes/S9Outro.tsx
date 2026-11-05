// S9 品牌收尾 —— 镜头卡 outro-group-photo-launch（demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx）
// 保留（参数原样）：9 个元素 cue 4 起每 3f、飞 12f、bezier(0.34,1.4,0.44,1) 真过冲（y1>1）、飞行中 rot×2→settled、
// scale ×1.12→1、按屏幕速度的方向性运动模糊（0.3×px/帧，封顶 22）、落地 cue+9→16 接触影收紧 + 1.5% 轻压；
// 渲染顺序 = cue 顺序；字标 letterpress（标志 38f 先压，字 delay=42+i·1.8、8f），42–50f 全员退后排（−12% / saturate −8%）；
// rule 58→70f 长出 + 两端 190px 延长线 8f 射出 6f 淡去；字距 62–66f 呼吸；crane perspective(1400) rotateX 4°→0 +
// scale 1.06→1（前 40f）后零速起步缓推 +0.035；开场光带 2–14f、舞台光 42→50→58f 0→0.55→0.32、确定性粒子 20 + 6 颗失焦光斑；
// 背景页 24f 内 blur 0→14；末 12f ease-in 熄灯到显式底色；outro 不加解说字幕（C1 例外）。
// 适配：合影元素 = 前 8 镜的真实代表元素（经营概览 KPI / 项目进度 / 待办面板 / AI 胶囊 / 流程进度 / 收支概览 / 手机 /
// 消息提醒悬浮卡 / 行业标签），收尾背景从亮场的门户工作台虚化页「熄灯」到官网 CTA 区同款深海军蓝（站点自有色）；
// 金尘 → 冷白浅蓝粒子；字标 = 企悦标志 + 「企悦业务协同系统」白字；rule = 标志蓝→绿渐变；
// 眉题 = 品牌标语「让协同，更简单」+ 网址 qiyuee.com。时长 165f（demo 145f，多出的 20f 全部给 sign-off hold）。
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { EASE, Grain, SpeedBlur, ramp, velocity } from '../fixtures/Polish';
import { QiyueMark, QIYUE } from '../fixtures/Brand';
import { FONT_CN, Q, hexA } from '../theme';
import layout from '../layout.json';

export const S9_DEFAULTS = {
  wordmark: QIYUE.name as string,
  wordmarkSize: 104,
  slogan: QIYUE.slogan as string,
  url: QIYUE.url as string,
  ink: '#FFFFFF',
  tagColor: '#D7E4FF',
};

const FLY_EASE = Easing.bezier(0.34, 1.4, 0.44, 1);
const CRANE_EASE = Easing.bezier(0.3, 0, 0.2, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const C = layout.cap;
const P = layout.portal;

type El = {
  key: string; cx: number; cy: number; w: number; h: number; rot: number; dx: number; dy: number; radius: number; cue: number;
  img?: string; node?: React.ReactNode;
};

const AiPillMini: React.FC = () => (
  <div
    style={{
      position: 'absolute', inset: 0, borderRadius: 999, display: 'flex', alignItems: 'center', padding: '0 14px 0 34px', boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F7FE 100%)', fontFamily: FONT_CN, fontSize: 32, fontWeight: 500, color: Q.ink,
    }}
  >
    今天有哪些待办审批？
    <div style={{ marginLeft: 'auto', width: 56, height: 56, borderRadius: 28, border: `1.5px solid ${hexA(Q.ink, 0.16)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      {[18, 10, 15, 8, 12].map((h, i) => <div key={i} style={{ width: 3.5, height: h, borderRadius: 2, background: '#4C5A78' }} />)}
    </div>
  </div>
);

const TagsMini: React.FC = () => (
  <div
    style={{
      position: 'absolute', inset: 0, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      background: '#FFFFFF', fontFamily: FONT_CN, fontSize: 28, fontWeight: 700, color: Q.accent, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}
  >
    {['保安服务', '电梯维保', '资产评估', '专业服务'].map((w, i) => (
      <React.Fragment key={w}>
        {i > 0 && <span style={{ color: hexA(Q.muted2, 0.7), fontWeight: 500 }}>·</span>}
        <span>{w}</span>
      </React.Fragment>
    ))}
  </div>
);

const PhoneMini: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, borderRadius: 30, padding: 6, boxSizing: 'border-box', background: 'linear-gradient(145deg, #3B4A68 0%, #18243D 40%, #0F1A30 100%)' }}>
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 25, overflow: 'hidden', background: '#070B14', padding: 4, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 21, overflow: 'hidden', background: '#F3F7FD' }}>
        <Img src={staticFile('textures/phone-home.png')} style={{ position: 'absolute', left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)' }} />
      </div>
    </div>
  </div>
);

// 渲染顺序 = cue 顺序（后到者叠上）
const ELS: El[] = [
  { key: 'flow', img: 'textures/portal-flow.png', w: P.flow.w * 1.1, h: P.flow.h * 1.1, cx: 960, cy: 196, rot: 0, dx: 0, dy: -200, radius: 12 * 1.1, cue: 4 },
  { key: 'chart', img: 'textures/cap-chart-card.png', w: C.chart.w * 1.25, h: C.chart.h * 1.25, cx: 300, cy: 222, rot: -5, dx: -500, dy: 0, radius: 13 * 1.25, cue: 7 },
  { key: 'msg', img: 'textures/home-chip-msg.png', w: layout.chips.card[1].w * 1.6, h: layout.chips.card[1].h * 1.6, cx: 1640, cy: 214, rot: 4, dx: 500, dy: 0, radius: 18 * 1.6, cue: 10 },
  { key: 'income', img: 'textures/portal-income.png', w: P.income.w * 1.25, h: P.income.h * 1.25, cx: 1612, cy: 892, rot: -3, dx: 450, dy: 260, radius: 12 * 1.25, cue: 13 },
  { key: 'todo', img: 'textures/cap-todo-card.png', w: C.todo.w * 1.3, h: C.todo.h * 1.3, cx: 330, cy: 862, rot: 3, dx: -400, dy: 300, radius: 13 * 1.3, cue: 16 },
  { key: 'ai', node: <AiPillMini />, w: 560, h: 80, cx: 806, cy: 872, rot: 2, dx: 0, dy: 320, radius: 40, cue: 19 },
  { key: 'kpi', img: 'textures/cap-kpi-staff.png', w: C.metric[1].w * 1.9, h: C.metric[1].h * 1.9, cx: 236, cy: 552, rot: -1.5, dx: -360, dy: 0, radius: 12 * 1.9, cue: 22 },
  { key: 'phone', node: <PhoneMini />, w: 196, h: 410, cx: 1712, cy: 588, rot: -2, dx: 380, dy: 0, radius: 30, cue: 25 },
  { key: 'tags', node: <TagsMini />, w: 680, h: 64, cx: 1060, cy: 974, rot: -1, dx: 200, dy: 300, radius: 32, cue: 28 },
];

const DUST = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 439 + 137) % 1920,
  y0: (i * 613 + 271) % 1080,
  rise: 0.3 + (i % 5) * 0.11,
  swayAmp: 9 + (i % 4) * 5,
  swayFreq: 0.022 + (i % 3) * 0.008,
  phase: (i * 0.83) % (Math.PI * 2),
  size: 2.4 + (i % 3) * 0.9,
  opacity: 0.35 + ((i * 7) % 5) * 0.09,
}));
const BOKEH = Array.from({ length: 6 }, (_, i) => ({
  x: (i * 701 + 260) % 1920,
  y0: (i * 389 + 640) % 1080,
  rise: 0.55 + (i % 3) * 0.2,
  size: 14 + (i % 3) * 7,
  opacity: 0.1 + (i % 2) * 0.06,
}));

export const S9Outro: React.FC<Partial<typeof S9_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S9_DEFAULTS, ...p };
  const frame = useCurrentFrame();
  const duration = p.duration ?? 165;
  const chars = Array.from(o.wordmark);

  // 上一镜收在纯亮底上：背景页从 6px 虚化 + 透明淡入（8f），再继续虚化到 14px，避免硬切到一张清晰整页
  const blur = interpolate(frame, [0, 24], [6, 14], { ...clamp, easing: Easing.bezier(0.4, 0, 0.4, 1) });
  const pageIn = ramp(frame, 0, 8, EASE.out);
  const dim = ramp(frame, 4, 32, EASE.smooth); // 熄灯：亮场 → 深海军蓝舞台
  const rule = interpolate(frame, [58, 70], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const tag = ramp(frame, 68, 12, EASE.out);
  const url = ramp(frame, 76, 12, EASE.out);
  const fadeOut = 1 - ramp(frame, duration - 12, 11, EASE.exit);
  const recede = interpolate(frame, [42, 50], [0, 1], clamp);
  const craneT = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: CRANE_EASE });
  const pushT = ramp(frame, 36, duration - 36, EASE.smooth);
  const camScale = 1.06 - 0.06 * craneT + 0.035 * pushT;
  const camTilt = 4 * (1 - craneT);
  const sweepX = interpolate(frame, [2, 14], [-700, 2020], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) });
  const sweepOpacity = interpolate(frame, [2, 5, 11, 14], [0, 0.12, 0.12, 0], clamp);
  const stageLight = interpolate(frame, [42, 50, 58], [0, 0.55, 0.32], clamp);
  const vignette = interpolate(frame, [42, 54], [0, 0.1], clamp);
  const ruleExt = interpolate(frame, [58, 66], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ruleExtFade = interpolate(frame, [66, 72], [1, 0], clamp);
  const wordSpacing = interpolate(frame, [62, 66], [-0.01, 0.005], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });

  return (
    <AbsoluteFill style={{ background: Q.navyBottom }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <AbsoluteFill style={{ transform: `perspective(1400px) rotateX(${camTilt}deg) scale(${camScale})`, transformOrigin: '50% 45%' }}>
          {/* 背景页：门户工作台虚化（亮场起），随后熄灯到深海军蓝舞台 */}
          <AbsoluteFill style={{ background: Q.bg2 }}>
            <div style={{ position: 'absolute', left: 960 - (P.root.w * 2.1) / 2, top: 540 - (P.root.h * 2.1) / 2, width: P.root.w * 2.1, height: P.root.h * 2.1, filter: `blur(${blur.toFixed(2)}px)`, opacity: pageIn }}>
              <Img src={staticFile('textures/portal-window.png')} style={{ width: '100%', height: '100%', borderRadius: 36 }} />
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ background: 'radial-gradient(1200px 800px at 50% 48%, rgba(247,249,252,0.82), rgba(247,249,252,0.55) 60%, rgba(247,249,252,0.35))', opacity: 1 - dim }} />
          <AbsoluteFill
            style={{
              opacity: dim * 0.96,
              background: `radial-gradient(1300px 820px at 50% 44%, ${Q.navyBright} 0%, ${Q.navyTop} 48%, ${Q.navyBottom} 100%)`,
            }}
          />

          <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {ELS.map((el) => {
              if (frame < el.cue) return null;
              const t = interpolate(frame, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE });
              const opacity = interpolate(frame, [el.cue, el.cue + 3], [0, 1], clamp);
              const x = el.dx * (1 - t);
              const y = el.dy * (1 - t);
              const rot = el.rot * (2 - t);
              const scale = 1.12 - 0.12 * t;
              const air = Math.max(0, 1 - t);
              const sh = (a: number) => `rgba(4,10,28,${a.toFixed(3)})`;
              const shadow = air > 0.01
                ? `0 ${10 + 26 * air}px ${24 + 46 * air}px ${sh(0.3 + 0.1 * air)}, 0 2px 6px ${sh(0.16)}`
                : `0 10px 24px ${sh(0.3)}, 0 2px 6px ${sh(0.16)}`;
              const posAt = (fr: number) => {
                const tt = interpolate(fr, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE });
                return [el.dx * (1 - tt), el.dy * (1 - tt)];
              };
              const vx = velocity((fr) => posAt(fr)[0], frame);
              const vy = velocity((fr) => posAt(fr)[1], frame);
              const land = interpolate(frame, [el.cue + 9, el.cue + 12, el.cue + 16], [0, 1, 0], clamp);
              return (
                <SpeedBlur key={el.key} vx={vx} vy={vy} amount={0.3} max={22}>
                  <div
                    style={{
                      position: 'absolute', left: el.cx - el.w / 2, top: el.cy - el.h / 2, width: el.w, height: el.h,
                      transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale * (1 - 0.015 * land)})`,
                      transformOrigin: 'center center', borderRadius: el.radius, overflow: 'hidden',
                      boxShadow: land > 0.01 ? `0 ${10 - 5 * land}px ${24 - 12 * land}px ${sh(0.3 + 0.08 * land)}, 0 2px 6px ${sh(0.16 + 0.06 * land)}` : shadow,
                      opacity: opacity * (1 - 0.12 * recede), filter: `saturate(${1 - 0.08 * recede})`,
                    }}
                  >
                    {el.img ? <Img src={staticFile(el.img)} style={{ position: 'absolute', inset: 0, width: el.w, height: el.h, display: 'block' }} /> : el.node}
                  </div>
                </SpeedBlur>
              );
            })}
          </AbsoluteFill>
        </AbsoluteFill>

        {/* 冷白浅蓝粒子（index 派生，确定性） */}
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: dim }}>
          {DUST.map((d, i) => {
            const y = (((d.y0 - frame * d.rise) % 1080) + 1080) % 1080;
            const x = d.x + Math.sin(frame * d.swayFreq + d.phase) * d.swayAmp;
            const twinkle = 0.7 + 0.3 * Math.sin(frame * 0.21 + d.phase * 3);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: x, top: y, width: d.size, height: d.size, borderRadius: '50%', background: '#DCEBFF',
                  opacity: d.opacity * twinkle, boxShadow: `0 0 ${d.size * 2.5}px ${d.size * 0.6}px rgba(150,195,255,0.55)`,
                }}
              />
            );
          })}
          {BOKEH.map((b, i) => {
            const y = (((b.y0 - frame * b.rise) % 1180) + 1180) % 1180 - 50;
            return (
              <div
                key={`b${i}`}
                style={{
                  position: 'absolute', left: b.x, top: y, width: b.size, height: b.size, borderRadius: '50%', opacity: b.opacity, filter: 'blur(2px)',
                  background: 'radial-gradient(circle, rgba(200,225,255,0.9) 0%, rgba(160,200,255,0.35) 55%, rgba(160,200,255,0) 72%)',
                }}
              />
            );
          })}
        </AbsoluteFill>

        {sweepOpacity > 0 && (
          <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: sweepX - 300, width: 600, background: 'linear-gradient(90deg, rgba(235,244,255,0), rgba(235,244,255,1) 50%, rgba(235,244,255,0))', opacity: sweepOpacity }} />
          </AbsoluteFill>
        )}
        {stageLight > 0 && (
          <AbsoluteFill style={{ pointerEvents: 'none', opacity: stageLight, background: 'radial-gradient(760px 380px at 960px 480px, rgba(80,140,255,0.75), rgba(47,124,255,0.28) 55%, rgba(47,124,255,0) 75%)' }} />
        )}
        {vignette > 0 && (
          <AbsoluteFill style={{ pointerEvents: 'none', opacity: vignette, background: 'radial-gradient(1400px 900px at 50% 50%, rgba(4,10,28,0) 55%, rgba(4,10,28,0.8) 100%)' }} />
        )}

        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', fontFamily: FONT_CN }}>
          <div style={{ textAlign: 'center', marginTop: -20 }}>
            <div
              style={{
                fontSize: o.wordmarkSize, fontWeight: 700, lineHeight: 1.18, color: o.ink, letterSpacing: `${0.04 + wordSpacing}em`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textShadow: '0 2px 0 rgba(4,10,28,0.35), 0 18px 40px rgba(4,10,28,0.45)',
              }}
            >
              {(() => {
                const t = interpolate(frame, [38, 46], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                return (
                  <div style={{ marginRight: 40, opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: t < 0.995 ? `blur(${(1 - t) * 8}px)` : undefined }}>
                    <QiyueMark size={156} />
                  </div>
                );
              })()}
              {chars.map((ch, i) => {
                const delay = Math.round(42 + i * 1.8);
                const t = interpolate(frame, [delay, delay + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                return (
                  <span key={i} style={{ opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: `blur(${(1 - t) * 8}px)`, display: 'inline-block' }}>
                    {ch}
                  </span>
                );
              })}
            </div>
            <div style={{ position: 'relative', height: 6, width: 280, margin: '38px auto 0' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: `linear-gradient(90deg, ${Q.logoBlue}, ${Q.logoGreen})`, transform: `scaleX(${rule})` }} />
              {ruleExt > 0 && ruleExtFade > 0 && (
                <>
                  <div style={{ position: 'absolute', top: 2.5, height: 1, right: '100%', width: 190 * ruleExt, background: Q.logoBlue, opacity: ruleExtFade }} />
                  <div style={{ position: 'absolute', top: 2.5, height: 1, left: '100%', width: 190 * ruleExt, background: Q.logoGreen, opacity: ruleExtFade }} />
                </>
              )}
            </div>
            <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: '0.24em', color: o.tagColor, marginTop: 34, opacity: tag, transform: `translateY(${(1 - tag) * 6}px)` }}>
              {o.slogan}
            </div>
            <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: '0.1em', color: hexA('#AFC6EE', 0.95), marginTop: 18, opacity: url, transform: `translateY(${(1 - url) * 6}px)` }}>
              {o.url}
            </div>
          </div>
        </AbsoluteFill>
        <Grain opacity={0.045} blend="soft-light" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
