// 企悦品牌件（替换 demos/_fixtures/Brand.tsx 的 video-shotcraft 标志 / 字标）。
// 标志只有官网的 256px PNG（qiyuee.com/favicon.png），不重绘、不改色；最大显示尺寸控制在 ≤256px。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { FONT_CN, Q } from '../theme';

export const QIYUE = {
  name: '企悦业务协同系统',
  short: '企悦',
  kicker: '企业业务协同平台',
  slogan: '让协同，更简单',
  motto: '专业 · 高效 · 安全 · 协同',
  url: 'qiyuee.com',
} as const;

// 标志 PNG 的有效内容框（原图 256×256 中 x 5–253、y 33–208）→ 按宽度显示时的纵横比
export const MARK_ASPECT = 175 / 248;

export const QiyueMark: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 96, style }) => (
  <div style={{ width: size, height: size * MARK_ASPECT, position: 'relative', overflow: 'hidden', ...style }}>
    <Img
      src={staticFile('brand/qiyue-logo.png')}
      style={{ position: 'absolute', width: (size * 256) / 248, left: (-size * 5) / 248, top: (-size * 33) / 248 }}
    />
  </div>
);

export const QiyueWordmark: React.FC<{
  size?: number; color?: string; mark?: boolean; gap?: number; weight?: number; style?: React.CSSProperties;
}> = ({ size = 64, color = Q.ink, mark = true, gap, weight = 700, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: gap ?? size * 0.45, ...style }}>
    {mark && <QiyueMark size={size * 1.35} />}
    <span style={{ fontFamily: FONT_CN, fontSize: size, fontWeight: weight, lineHeight: 1, letterSpacing: '0.02em', color, whiteSpace: 'nowrap' }}>
      {QIYUE.name}
    </span>
  </div>
);
