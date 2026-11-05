// 成片主合成：镜头 <Sequence> 全部按 timeline.ts 的 SHOTS 排；叠加层（白闪 / 字幕）与音频同源派生。
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { CAPTIONS, FLASH_CUTS, SHOTS, SHOT_ORDER, type ShotKey } from './timeline';
import { Q } from './theme';
import { ensureFonts } from './fonts';
import { FlashCut } from './lib/FlashCut';
import { Caption } from './lib/Caption';
import { Soundtrack } from './audio';
import { S1Open } from './scenes/S1Open';
import { S2Converge } from './scenes/S2Converge';
import { S3Crane } from './scenes/S3Crane';
import { S4AiPill } from './scenes/S4AiPill';
import { S5RowEmbed } from './scenes/S5RowEmbed';
import { S6Exploded } from './scenes/S6Exploded';
import { S7Phone } from './scenes/S7Phone';
import { S8Industries } from './scenes/S8Industries';
import { S9Outro } from './scenes/S9Outro';

export const SCENES: Record<ShotKey, React.FC<{ duration?: number }>> = {
  open: S1Open,
  converge: S2Converge,
  crane: S3Crane,
  ai: S4AiPill,
  rows: S5RowEmbed,
  exploded: S6Exploded,
  phone: S7Phone,
  industries: S8Industries,
  outro: S9Outro,
};

export const QiyueMain: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ background: Q.bg }}>
      {SHOT_ORDER.map((k) => {
        const C = SCENES[k];
        return (
          <Sequence key={k} from={SHOTS[k].from} durationInFrames={SHOTS[k].duration} name={k}>
            <C duration={SHOTS[k].duration} />
          </Sequence>
        );
      })}
      {CAPTIONS.map((c, i) => (
        <Sequence key={`cap${i}`} from={c.from} durationInFrames={c.duration} name={`caption-${i + 1}`}>
          <Caption text={c.text} duration={c.duration} />
        </Sequence>
      ))}
      {FLASH_CUTS.map((cut, i) => (
        <Sequence key={`flash${i}`} from={cut - 5} durationInFrames={10} name={`flash-${i + 1}`}>
          <FlashCut duration={10} />
        </Sequence>
      ))}
      <Soundtrack bgm={bgm} />
    </AbsoluteFill>
  );
};
