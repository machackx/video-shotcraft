// S5 流程审批 —— 镜头卡 row-embed（demos/ui-entrance/row-embed/RowEmbed.tsx）
// 保留：飞行体 = 截图纹理负偏移裁片（不重绘，Q1）；perspective(900) translateY(−120·air) rotateX(16°·air)；
// 下落缓动 bezier(.5,0,.8,.75)（末段带速度砸进槽位）+ scale 1.06→0.995 再 4f press 回弹；飞行段纵向运动模糊；
// 槽位接触影随接近收紧变实；空槽虚线框，落地 2f 消失；嵌入瞬间底边 2px 强调色缝从中心 5f 展开、8f 淡出；
// 相机边下摇边微推近（行雨与运镜并行），取景全程被页面铺满。
// 适配：页面 = 「经营概览」看板的「待办事项」面板（底纹理 = 隐藏了待办行的空面板，故不需要底色补丁）；
// 3 条待办行（项目立项审批 / 合同付款审批 / 员工入职确认）：cue 16/28/37（间隔 12→9 递减，越落越快），
// 飞行 12f，末行 49f 落地、强调色缝 57f 收尾，之后 ≥45f 静止读字（R1）；强调色 = 企悦蓝。
import React from 'react';
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { Grain, Vignette } from '../fixtures/Polish';
import { Q, hexA } from '../theme';
import { CAP, DashTexture, K, WH, WW, WX, WY, toWorld } from './CapWorld';

export const S5_DEFAULTS = { accent: Q.accent as string };

// 相机（世界坐标 → 屏幕；世界在 s=1 时与屏幕 1:1）。S4 的景深背景在末尾正好落到 S5_CAM0。
export const S5_CAM0 = { s: 1.9, cx: 1200, cy: 540 };
const S5_CAM1 = { s: 2.1, cx: 1225, cy: 560 };
const camEase = Easing.bezier(0.33, 0, 0.15, 1);

const CUES = [16, 28, 37];
const FLY = 12;
const FLY_EASE = Easing.bezier(0.5, 0, 0.8, 0.75);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const airOf = (frame: number, cue: number) => 1 - interpolate(frame, [cue, cue + FLY], [0, 1], { ...clamp, easing: FLY_EASE });

// 行矩形：DOM 的 <p> 只有 15px 高（图标高），上下各扩 6px 作为可见的"行卡"
const PADX = 6;
const PADY = 6.5;
const ROWS = CAP.todoRow.map((r) => toWorld({ x: r.x - PADX, y: r.y - PADY, w: r.w + PADX * 2, h: r.h + PADY * 2 }));
const fullSrc = staticFile('textures/cap-dash-full.png');

export const S5World: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => (
  <>
    <DashTexture variant="empty" elev={30} />
    {ROWS.map((r, i) => {
      const cue = CUES[i];
      const land = cue + FLY;
      const slotOp = interpolate(frame, [land, land + 2], [1, 0], clamp) * interpolate(frame, [cue - 6, cue + 4], [0.55, 1], clamp);

      let flyer: React.ReactNode = null;
      let contact: React.ReactNode = null;
      if (frame >= cue) {
        // 底纹理是空面板：落地后的行继续留在槽位里（air=0、scale=1），与纹理同像素
        const air = airOf(frame, cue);
        const p = 1 - air;
        const appear = interpolate(frame, [cue, cue + 3], [0, 1], clamp);
        const scale = frame < land ? 1.06 - 0.065 * p : interpolate(frame, [land, land + 4], [0.995, 1], { ...clamp, easing: Easing.out(Easing.quad) });
        const vy = 120 * K * (airOf(frame - 0.5, cue) - airOf(frame + 0.5, cue));
        const mb = frame < land ? Math.min(3.2 * K, vy * 0.22) : 0;
        flyer = (
          <div
            style={{
              position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: appear, zIndex: 3,
              transform: `perspective(${900 * K}px) translateY(${(-120 * K * air).toFixed(2)}px) rotateX(${(16 * air).toFixed(3)}deg) scale(${scale.toFixed(4)})`,
              filter: mb > 0.25 ? `url(#q-row-mb-${i})` : undefined,
            }}
          >
            {mb > 0.25 && (
              <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
                <filter id={`q-row-mb-${i}`} x="-5%" y="-30%" width="110%" height="160%">
                  <feGaussianBlur stdDeviation={`0 ${mb.toFixed(2)}`} />
                </filter>
              </svg>
            )}
            <div
              style={{
                position: 'absolute', inset: 0, borderRadius: 8 * K * 0.5, overflow: 'hidden', backgroundColor: '#fff',
                backgroundImage: `url(${fullSrc})`,
                backgroundSize: `${WW}px ${WH}px`,
                backgroundPosition: `${-(r.x - WX)}px ${-(r.y - WY)}px`,
                boxShadow:
                  `inset 0 1px 0 rgba(255,255,255,${(0.9 * air).toFixed(3)}), ` +
                  `0 0 0 1px rgba(12,31,74,${(0.07 * air).toFixed(3)}), ` +
                  `0 ${(34 * K * air).toFixed(1)}px ${(64 * K * air).toFixed(1)}px -${(10 * K * air).toFixed(1)}px rgba(12,31,74,${(0.22 * air).toFixed(3)}), ` +
                  `0 ${(6 * K * air).toFixed(1)}px ${(14 * K * air).toFixed(1)}px rgba(12,31,74,${(0.1 * air).toFixed(3)})`,
              }}
            />
          </div>
        );
        const near = interpolate(air, [0, 0.5], [1, 0], clamp);
        const contactOp = frame < land ? near * 0.5 : interpolate(frame, [land, land + 3], [0.5, 0], clamp);
        contact = contactOp <= 0.001 ? null : (
          <div
            style={{
              position: 'absolute', left: r.x + 5 * K, top: r.y + 3 * K, width: r.w - 10 * K, height: r.h - 3 * K, borderRadius: 5 * K, zIndex: 2,
              boxShadow: `0 ${((2 + 6 * air) * K).toFixed(1)}px ${((6 + 18 * air) * K).toFixed(1)}px rgba(12,31,74,${(0.2 * contactOp).toFixed(3)})`,
            }}
          />
        );
      }

      let seam: React.ReactNode = null;
      if (frame >= land && frame < land + 8) {
        const spread = interpolate(frame, [land, land + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const seamOp = interpolate(frame, [land, land + 2, land + 8], [1, 1, 0], clamp);
        const seamW = r.w * spread;
        seam = (
          <div
            style={{
              position: 'absolute', left: r.x + (r.w - seamW) / 2, top: r.y + r.h - 2 * K * 0.6, width: seamW, height: 2 * K * 0.6, borderRadius: 2, zIndex: 4,
              background: `linear-gradient(90deg, ${hexA(accent, 0)} 0%, ${accent} 18%, #6FA6FF 50%, ${accent} 82%, ${hexA(accent, 0)} 100%)`,
              boxShadow: `0 0 ${7 * K * 0.6}px ${hexA(accent, 0.4)}`,
              opacity: seamOp,
            }}
          />
        );
      }

      return (
        <React.Fragment key={i}>
          {slotOp > 0 && (
            <div
              style={{
                position: 'absolute', left: r.x, top: r.y + 1.5 * K, width: r.w, height: r.h - 3 * K, borderRadius: 5 * K, zIndex: 1,
                border: `${0.6 * K}px dashed ${hexA(Q.muted2, 0.4)}`, boxSizing: 'border-box', background: hexA(Q.accent, 0.02), opacity: slotOp,
              }}
            />
          )}
          {contact}
          {flyer}
          {seam}
        </React.Fragment>
      );
    })}
  </>
);

export const camWorld = (s: number, cx: number, cy: number): React.CSSProperties => ({
  position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})`,
});

export const S5RowEmbed: React.FC<Partial<typeof S5_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S5_DEFAULTS, ...p };
  const duration = p.duration ?? 105;
  const frame = useCurrentFrame();
  const e = interpolate(frame, [0, duration - 1], [0, 1], { ...clamp, easing: camEase });
  const s = S5_CAM0.s + (S5_CAM1.s - S5_CAM0.s) * e;
  const cx = S5_CAM0.cx + (S5_CAM1.cx - S5_CAM0.cx) * e;
  const cy = S5_CAM0.cy + (S5_CAM1.cy - S5_CAM0.cy) * e;
  return (
    <AbsoluteFill style={{ background: Q.bg2, overflow: 'hidden' }}>
      <div style={camWorld(s, cx, cy)}>
        <S5World frame={frame} accent={o.accent} />
      </div>
      <Vignette strength={0.1} color={Q.shadow} inner={0.55} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};
