// 声音层 —— SFX 中央钉帧表 + BGM，全部从 timeline.ts 的 SHOTS / beatF 派生（sound-design §4.1 / §4.5）。
// 统一公式（sound-design §4.6）：Sequence.from = 目标峰值帧 − 音源峰值滞后帧 − 输出音轨偏移帧。
import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { BGM_START_SEC, FPS, SHOTS, TOTAL, at } from './timeline';
import sfxManifest from '../public/audio/sfx/audio-manifest.json';
import { S6_CLOSE } from './scenes/S6Exploded';

// 输出音轨偏移：本管线（Remotion 4.0.484 · AAC · 48 kHz · mp4）渲后实测，见 analysis/av-offset.json
export const OUTPUT_AUDIO_OFFSET_F = 1.27; // 8 个探针互相关一致（极差 0.02f），与 AAC encoder priming 指纹吻合

const PEAK_F: Record<string, number> = Object.fromEntries(
  sfxManifest.files.map((f) => [f.file, f.peak_rms_time_s * FPS]),
);
const DUR_F: Record<string, number> = Object.fromEntries(
  sfxManifest.files.map((f) => [f.file, Math.ceil(f.duration_s * FPS) + 2]),
);
// peakF 默认取文件 10ms 能量峰；多击样本（键盘）的全文件最大峰不等于语义落点，需显式给出锚点（sound-design §4.1）
const sfxFrom = (targetPeakF: number, file: string, peakF?: number) =>
  Math.max(0, Math.round(targetPeakF - (peakF ?? PEAK_F[file] ?? 0) - OUTPUT_AUDIO_OFFSET_F));

// 总线增益：草渲实测 −22.1 LUFS / true peak −6.5 dBFS（analysis/loudness.txt），整体 +5 dB（×1.75）
// 到约 −17 LUFS、峰值留 ≥1 dB 余量；单条 volume 封顶 1（Remotion 预览 / 渲染一致的安全区间）。
const MASTER = 1.75;
const gain = (v: number) => Math.min(1, v * MASTER);

type Cue = { from: number; src: string; volume: number; duration: number; note: string };
const cue = (targetPeakF: number, file: string, volume: number, note: string, peakF?: number): Cue => ({
  from: sfxFrom(targetPeakF, file, peakF),
  src: `audio/sfx/${file}`,
  volume: gain(volume),
  duration: DUR_F[file] ?? 60,
  note,
});

export const SFX: Cue[] = [
  // S1 品牌开场
  cue(at('open', 36), 'swell-soft.wav', 0.34, 'S1 标志压印 + 字标逐字落定'),
  cue(at('open', 92), 'whoosh-fast.wav', 0.2, 'S1 lockup 上浮退场'),
  // S2 统一平台
  cue(at('converge', 100), 'whoosh-soft.wav', 0.3, 'S2 四路来源沿曲线被吸入'),
  cue(at('converge', 120), 'thud-soft.wav', 0.42, 'S2 汇聚点接收脉冲'),
  cue(at('converge', 143), 'shimmer.wav', 0.1, 'S2 结语逐词加深'),
  cue(at('crane'), 'whoosh-fast.wav', 0.3, '白闪 #1（第 22 拍）S2 → S3'),
  // S3 经营概览
  cue(at('crane', 62), 'swell-soft.wav', 0.28, 'S3 升降臂拉升'),
  cue(at('crane', 134), 'bell-soft.wav', 0.2, 'S3 铃铛红点弹出（系统提醒，引出 AI 提问）'),
  // S4 AI 助手
  cue(at('ai', 1), 'glass-tap.wav', 0.34, 'S4 玻璃胶囊弹出落位'),
  // 第 k 个字在局部 8+5k 帧出现（k=1 → 第 13 帧）；文件首键起点 0.012s = 0.36f，之后每 5f 一键，与逐字同步
  cue(at('ai', 13), 'typing-query.wav', 0.34, 'S4 听写 10 字（首键对齐首字，5f/字）', 0.36),
  // S5 → S6
  cue(at('exploded'), 'whoosh-fast.wav', 0.32, '白闪 #2（第 48 拍 = 歌曲 drop）S5 → S6'),
  // S6 业财一体
  cue(at('exploded', 34), 'whoosh-soft.wav', 0.3, 'S6 构件沿法线炸开'),
  cue(at('exploded', S6_CLOSE), 'thud-soft.wav', 0.46, 'S6 逆序合体落座'),
  cue(at('exploded', S6_CLOSE + 12), 'shimmer.wav', 0.16, 'S6 合体后扫光'),
  // S7 移动办公
  cue(at('phone', 12), 'whoosh-soft.wav', 0.28, 'S7 手机升起'),
  cue(at('phone', 38), 'glass-tap.wav', 0.3, 'S7 左悬浮卡「待办流程」弹出 + 铃铛角标'),
  cue(at('phone', 68), 'glass-tap-b.wav', 0.32, 'S7 右悬浮卡「消息提醒」弹出 + 消息角标'),
  // S8 多行业：滚轮三次落定（双样本交替 + 音量阶梯递减，S2）
  ...[0.16, 0.36, 0.56].map((s, i) =>
    cue(at('industries', (s + 0.04) * (SHOTS.industries.duration - 1)), i % 2 ? 'tick-b.wav' : 'tick-a.wav', [0.55, 0.48, 0.42][i], `S8 滚轮落定 #${i + 1}`),
  ),
  // S9 收尾：riser → impact → shimmer（字标压印 = 第 90 拍）
  cue(at('outro', 14), 'whoosh-soft.wav', 0.24, 'S9 合影元素四方飞入'),
  cue(at('outro', 44), 'riser.wav', 0.34, 'S9 riser 铺进组装，末端直落字标'),
  cue(at('outro', 44), 'impact-deep.wav', 0.46, 'S9 企悦字标压印（全片峰值；true peak 留 ≥1 dB 余量）'),
  cue(at('outro', 64), 'shimmer.wav', 0.24, 'S9 rule 长出'),
];

// BGM 预裁文件（scripts/cut-bgm.py）：从歌曲 BGM_START_SEC（第 15 拍）再往后多裁 OUTPUT_AUDIO_OFFSET_F 帧——
// 连续音轨的补偿方向与单发 SFX 相反：成片音轨整体晚 1.27f，所以歌曲内容要提前 1.27f 才能让每一拍准时到位。
// 预裁后成片与工作台都不需要 trimBefore（工作台的音频清单没有裁切字段）。
export const BGM = {
  src: 'audio/bgm/cat-walk-cut.flac',
  startSec: BGM_START_SEC + OUTPUT_AUDIO_OFFSET_F / FPS,
  volume: gain(0.3),
};

export const Soundtrack: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm && (
      <Audio
        src={staticFile(BGM.src)}
        volume={(f) =>
          BGM.volume *
          interpolate(f, [0, 12, TOTAL - 30, TOTAL - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        }
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration} name={`sfx ${s.note}`}>
        <Audio src={staticFile(s.src)} volume={s.volume} />
      </Sequence>
    ))}
  </>
);
