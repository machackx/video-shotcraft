# 音频来源与许可

## BGM

| 文件 | 原曲 | 艺术家 | 许可 | 来源 |
|---|---|---|---|---|
| `bgm/cat-walk-cut.flac` | Cat Walk（House，130 BPM） | Arulo | Mixkit Stock Music Free License（可商用、免署名） | https://assets.mixkit.co/music/371/371.mp3 ，经 video-shotcraft `assets/audio/bgm/cat-walk.mp3`（见该仓库 `assets/audio/ATTRIBUTION.md`） |

本片只用其中一段：从 7.2126 s 起 47 s（`scripts/cut-bgm.py` 无损裁切为 FLAC），节奏分析见 `analysis/bgm-cat-walk.json`。
商用发布前请按 Mixkit 许可页复核一次条款。

## SFX

`sfx/*.wav` 全部是本片原创合成音效（`scripts/make-sfx.py`，固定随机种子，可逐字节复现），不含第三方素材。
原因：制作环境访问 Freesound（freesound.org / apiv2 / cdn.freesound.org）均被站点返回 HTTP 403，
按 video-shotcraft `references/sfx-sourcing.md` 不绕过、不改用旧库。每条音效在 `sfx/audio-manifest.json`
里附了 Freesound 检索词，网络可用时可以换成实录素材后重新钉帧。
