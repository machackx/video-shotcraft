// S4 AI 助手 —— 镜头卡 glass-pill-dictation-typing（demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx）
// 保留：定宽胶囊（≈句宽 2 倍）、scale 1.25→1 snappy 20f、opacity 前 2f 跳满、落位前 14f 景深虚化 6→0px；
// backdrop-filter blur(26px) saturate(1.3) 真磨砂 + 上亮下暗体积 + 1.5px 白描边 + 顶沿渐隐高光线 + 两层落地影；
// 内嵌强调色光 90deg 0→.18@38%→.62@78%→.95@100%（光在胶囊内部）+ 右下 screen 高光；光标 f2 先行；
// 光 g = 1 − smooth(f10→f72)，同时驱动胶囊内渐层、背后"太阳"、地面反光、声波按钮（实心 → 描边）；
// 声波 5 竖条 [30,16,24,13,20] ±2.4 呼吸；光标 f66–74 撤；打字匀速、无缓动。
// 适配：暖色 → 企悦蓝（WARM = 主蓝，APRICOT = 浅天蓝）；句子 = 「今天有哪些待办审批？」（10 个汉字，
// 按真人听写语速 5f/字 匀速，窗口 8→58f，仍落在光退窗口内）；舞台 = 上一镜看板的景深虚化（磨砂玻璃后面要有东西可晕），
// 虚化期间相机悄悄推到下一镜的「待办事项」取景，末 12f 胶囊退场 + 景深回实 = 无缝接 S5；
// 底部品牌小标 → 「AI 助手 · 用自然语言查询业务数据」（≥32px，Q11）。
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from '../fixtures/Polish';
import { QiyueMark } from '../fixtures/Brand';
import { FONT_CN, Q, hexA, mixHex } from '../theme';
import { DashTexture } from './CapWorld';
import { BellAlert, Focus, S3_LAST } from './S3Crane';
import { S5World, S5_CAM0, camWorld } from './S5RowEmbed';

export const S4_DEFAULTS = {
  query: '今天有哪些待办审批？',
  label: 'AI 助手',
  sub: '用自然语言查询业务数据',
  accent: Q.accent as string,
  glow: '#7CC8FF',
};

const PW = 1100;
const PH = 132;
const PX = (1920 - PW) / 2;
const PY = 540 - PH / 2 - 40;
const BTN = 92;
const BARS = [30, 16, 24, 13, 20];
const TYPE0 = 8;
const CPF = 5;

export const S4AiPill: React.FC<Partial<typeof S4_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S4_DEFAULTS, ...p };
  const duration = p.duration ?? 105;
  const f = useCurrentFrame();
  const WARM = o.accent;
  const APRICOT = o.glow;
  const chars = Array.from(o.query);

  // —— 背景：上一镜看板 → 景深虚化 → 相机推到下一镜取景 → 回实 ——
  const blurIn = ramp(f, 0, 14, EASE.out);
  const outStart = duration - 12;
  const blurOut = ramp(f, outStart, 12, EASE.swift);
  const blur = 22 * blurIn * (1 - blurOut);
  const camE = ramp(f, 8, outStart - 10, EASE.smooth);
  const s = mix(1, S5_CAM0.s, camE);
  const cx = mix(960, S5_CAM0.cx, camE);
  const cy = mix(540, S5_CAM0.cy, camE);
  const swap = ramp(f, 12, 18, EASE.linear); // S3 末态 → S5 首态（虚化中交叉）
  const veil = 0.3 * blurIn * (1 - blurOut);

  // —— 胶囊 ——
  const appear = ramp(f, 0, 2, EASE.linear);
  const land = ramp(f, 0, 20, EASE.snappy);
  const sc = mix(1.25, 1, land);
  const defocus = 6 * (1 - ramp(f, 0, 14, EASE.out));
  const n = Math.floor(Math.min(1, Math.max(0, (f - TYPE0) / (chars.length * CPF))) * chars.length + 1e-6);
  const caret = ramp(f, 2, 2, EASE.linear) * (1 - ramp(f, 66, 8, EASE.out));
  const g = 1 - ramp(f, 10, 62, EASE.smooth);
  const exit = ramp(f, outStart, 10, EASE.exit);
  const pillOp = appear * (1 - exit);

  return (
    <AbsoluteFill style={{ background: Q.bg2, overflow: 'hidden' }}>
      {/* 景深背景（不进胶囊的 backdrop 之外的任何层） */}
      <AbsoluteFill style={{ filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <div style={camWorld(s, cx, cy)}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - swap }}>
            <DashTexture variant="empty" elev={30} />
            <Focus frame={S3_LAST} accent={o.accent} />
            <BellAlert frame={S3_LAST} color="#F04438" />
          </div>
          {swap > 0 && (
            <div style={{ position: 'absolute', inset: 0, opacity: swap }}>
              <S5World frame={0} accent={o.accent} />
              <BellAlert frame={S3_LAST} color="#F04438" />
            </div>
          )}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: hexA(Q.bg, veil) }} />

      {/* 胶囊背后的蓝色"太阳" + 地面反光：随 g 熄灭 */}
      <div
        style={{
          position: 'absolute', left: 1300, top: PY + PH / 2, width: 1100, height: 900, marginLeft: -550, marginTop: -450, borderRadius: '50%',
          opacity: ramp(f, 0, 8, EASE.out) * (1 - exit),
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${hexA(APRICOT, 0.12 + 0.5 * g)} 0%, ${hexA(APRICOT, 0.08 + 0.36 * g)} 18%, ${hexA(WARM, 0.05 + 0.22 * g)} 40%, ${hexA(WARM, 0.02 + 0.07 * g)} 62%, ${hexA(WARM, 0)} 80%)`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: PX + PW * 0.35, width: PW * 0.75, top: PY + PH * 0.9, height: 220,
          background: `radial-gradient(ellipse 50% 40% at 60% 20%, ${hexA(WARM, 0.2 * g)} 0%, ${hexA(WARM, 0)} 72%)`,
          opacity: pillOp,
        }}
      />

      {/* 胶囊本体 */}
      <div
        style={{
          position: 'absolute', left: PX, top: PY, width: PW, height: PH, borderRadius: PH / 2, overflow: 'hidden', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', padding: '0 20px 0 58px', opacity: pillOp,
          transform: `translateY(${(-24 * exit).toFixed(2)}px) scale(${(sc * (1 - 0.02 * exit)).toFixed(4)})`,
          filter: defocus > 0.05 ? `blur(${defocus.toFixed(2)}px)` : undefined,
          background: `linear-gradient(180deg, ${hexA('#ffffff', 0.66)} 0%, ${hexA('#F7FAFF', 0.46)} 55%, ${hexA('#E3ECFA', 0.54)} 100%)`,
          backdropFilter: 'blur(26px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.3)',
          border: `1.5px solid ${hexA('#ffffff', 0.85)}`,
          boxShadow:
            `0 0 0 1px ${hexA(Q.shadow, 0.07)}, inset 0 2px 0 ${hexA('#ffffff', 0.95)}, inset 0 -10px 24px ${hexA('#9FB6D9', 0.22)}, ` +
            `0 ${mix(10, 4, land).toFixed(1)}px ${mix(20, 10, land).toFixed(1)}px ${hexA(Q.shadow, 0.12)}, 0 ${mix(60, 36, land).toFixed(1)}px 70px -28px ${hexA(Q.shadow, 0.4)}, ` +
            `0 0 ${60 * g}px ${hexA(APRICOT, 0.45 * g)}`,
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: g,
            background: `linear-gradient(90deg, ${hexA(WARM, 0)} 0%, ${hexA(WARM, 0.18)} 38%, ${hexA(WARM, 0.62)} 78%, ${hexA(APRICOT, 0.95)} 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: g * 0.7, mixBlendMode: 'screen',
            background: `radial-gradient(ellipse 34% 130% at 100% 100%, ${hexA('#D6EEFF', 0.9)} 0%, ${hexA('#D6EEFF', 0)} 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute', left: PH * 0.45, right: PH * 0.45, top: 3, height: 1.5, pointerEvents: 'none',
            background: `linear-gradient(90deg, ${hexA('#ffffff', 0)}, ${hexA('#ffffff', 0.95)} 20%, ${hexA('#ffffff', 0.7)} 75%, ${hexA('#ffffff', 0)})`,
          }}
        />
        <div style={{ position: 'relative', fontFamily: FONT_CN, fontSize: 56, fontWeight: 500, letterSpacing: '0.02em', color: Q.ink, whiteSpace: 'pre', flex: 'none', lineHeight: 1.1 }}>
          {chars.slice(0, n).join('')}
        </div>
        <div style={{ position: 'relative', width: 4, height: 62, marginLeft: 6, borderRadius: 2, flex: 'none', opacity: caret, background: mixHex(Q.ink, WARM, 0.8 * g) }} />
        <div
          style={{
            position: 'relative', marginLeft: 'auto', width: BTN, height: BTN, borderRadius: BTN / 2, flex: 'none', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: `linear-gradient(180deg, ${hexA('#ffffff', 0.35 * g)}, ${hexA('#ffffff', 0)}), ${hexA(WARM, 0.92 * g)}`,
            border: `1.5px solid ${g > 0.5 ? hexA('#ffffff', 0.5) : hexA(Q.ink, 0.16 + 0.1 * (1 - g))}`,
            boxShadow: `inset 0 1.5px 0 ${hexA('#ffffff', 0.5)}, 0 ${6 * g}px ${18 * g}px -6px ${hexA(WARM, 0.8 * g)}`,
          }}
        >
          {BARS.map((h, i) => (
            <div key={i} style={{ width: 5, borderRadius: 3, height: h + 2.4 * Math.sin(f * 0.5 + i * 1.7), background: mixHex('#4C5A78', '#FFFFFF', g) }} />
          ))}
        </div>
      </div>

      {/* 功能标签：AI 助手 · 用自然语言查询业务数据 */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: PY + PH + 64, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
          opacity: ramp(f, 4, 16, EASE.out) * (1 - exit),
          transform: `translateY(${(-16 * exit).toFixed(2)}px)`,
          fontFamily: FONT_CN,
        }}
      >
        <QiyueMark size={52} />
        <span style={{ fontSize: 40, fontWeight: 700, color: Q.ink, letterSpacing: '0.02em' }}>{o.label}</span>
        <span style={{ fontSize: 40, fontWeight: 500, color: Q.muted, letterSpacing: '0.02em' }}>· {o.sub}</span>
      </div>
    </AbsoluteFill>
  );
};
