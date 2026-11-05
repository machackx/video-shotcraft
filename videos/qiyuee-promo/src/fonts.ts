// 字体：打包 Noto Sans SC（SIL OFL 1.1）的子集到 public/fonts（scripts/subset-fonts.py 按源码用字生成），
// 用 FontFace 注册为 "Qiyue Sans"，delayRender 等字体就绪后再出帧，保证换机器渲染结果一致。
import { continueRender, delayRender, staticFile } from 'remotion';

const WEIGHTS: Array<[string, string]> = [
  ['400', 'fonts/QiyueSans-Regular.woff2'],
  ['500', 'fonts/QiyueSans-Medium.woff2'],
  ['700', 'fonts/QiyueSans-Bold.woff2'],
];

let started = false;
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('load Qiyue Sans');
  Promise.all(
    WEIGHTS.map(([weight, file]) => {
      const face = new FontFace('Qiyue Sans', `url(${staticFile(file)}) format('woff2')`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('font load failed', err);
      continueRender(handle);
    });
};
