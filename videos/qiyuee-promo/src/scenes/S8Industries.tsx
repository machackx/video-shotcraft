// S8 多行业适配 —— 镜头卡 vertical-word-roll-blur-cycle（demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle.tsx）
// 保留（参数原样）：设计坐标 480×270；ROW 44、mask 露三行 + 上下柔边；STEPS [0.16,0.36,0.56] 每段窗 0.11；
// 每步 0.7·outQuint + 0.3·outBack；距离驱动纵向 blur（邻行 3px、最远 5px）+ 按滚轮速度叠 ≤4px 纵向运动模糊；
// opacity 1−0.65d / 远行 max(0.1, 0.35−0.23(d−1))；滚筒曲面压扁 ≤14%；落定染色 1−2.4d（灰 → 强调色）；
// 句干与滚轮同字号同字重、句干钉死；收尾 seg(0.9, 0.985) 整组淡出。
// 适配：句干 = 「灵活适配」，四个行业词 = 官网产品能力页原文（保安服务 / 电梯维保 / 资产评估 / 专业服务），
// 四词等长 4 字，mask 宽度按 4 个汉字重量（130 设计 px，卡片已知坑：换词表必须重量宽度）；
// 中文 30 设计 px 用 Bold 700（Noto Sans SC 无 800）；强调色 = 企悦蓝；
// 句子下方加一行官网原文说明（按角色配置），与整组同步淡出，不参与滚动（句干钉死不受影响）。
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DesignStage, E, seg } from '../fixtures/Motion';
import { Grain } from '../fixtures/Polish';
import { FONT_CN, Q, mixHex, qiyueStageBg } from '../theme';

export const S8_DEFAULTS = {
  stem: '灵活适配',
  words: '保安服务|电梯维保|资产评估|专业服务',
  note: '权限、菜单和流程，按企业组织与岗位灵活配置',
  accent: Q.accent as string,
};

const ANIM = 150;
const ROW = 44;
const STEPS = [0.16, 0.36, 0.56];
const MASK_W = 130;
const ACCENT_DIM = '#B9C3D3';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const reelAt = (t: number) => {
  let p = 0;
  for (const s of STEPS) {
    const u = seg(t, s, s + 0.11);
    p += 0.7 * E.outQuint(u) + 0.3 * E.outBack(u);
  }
  return p;
};
const DT = 0.5 / (ANIM - 1);

export const S8Industries: React.FC<Partial<typeof S8_DEFAULTS> & { duration?: number }> = (props) => {
  const o = { ...S8_DEFAULTS, ...props };
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / (ANIM - 1));
  const words = o.words.split('|');
  const p = reelAt(t);
  const speed = Math.abs(reelAt(t + DT) - reelAt(t - DT));
  const motionBlur = Math.min(4, speed * ROW * 0.22);
  const groupOp = 1 - seg(t, 0.9, 0.985) * 0.999;
  const noteIn = seg(t, 0.2, 0.3, E.outCubic);

  return (
    <div style={{ position: 'absolute', inset: 0, background: qiyueStageBg({ x: 50, y: 34 }) }}>
      <DesignStage bg="transparent" raster="zoom">
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_CN }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: groupOp, marginTop: 10 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: Q.ink, letterSpacing: 1 }}>{o.stem}</div>
            <div
              style={{
                position: 'relative', height: ROW * 3, width: MASK_W, overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 26%, #000 74%, transparent 100%)',
                maskImage: 'linear-gradient(180deg, transparent 0%, #000 26%, #000 74%, transparent 100%)',
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${ROW - p * ROW}px)` }}>
                {words.map((w, i) => {
                  const d = Math.abs(i - p);
                  const blur = (d < 1 ? 3 * d : 3 + 2 * Math.min(d - 1, 1)) + motionBlur;
                  const op = d < 1 ? 1 - 0.65 * d : Math.max(0.1, 0.35 - 0.23 * (d - 1));
                  const squash = 1 - 0.14 * Math.min(1, d / 1.4);
                  const fid = `q-vroll-${i}`;
                  return (
                    <div key={i} style={{ position: 'relative', height: ROW }}>
                      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
                        <filter id={fid} x="-10%" y="-120%" width="120%" height="340%" colorInterpolationFilters="sRGB">
                          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
                        </filter>
                      </svg>
                      <div
                        style={{
                          height: ROW, display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap',
                          filter: blur > 0.05 ? `url(#${fid})` : undefined,
                          opacity: op,
                          transform: `scaleY(${squash.toFixed(4)})`,
                          color: mixHex(ACCENT_DIM, o.accent, clamp01(1 - d * 2.4)),
                        }}
                      >
                        {w}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 6, fontSize: 10, fontWeight: 500, color: Q.muted, letterSpacing: 0.3,
              opacity: noteIn * groupOp, transform: `translateY(${((1 - noteIn) * 3).toFixed(2)}px)`,
            }}
          >
            {o.note}
          </div>
        </div>
      </DesignStage>
      <Grain opacity={0.04} />
    </div>
  );
};
