// 「经营概览」看板世界坐标 —— S3（crane）/ S4（AI 景深背景）/ S5（row-embed）共用同一套几何，
// 保证镜头之间取景无缝。纹理：public/textures/cap-dash-{full,empty}.png（6x，产品能力页 .qiyue-dashboard 正视截图）。
import React from 'react';
import { Img, staticFile } from 'remotion';
import layout from '../layout.json';

export const CAP = layout.cap;
export const WW = 1500; // 终帧（相机 1:1）时看板在世界里的宽度
export const K = WW / CAP.root.w; // 世界 px / 页面 CSS px
export const WH = CAP.root.h * K;
export const WX = (1920 - WW) / 2;
export const WY = 40;

export type Rect = { x: number; y: number; w: number; h: number };
/** 页面 CSS px 矩形 → 世界坐标 */
export const toWorld = (r: Rect): Rect => ({ x: WX + r.x * K, y: WY + r.y * K, w: r.w * K, h: r.h * K });

export const DashTexture: React.FC<{ variant: 'full' | 'empty'; elev?: number }> = ({ variant, elev = 30 }) => (
  <div
    style={{
      position: 'absolute',
      left: WX,
      top: WY,
      width: WW,
      height: WH,
      borderRadius: CAP.style.rootRadius * K,
      overflow: 'hidden',
      boxShadow:
        `0 ${(0.5 + elev * 0.06).toFixed(1)}px ${(1 + elev * 0.18).toFixed(1)}px rgba(12,31,74,${(0.12 / (1 + elev / 24)).toFixed(3)}), ` +
        `0 ${(elev * 0.55).toFixed(1)}px ${(elev * 1.3).toFixed(1)}px ${(-elev * 0.22).toFixed(1)}px rgba(12,31,74,${(0.08 + (Math.min(elev, 64) / 64) * 0.2).toFixed(3)}), ` +
        `0 ${elev * 2}px ${elev * 4}px -${elev}px rgba(12,31,74,0.12)`,
    }}
  >
    <Img src={staticFile(`textures/cap-dash-${variant}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: WW, height: WH }} />
  </div>
);
