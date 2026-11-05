// capture.cjs — 企悦宣传片素材采集（阶段 4，按 SPEC.md 分镜定稿后执行）
//
// 改编自 assets/scripts/capture-template.mjs 的三件套思路：
//   1. 元素级高倍纹理（看板整体 6x / 门户工作台 4x，供 2.5D 相机特写不糊，Q2）
//   2. per-element cutout（透明底，供炸开分层 / 合影飞入）
//   3. layout.json（每个元素相对其根元素的 CSS px bbox，供动画按真实版式定位）
//
// 数据口径（SPEC §0）：公开演示数字保留；页面里出现的人名「刘朵」在截图前从 DOM 抹去。
// 运行：node scripts/capture.cjs  （需要 playwright；字体需本机安装 Noto Sans SC）
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/textures');
const LAYOUT = path.join(ROOT, 'src/layout.json');
fs.mkdirSync(OUT, { recursive: true });

const settle = async (page, ms = 800) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
};

// 抹去个人信息：任何文本节点里的「刘朵」，连同前面的中文逗号一起删除
const redact = (page) =>
  page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.includes('刘朵')) n.nodeValue = n.nodeValue.replace(/[，,]?\s*刘朵/g, '');
    }
    return document.body.innerText.includes('刘朵');
  });

// 记录 selector 列表相对 root 的 bbox（CSS px）
const boxes = (page, rootSel, map) =>
  page.evaluate(
    ([rootSel, map]) => {
      const root = document.querySelector(rootSel).getBoundingClientRect();
      const rel = (el) => {
        const r = el.getBoundingClientRect();
        return { x: +(r.x - root.x).toFixed(2), y: +(r.y - root.y).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
      };
      const out = { root: { w: +root.width.toFixed(2), h: +root.height.toFixed(2) } };
      for (const [k, sel] of Object.entries(map)) {
        const els = [...document.querySelectorAll(sel)];
        out[k] = els.length === 1 ? rel(els[0]) : els.map(rel);
      }
      return out;
    },
    [rootSel, map],
  );

const shot = async (page, sel, file, opts = {}) => {
  const el = page.locator(sel).nth(opts.nth ?? 0);
  await el.screenshot({ path: path.join(OUT, file), omitBackground: opts.omit ?? true, animations: 'disabled' });
  console.log('  ✓', file);
};

const setVis = (page, sel, vis) =>
  page.evaluate(([sel, vis]) => document.querySelectorAll(sel).forEach((e) => (e.style.visibility = vis)), [sel, vis]);

(async () => {
  const browser = await chromium.launch();
  const layout = {};

  // ———————————————— A. 产品能力页「经营概览」看板（6x）————————————————
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 6, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto('https://qiyuee.com/capabilities', { waitUntil: 'networkidle' });
    await settle(page, 1500);
    console.log('capabilities: name left after redact =', await redact(page));
    // 去掉 hero 里的 3D 倾斜与入场动画，隐藏叠在看板上的手机，只留看板本体（正视、平面）
    await page.addStyleTag({
      content: `
      .qiyue-capabilities-visual, .qiyue-capabilities-visual * { animation: none !important; transition: none !important; }
      .qiyue-capabilities-visual { transform: none !important; }
      .qiyue-dashboard { transform: none !important; }
      .qiyue-capabilities-visual > *:not(.qiyue-dashboard) { visibility: hidden !important; }`,
    });
    await settle(page, 600);
    layout.cap = await boxes(page, '.qiyue-dashboard', {
      body: '.qiyue-dashboard__body',
      header: '.qiyue-dashboard__header',
      metrics: '.qiyue-dashboard__metrics',
      metric: '.qiyue-dashboard__metrics > div',
      chart: '.qiyue-dashboard__chart-card',
      bars: '.qiyue-dashboard__bars > i',
      todo: '.qiyue-dashboard__todo-card',
      todoTitle: '.qiyue-dashboard__todo-card .qiyue-dashboard__card-title',
      todoRow: '.qiyue-dashboard__todo-card > p',
      metricValue: '.qiyue-dashboard__metrics > div > strong',
      bell: '.qiyue-dashboard__header svg',
    });
    // 动态数字 / 圆角需要的样式（KPI 计数覆盖层按同字号同色重绘）
    layout.cap.style = await page.evaluate(() => {
      const cs = (sel) => getComputedStyle(document.querySelector(sel));
      const v = cs('.qiyue-dashboard__metrics > div > strong');
      return {
        rootRadius: parseFloat(cs('.qiyue-dashboard').borderTopLeftRadius),
        bodyRadius: parseFloat(cs('.qiyue-dashboard__body').borderTopLeftRadius),
        cardRadius: parseFloat(cs('.qiyue-dashboard__metrics > div').borderTopLeftRadius),
        panelRadius: parseFloat(cs('.qiyue-dashboard__todo-card').borderTopLeftRadius),
        valueSize: parseFloat(v.fontSize), valueWeight: v.fontWeight, valueColor: v.color, valueLetterSpacing: v.letterSpacing,
        cardBg: cs('.qiyue-dashboard__metrics > div').backgroundColor,
      };
    });
    await shot(page, '.qiyue-dashboard', 'cap-dash-full.png');
    await setVis(page, '.qiyue-dashboard__todo-card > p', 'hidden');
    await shot(page, '.qiyue-dashboard', 'cap-dash-empty.png');
    await setVis(page, '.qiyue-dashboard__todo-card > p', '');
    // 合影用的单卡
    await shot(page, '.qiyue-dashboard__metrics > div', 'cap-kpi-staff.png', { nth: 1 });
    await shot(page, '.qiyue-dashboard__todo-card', 'cap-todo-card.png');
    await shot(page, '.qiyue-dashboard__chart-card', 'cap-chart-card.png');
    await ctx.close();
  }

  // ———————————————— B. 门户登录页「工作台」示意（4x）————————————————
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 4, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto('https://portal.qiyuee.com', { waitUntil: 'networkidle' });
    await settle(page, 1500);
    console.log('portal: name left after redact =', await redact(page));
    await page.addStyleTag({ content: `.showcase-preview *, .showcase-preview { animation: none !important; transition: none !important; }` });
    await settle(page, 400);
    layout.portal = await boxes(page, '.preview-window', {
      sidebar: '.preview-sidebar',
      body: '.preview-body',
      topbar: '.preview-topbar',
      statRow: '.preview-stat-row',
      stat: '.preview-stat',
      flow: '.preview-column-main > .preview-panel:first-child',
      chartRow: '.preview-chart-row',
      income: '.preview-chart-row > .preview-panel:nth-child(1)',
      trend: '.preview-chart-row > .preview-panel:nth-child(2)',
      apps: '.preview-apps',
      flowDot: '.preview-flow__dot',
    });
    layout.portal.style = await page.evaluate(() => {
      const cs = (sel) => getComputedStyle(document.querySelector(sel));
      return {
        rootRadius: parseFloat(cs('.preview-window').borderTopLeftRadius),
        statRadius: parseFloat(cs('.preview-stat').borderTopLeftRadius),
        panelRadius: parseFloat(cs('.preview-panel').borderTopLeftRadius),
        bodyBg: cs('.preview-body').backgroundColor,
      };
    });
    await shot(page, '.preview-window', 'portal-window.png');
    // 炸开分层：各构件独立透明底切片
    await shot(page, '.preview-sidebar', 'portal-sidebar.png');
    await shot(page, '.preview-topbar', 'portal-topbar.png');
    await shot(page, '.preview-stat-row', 'portal-stats.png');
    await shot(page, '.preview-column-main > .preview-panel:first-child', 'portal-flow.png');
    await shot(page, '.preview-chart-row > .preview-panel:nth-child(1)', 'portal-income.png');
    await shot(page, '.preview-chart-row > .preview-panel:nth-child(2)', 'portal-trend.png');
    await shot(page, '.preview-apps', 'portal-apps.png');
    // 底板：构件全部隐藏，只留窗口与 body 底色（炸开后露出空槽）
    await setVis(page, '.preview-sidebar > *, .preview-topbar, .preview-stat-row, .preview-columns', 'hidden');
    await shot(page, '.preview-window', 'portal-base.png');
    await ctx.close();
  }

  // ———————————————— C. 首页 hero 悬浮卡（4x，透明底）————————————————
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 4, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto('https://qiyuee.com/', { waitUntil: 'networkidle' });
    await settle(page, 1500);
    console.log('home: name left after redact =', await redact(page));
    await page.addStyleTag({ content: `.qiyue-home-visual *, .qiyue-home-visual { animation: none !important; transition: none !important; }` });
    await settle(page, 400);
    layout.chips = await boxes(page, '.qiyue-floating-status', { card: '.qiyue-floating-status article' });
    await shot(page, '.qiyue-floating-status article', 'home-chip-todo.png', { nth: 0 });
    await shot(page, '.qiyue-floating-status article', 'home-chip-msg.png', { nth: 1 });
    await ctx.close();
  }

  // 门户窗口下方留白裁掉：内容止于「常用应用」底边 + 18px（底板 / 侧栏纹理同步裁切，见 crop 步骤）
  const P = layout.portal;
  const H = +(P.apps.y + P.apps.h + 18).toFixed(2);
  layout.portal.cropH = H;
  layout.portal.root.h = H;
  layout.portal.sidebar.h = +(H - P.sidebar.y).toFixed(2);
  layout.portal.body.h = +(H - P.body.y).toFixed(2);
  fs.writeFileSync(LAYOUT, JSON.stringify(layout, null, 2) + '\n');
  // 裁切需要 Pillow：python3 scripts/crop-portal.py
  console.log('layout →', path.relative(ROOT, LAYOUT));
  await browser.close();
})();
