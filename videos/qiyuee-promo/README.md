# 企悦业务协同系统 · 宣传片（Remotion 工程）

用 video-shotcraft「自主自由创作」模式为 https://qiyuee.com 制作的 47.4 秒产品宣传片。
设计依据（产品简报、决策表、视觉 / 动效 tokens、镜头映射、分镜、声音与卡点、偏离记录）见 [SPEC.md](SPEC.md)。

## 成片

| 文件 | 说明 |
|---|---|
| `out/qiyuee-promo.mp4` | 1920×1080 · 30 fps · h264 + AAC，带 BGM（约 −17 LUFS / true peak ≤ −1 dBTP） |
| `out/qiyuee-promo-nobgm.mp4` | 同一时间线的无 BGM 版（保留音效），方便自配音乐 |

## 九个镜头

| # | 镜头卡 | 内容 |
|---|---|---|
| S1 | brand-ink-open | 企悦标志 + 「企悦业务协同系统」压印 |
| S2 | bezier-source-converge-merge | 项目 / 人员 / 流程 / 消息汇入企悦 |
| S3 | crane-rise-reveal | 「经营概览」看板从「在岗人员 326」拉升到全景 |
| S4 | glass-pill-dictation-typing | AI 助手：「今天有哪些待办审批？」 |
| S5 | row-embed | 三条待办审批落进「待办事项」面板 |
| S6 | space-camera-moves · exploded-view | 门户工作台分层炸开：业财一体 |
| S7 | radial-ripple-phone-chips | 手机端 + 待办 / 消息悬浮卡 |
| S8 | vertical-word-roll-blur-cycle | 灵活适配 保安服务 / 电梯维保 / 资产评估 / 专业服务 |
| S9 | outro-group-photo-launch | 全片元素合影 → 字标 + 「让协同，更简单」 + qiyuee.com |

## 常用命令

```bash
npm install
npm run dev                                   # Remotion Studio 预览
npm run render                                # 带 BGM 成片 → out/qiyuee-promo.mp4
npm run render:nobgm                          # 无 BGM 版 → out/qiyuee-promo-nobgm.mp4
npx remotion still src/index.ts QiyuePromo out/qa/f0300.png --frame=300   # 单帧验收
```

在 skill 根目录打开动效工作台（多轨可视化改文案 / 颜色 / 时长 / 音效，改完直接导出）：

```bash
node workbench/scripts/open.mjs videos/qiyuee-promo
```

## 素材与声音的再生成

| 步骤 | 命令 | 说明 |
|---|---|---|
| 页面素材 | `node scripts/capture.cjs` → `python3 scripts/crop-portal.py` | 从 qiyuee.com 公开页面截 4–6× 元素纹理与坐标表；手机截图里的人名在本地抹除（原图不进库） |
| 字体子集 | `python3 scripts/subset-fonts.py ~/.local/share/fonts` | Noto Sans SC（OFL）按源码用字子集化；**改了画面文案后必须重跑** |
| BGM 节奏 | `python3 scripts/analyze-bgm.py <bgm.mp3> analysis/bgm-*.json` | 网格拟合 / kick / 能量结构 |
| BGM 预裁 | `python3 scripts/cut-bgm.py` | 按 `timeline.ts` 的拍点常量与输出偏移裁出本片那一段 |
| 音效 | `python3 scripts/make-sfx.py` | 确定性合成的原创音效（见下） |
| 对齐验收 | `python3 scripts/measure-av-offset.py out/qiyuee-promo-nobgm.mp4`、`python3 scripts/beat-check.py out/qiyuee-promo.mp4` | 输出音轨偏移、切点卡拍误差 |

时间轴唯一事实源是 `src/timeline.ts`（切点钉在 BGM 整拍上），字幕、白闪、音效都从它派生；
改镜头时长后重跑 `scripts/beat-check.py` 复核卡点。

## 关于音效

制作环境访问 Freesound 被站点返回 HTTP 403，所以本片的音效是 `scripts/make-sfx.py` 合成的原创素材，
不含第三方素材。`public/audio/sfx/audio-manifest.json` 里每条都附了 Freesound 检索词；在能访问
Freesound 的机器上，可以按 video-shotcraft `references/sfx-sourcing.md` 换成实录音效，再改
`src/audio.tsx` 的文件名并重渲。BGM 与许可说明见 `public/audio/ATTRIBUTION.md`。

## 数据与授权

- 片中界面全部来自 qiyuee.com 公开页面上的演示界面与演示数字；手机截图中的个人姓名已抹除。
- 字体：Noto Sans SC（SIL OFL 1.1）子集。BGM：Cat Walk · Arulo（Mixkit Stock Music Free License）。
- 渲染引擎 Remotion 有独立许可（个人与小团队免费，公司可能需要付费）：https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
