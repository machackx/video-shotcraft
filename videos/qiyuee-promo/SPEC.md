# 企悦业务协同系统 · 宣传片设计 spec

- 模式：**自主自由创作**（用户 2026-11-05 选定）。阶段 0–3 由 Agent 自主判断并记录在此，不逐阶段确认。
- 目标产品：https://qiyuee.com （企悦业务协同系统，淇岳科技）
- 规格：1920×1080 · 30fps · h264 · 中文 · 约 43s · 带 BGM 版 + 无 BGM 版（保留 SFX）

---

## 0. 产品简报

| 项 | 内容（证据来源） |
|---|---|
| 产品 | 企悦业务协同系统 —— 企业业务协同平台（首页 eyebrow「企业业务协同平台」） |
| 主张 | 「让协同，更简单」；「一套系统，连接项目、人员、流程与消息」（首页 H1 / 副标） |
| 受众 | 中小企业管理者、业务与财务负责人；示例行业：保安服务、电梯维保、资产评估、专业服务（产品能力页） |
| 六大能力 | 项目协同 · 人员与考勤 · 流程审批 · 合同与财务 · 移动办公 · AI 助手（首页 / 产品能力页） |
| 多端 | 电脑端门户 portal.qiyuee.com；iOS、Android、微信小程序（下载页：iOS 与小程序标「即将开放」） |
| 品牌短句 | 「专业 · 高效 · 安全 · 协同」（页脚） |
| 用途 | 官网 / 企业宣传横屏短片（未指定 → Agent 判断：官网首屏与销售演示通用的 16:9） |

### 需求到执行决策表

| 需求 / 缺省项 | 决策 | 对本片的影响 |
|---|---|---|
| 用途、受众未指定 | 官网与销售演示用的 B2B 品牌短片 | 能量取「专业信赖」预设，中低开场、发布会式收尾 |
| 时长未指定 | ~43s（9 镜） | 六大能力 + 统一平台 + 多行业 + 品牌，各一镜，不重复 |
| 画幅未指定 | 16:9 1920×1080 | 素材全部来自桌面端页面，横屏信息密度最合适 |
| 语言 | 中文 | 字体用站点 CSS 字体栈中可自由分发的 Noto Sans SC（PingFang SC 不可分发） |
| 素材：登录后真实系统不可得 | 只用公开页面：产品能力页「经营概览」看板、登录页「工作台」看板、首页手机截图与悬浮卡 | 所有界面镜头都是这三处的真实截图 / 元素切片，不手搓复刻 |
| 数据口径 | 看板数字（58 / 326 / 12 / 92%、28 / 7 / 1,280.00 / 3,650.00 / 2,680.00）是官网公开展示的演示数据，保留；手机截图里的人名「刘朵」视为个人信息，采集时抹去（问候语只留「晚上好」） | 片中不出现任何真实人名 |
| 「即将开放」的 iOS / 小程序 | 只沿用官网自己的说法「iOS、Android、微信小程序随时处理」，不说「已上架 / 立即下载」 | 不做可用性承诺 |
| AI 助手在公开页面无界面 | 用手搓的「玻璃输入胶囊」表现「用自然语言提问」（非复刻场景，Q1 允许），答案落回真实看板（下一镜的待办行） | 不虚构 AI 回答界面 |
| 音频未指定 | 阶段 6 由 Agent 从库内 BGM 选型 + Freesound SFX；时间线按内容节奏排、不强行卡拍（music-beat-sync §0） | 交付带 BGM / 无 BGM 两版 |

---

## 1. 视觉方向

**选定方向：「晴空工作台」——直接从产品自身长出来的浅色企业蓝。** 底色是站点的雾白蓝，界面以真实截图出现，
文字、字幕、标注、光效全部使用站点 tokens；只有收尾的品牌峰值借用站点 CTA 区的深海军蓝渐变做反差。

备选（未选）：B「深海军蓝夜场」——全片用 CTA 深蓝做暗场霓虹，炫但偏离站点整体浅色调；C「纸面简报」——
暖白纸张 + 衬线，与产品现代无衬线风格冲突。

**跳过 styleframe 的理由**：官网本身就是严格的品牌规范（字体、色板、圆角、图标库均从 computed styles 与
资源直接提取），且片中界面全部是真实截图；字体与配色在阶段 5 首批静帧中逐镜验证。

### 视觉 tokens（站点 computed styles 实测）

| token | 值 | 用途 |
|---|---|---|
| bg | `#F7F9FC`（body）/ `#F2F6FC` | 全片底色 |
| surface | `#FFFFFF`，描边 `#E6ECF5` | 卡片 / 胶囊 |
| ink | `#102146`（标题）/ `#162133`（正文） | 标题、字幕 |
| muted | `#667085` / `#7D8CA4` | 副文 |
| accent | `#2F7CFF` | 主强调（按钮、数据包、强调缝、落定染色） |
| indigo | `#5267DF` | 次强调 |
| 能力色 | 绿 `#25B96F` · 紫 `#8B5CF6` · 橙 `#F79009` · 青 `#15A9C7` | 六大能力图标底色，只在对应元素出现 |
| logo 渐变 | 蓝 `#017FF7` → 绿 `#01D696` | 标志、品牌峰值光 |
| navy CTA | `#13295A → #1E4FB8` 渐变 | 收尾舞台背景 |
| 字体 | Noto Sans SC 400 / 500 / 700（站点栈 PingFang SC → Microsoft YaHei → Noto Sans SC） | 全片 |
| 圆角 | 卡 16–20px，按钮 10px，胶囊全圆 | |
| 图标 | Lucide 线性图标（站点同款，stroke 2） | 来源节点、标注 |

### 动效性格 tokens（预设「专业信赖」，向「亲和」微调）

- 能量轴：低-中（企业 B2B）；调性轴：严肃偏友好（圆角 + 亮蓝）。
- 主时长 ~21f；淡入 / 推移类 `bezier(0, 0, 0.2, 1)`，不过冲；**落地类动作**（行嵌入、chip pop、合影落位）保留各卡调校过的过冲（y1>1）。
- 三个词：稳、清晰、轻盈 —— 与「专业 · 高效 · 安全 · 协同」对得上。
- 不加手持抖动（Q3）；光效只给主角一次且裁进圆角（Q4）。

---

## 2. 功能到镜头映射

| 功能 | 镜头卡 · 变体 | demo 源码 | 选择依据 |
|---|---|---|---|
| 品牌开场 | brand-ink-open | demos/typography/brand-ink-open/BrandInkOpen.tsx | 低能量起步、字标 hold 1s（R1）；墨线 / 琥珀重新蒙皮为企悦蓝 |
| 统一平台（连接项目、人员、流程、消息） | bezier-source-converge-merge | demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx | 「多源汇聚到单一入口」与官网主张逐字对应；汇聚点换成企悦标志 |
| 项目协同 + 人员与考勤（经营概览） | crane-rise-reveal | demos/opening/crane-rise-reveal/CraneRiseReveal.tsx | 从「在岗人员 326」一格特写拉升到整面看板 = 「一屏掌握」 |
| AI 助手 | glass-pill-dictation-typing | demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx | 全片最安静的一拍；输入「今天有哪些待办审批？」引出下一镜 |
| 流程审批 | row-embed | demos/ui-entrance/row-embed/RowEmbed.tsx | 待办行从空中降下嵌入「待办事项」面板 = AI 提问的答案落地 |
| 合同与财务（业财一体，门户工作台） | space-camera-moves · exploded-view | demos/camera/space-camera-moves/ExplodedView.tsx | 工作台按构件炸开：导航 / 流程进度 / 收支图表 / 指标 / 常用应用，讲「一体化由什么组成」，全片中段高点 |
| 移动办公 | radial-ripple-phone-chips | demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx | 首页 hero 本身就是「手机 + 两侧悬浮卡」，直接用真实手机截图与悬浮卡 |
| 多行业适配 | vertical-word-roll-blur-cycle | demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle.tsx | 「灵活适配 ___」句干 + 四个行业滚轮 |
| 品牌收尾 | outro-group-photo-launch | demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx | 全片元素回来合影，能量峰值（Q8） |
| 接缝 | shot-transitions · A flash-cut | assets/lib/FlashCut.tsx | 亮场页面→页面，白闪盖切；全片 2 处 |

一种手法只当一次主角（P4）：描画 / 汇聚 / 拉升 / 打字 / 行嵌入 / 炸开 / 呼吸定格 / 滚轮 / 合影各一次。

---

## 3. 分镜（30fps，单一事实源 `src/timeline.ts` 的 `SHOTS`）

| # | 时间 | 镜头 | 画面与关键动效 | 文案 | 转场 / SFX |
|---|---|---|---|---|---|
| S1 | 0.0–3.2s | brand-ink-open | 雾白底；蓝色十字准星描画 → 企悦标志压印 → 「企悦业务协同系统」逐字压印 → 眉题打字 → hold 1s → 上浮淡出 | 企悦业务协同系统 / 企业业务协同平台 | 字标落定 soft；退场 whoosh |
| S2 | 3.2–8.8s | bezier-source-converge-merge | 四个白瓷节点「项目 / 人员 / 流程 / 消息」（Lucide 图标）贝塞尔接通 → 沿曲线被吸入企悦标志 → 通路擦除 → 结语 | 一套系统，连接项目、人员、流程与消息 | 吞并脉冲 soft impact；出镜白闪 |
| S3 | 8.8–14.3s | crane-rise-reveal | 经营概览看板：3.0× 特写「在岗人员 326」→ 升降臂拉升到整面看板，行洗光逐行扫过，KPI 计数与拉升同收；待办面板此时为空槽 | 字幕：项目、人员与经营数据，一屏掌握 | 拉升 riser/whoosh |
| S4 | 14.3–17.8s | glass-pill-dictation-typing | 看板退成磨砂景深，玻璃胶囊弹出，蓝光随打字退去 | 胶囊内：今天有哪些待办审批？ 下方标签：AI 助手 · 用自然语言查询业务数据 | 胶囊弹出 pop；打字键盘声 |
| S5 | 17.8–21.3s | row-embed | 景深回实，镜头在「待办事项」面板；三条待办行（项目立项审批 / 合同付款审批 / 员工入职确认）越落越快嵌入，底边亮蓝缝 | 字幕：流程审批：待办与进度，实时可见 | 段落切入 soft；出镜白闪 |
| S6 | 21.3–27.0s | exploded-view | 门户工作台 3/4 轴测平躺 → 五层构件炸开悬停 + 编号标注 → 逆序合体落锤 → 标题 | 标注：导航 / 流程进度 / 收支概览 / 实时指标 / 常用应用；标题：业财一体 / 审批、合同、开票、收付款，一体化管理 | 炸开 whoosh；合体 impact |
| S7 | 27.0–32.6s | radial-ripple-phone-chips | 浅蓝同心圆呼吸，手机（首页真实截图，人名已抹）升起；左右悬浮卡「待办流程 12」「消息提醒 92」先后弹出 | 左下：移动办公 / iOS、Android、微信小程序，随时处理 | 手机落位 soft；chip pop ×2 |
| S8 | 32.6–37.6s | vertical-word-roll-blur-cycle | 句干「灵活适配」钉死，滚轮 保安服务 → 电梯维保 → 资产评估 → 专业服务，落定染蓝 | 灵活适配 保安服务 / 电梯维保 / 资产评估 / 专业服务 | 每次落定轻机械 tick（双样本交替） |
| S9 | 37.6–43.1s | outro-group-photo-launch | 深海军蓝舞台；看板卡、待办行、AI 胶囊、手机、指标卡等从四方飞入合影 → 企悦标志 + 字标压印 → rule + 标语 + 网址 → hold ≥1s | 企悦业务协同系统 / 让协同，更简单 / qiyuee.com | riser → impact → sparkle |

能量曲线：低（S1）→ 中（S2）→ 中高（S3）→ 低（S4 呼吸）→ 中（S5）→ 高（S6）→ 低（S7）→ 中（S8）→ 峰值（S9）。

### 帧级时间轴

见 `src/timeline.ts`（`SHOTS` 为唯一事实源，字幕、转场、SFX 均由它派生）。验收帧：每镜头入场中 / 动作峰值 / 落定后三帧，
列在 `src/timeline.ts` 的 `QA_FRAMES`。

---

## 4. 有意识的偏离 / 适配记录

- 各 demo 的品牌件（video-shotcraft 标志、琥珀 / 赤陶 / 紫色强调）全部换成企悦标志与站点 tokens。
- crane-rise-reveal 追踪对象由「表格行」改为看板 KPI 行（看板为卡片网格而非表格），行洗光按卡片行带触发。
- exploded-view 五层构件来自门户登录页的工作台示意（DOM 元素逐块截图）；标注文字 ≥32px（Q11）。
- radial-ripple-phone-chips 的屏内 feed：真实手机截图仅一屏，滚动行程按截图实际可滚高度缩短，避免滚到底露白（卡片已知坑）。
- 收尾舞台用站点 CTA 区的深海军蓝渐变（站点自有色），粒子改为冷白 / 浅蓝，不用金尘。
