// origin: assets/lib/FlashCut.tsx（shot-transitions A 式 flash-cut）
// 改动：暖白 → 企悦冷白（站点底色系），时值不变（from = 切点 − 5，两侧各 5f）。
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const FlashCut: React.FC<{ duration?: number }> = ({ duration = 10 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, duration * 0.4, duration], [0, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: o,
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(250,252,255,0.98), rgba(236,243,255,0.6) 55%, transparent 82%)',
      }}
    />
  );
};
