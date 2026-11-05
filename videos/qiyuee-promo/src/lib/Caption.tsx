// origin: assets/lib/Caption.tsx（模板解说条）
// 改动：按审美准则 Q11 提到叙事字幕档（58px，有效字高 ≥56px）；中文无衬线；左侧蓝色方点保留为企悦蓝；
// 白色磨砂底托住文字，压在亮色界面上仍可读。入出场 8f 轻推，与模板同式。
import { interpolate, useCurrentFrame } from 'remotion';
import { FONT_CN, Q, hexA } from '../theme';

export const CAPTION_DEFAULTS = {
  fontSize: 58,
  color: Q.ink as string,
  accent: Q.accent as string,
};

export const Caption: React.FC<{ text: string; duration: number; bottom?: number } & Partial<typeof CAPTION_DEFAULTS>> = ({
  text,
  duration,
  bottom = 64,
  fontSize = CAPTION_DEFAULTS.fontSize,
  color = CAPTION_DEFAULTS.color,
  accent = CAPTION_DEFAULTS.accent,
}) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outT = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: inT * outT,
        transform: `translateY(${(1 - inT) * 10}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '18px 40px 20px 34px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(14px) saturate(1.2)',
          border: `1px solid ${hexA(Q.line, 0.9)}`,
          boxShadow: `0 10px 30px -12px ${hexA(Q.shadow, 0.28)}, 0 2px 6px ${hexA(Q.shadow, 0.08)}`,
          fontFamily: FONT_CN,
          fontSize,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 4, background: accent, display: 'inline-block', flex: '0 0 auto' }} />
        <span>{text}</span>
      </div>
    </div>
  );
};
