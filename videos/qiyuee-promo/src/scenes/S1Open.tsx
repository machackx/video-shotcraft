// S1 品牌开场 —— 镜头卡 brand-ink-open（demos/typography/brand-ink-open/BrandInkOpen.tsx）
// 保留：十字准星先竖后横描画（0→9f / 8→18f）后淡出（24→34f）、字标逐字 letterpress
// （delay=10+i·3、12f、scale 1.6→1 + blur 6→0、origin center bottom、字底强调色 glint）、
// 打字机眉题 + 方块光标、完整 lockup 静止 ≥30f（R1）、退场 7–8f 上浮 40px + 缩 12% + 淡出。
// 适配：琥珀 → 企悦蓝；衬线 → 站点无衬线（Noto Sans SC 700）；准星描完后企悦标志在准星位置压印
// （同一套 letterpress 三件套）；眉题是可读信息而非装饰，打字速度按中文 2f/字（卡片：装饰小字才用 0.7f）。
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { QiyueMark, QIYUE } from '../fixtures/Brand';
import { FONT_CN, Q, qiyueStageBg } from '../theme';

export const S1_DEFAULTS = {
  wordmark: QIYUE.name as string,
  wordmarkSize: 132,
  kicker: QIYUE.kicker as string,
  kickerSize: 42,
  ink: Q.ink as string,
  accent: Q.accent as string,
  muted: Q.muted as string,
};

export const S1Open: React.FC<Partial<typeof S1_DEFAULTS> & { duration?: number }> = (p) => {
  const o = { ...S1_DEFAULTS, ...p };
  const duration = p.duration ?? 96;
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  const vDraw = interpolate(frame, [0, 9], [100, 0], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const hDraw = interpolate(frame, [8, 18], [100, 0], { ...clamp, easing: Easing.linear });
  const crossFade = interpolate(frame, [24, 34], [1, 0], clamp);

  // 标志压印：准星收笔后在同一位置落下（20→32f），与准星淡出交叠
  const markT = interpolate(frame, [20, 32], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });

  // 眉题打字机：中文 2f/字，40f 起
  const perChar = 2;
  const kickStart = 42;
  const chars = Array.from(o.kicker);
  const kickChars = Math.floor(Math.max(0, frame - kickStart) / perChar);
  const kickDone = kickStart + chars.length * perChar;
  const cursorOn = frame >= kickStart && (frame < kickDone || (frame < duration - 10 && Math.floor((frame - kickDone) / 3) % 2 === 0));

  // 退场：最后 8f 上浮 + 缩小 + 淡出（完整 lockup 在 ~58→88f 静止 30f）
  const outStart = duration - 8;
  const brandOut = interpolate(frame, [outStart, duration], [0, 1], { ...clamp, easing: Easing.bezier(0.4, 0, 0.5, 1) });

  return (
    <AbsoluteFill style={{ background: qiyueStageBg({ x: 50, y: 42 }), justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          textAlign: 'center',
          opacity: 1 - brandOut,
          transform: `translateY(${-brandOut * 40}px) scale(${1 - brandOut * 0.12})`,
        }}
      >
        <div style={{ position: 'relative', width: 150, height: 110, margin: '0 auto 40px' }}>
          <svg width={88} height={88} viewBox="0 0 64 64" style={{ position: 'absolute', left: 31, top: 11, opacity: crossFade }}>
            <line x1={32} y1={2} x2={32} y2={62} stroke={o.accent} strokeWidth={4} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={vDraw} />
            <line x1={2} y1={32} x2={62} y2={32} stroke={o.accent} strokeWidth={4} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 2,
              opacity: markT,
              transform: `scale(${1.6 - 0.6 * markT})`,
              transformOrigin: 'center bottom',
              filter: `blur(${(1 - markT) * 6}px)`,
            }}
          >
            <QiyueMark size={150} />
          </div>
        </div>

        <div
          style={{
            fontFamily: FONT_CN,
            fontSize: o.wordmarkSize,
            fontWeight: 700,
            color: o.ink,
            letterSpacing: '0.04em',
            lineHeight: 1,
            whiteSpace: 'pre',
            display: 'inline-flex',
            alignItems: 'flex-end',
          }}
        >
          {Array.from(o.wordmark).map((ch, i) => {
            const delay = 10 + i * 3;
            const t = interpolate(frame, [delay, delay + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
            const gc = delay + 12;
            const glint = interpolate(frame, [gc - 4, gc, gc + 4], [0, 1, 0], clamp);
            return (
              <span
                key={i}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  opacity: t,
                  transform: `scale(${1.6 - 0.6 * t})`,
                  transformOrigin: 'center bottom',
                  filter: `blur(${(1 - t) * 6}px)`,
                }}
              >
                {ch}
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -12,
                    transform: 'translateX(-50%)',
                    width: `${glint * 100}%`,
                    height: 3,
                    background: o.accent,
                    opacity: glint,
                    borderRadius: 2,
                  }}
                />
              </span>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: FONT_CN,
            fontSize: o.kickerSize,
            fontWeight: 500,
            letterSpacing: '0.42em',
            color: o.muted,
            marginTop: 40,
            height: 52,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span style={{ whiteSpace: 'pre' }}>{chars.slice(0, kickChars).join('')}</span>
          <span style={{ display: 'inline-block', width: 16, height: 40, marginLeft: 2, borderRadius: 3, background: o.accent, opacity: cursorOn ? 0.85 : 0 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
