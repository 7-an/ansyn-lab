# Ansyn Lab

安寻 Ansyn 的长期个人网站 MVP：记录一个 07 后如何利用 AI、互联网和个人系统，从高中环境进入真实世界。网站是纯静态项目，不需要数据库、登录或后台服务，可部署到 Vercel、Netlify 或 Cloudflare Pages。

## 技术栈

- Astro 5 + TypeScript（严格模式）
- Astro Content Collections + Markdown
- 原生 CSS 与少量原生浏览器脚本
- Astro Sitemap 与 RSS
- ESLint + Astro Check
- Node.js 20 LTS（仓库包含 `.nvmrc`）

## 安装与本地运行

```bash
npm install
npm run dev
```

开发服务器启动后，访问终端显示的本地地址，通常为 `http://localhost:4321`。

## 检查与生产构建

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

也可以一次运行全部交付检查：

```bash
npm run check
```

静态产物生成在 `dist/`。

## 新增站内文章

1. 复制 `src/content/writing/_template.md`。
2. 在同一目录中改成英文短横线文件名，例如 `my-new-note.md`。
3. 填写 `title`、`description`、`publishDate`、`updatedDate`、`category`、`tags`、`draft`、`featured`。
4. 写完后把 `draft` 改为 `false`。
5. 运行 `npm run check`，提交并推送。

文件名会成为站内文章 URL。例如 `my-new-note.md` 对应 `/writing/my-new-note/`。

## 新增外部文章

编辑 `src/data/external-writing.ts`，在 `externalWriting` 数组中新增一项。外部文章支持 X、抖音、小红书、B站和其他平台；有正式链接时卡片会在新标签页打开原平台，不会生成空白站内详情页。

抖音文章的正式分享链接也填写在这个文件中：找到“高三提分不是靠鸡血”这一项，将空的 `externalUrl` 改成 `https://v.douyin.com/...`。无需修改组件，卡片会自动恢复可点击状态。

## 修改个人信息与社交链接

编辑 `src/config/site.ts`：

- 名称、介绍、SEO 关键词与品牌标语在 `siteConfig` 中。
- X、GitHub、邮箱在 `siteConfig.social` 中。
- 空的 GitHub 和邮箱不会显示在页面上。
- `PUBLIC_SITE_URL` 是唯一的正式站点地址入口，默认值为 `https://ansyn-lab.vercel.app`。

绑定新域名后，在部署平台把 `PUBLIC_SITE_URL` 设置为完整正式地址（包含 `https://`），重新构建即可统一更新 canonical、OG、RSS、robots 和 sitemap 的基础地址。

## 推送到 GitHub

在 GitHub 创建一个空仓库，不要额外生成 README。然后在本项目目录执行：

```bash
git add .
git commit -m "build: launch Ansyn Lab MVP"
git remote add origin https://github.com/YOUR_NAME/ansyn-lab.git
git push -u origin main
```

如果已有远程仓库，只需提交后运行 `git push`。

## 部署到 Vercel（推荐）

1. 登录 Vercel，选择 **Add New → Project**。
2. 导入刚推送的 GitHub 仓库。
3. Framework Preset 选择 **Astro**（通常会自动识别）。
4. Build Command 使用 `npm run build`。
5. Output Directory 使用 `dist`。
6. Install Command 使用 `npm install`。
7. Node.js 版本选择 20.x。
8. 添加环境变量 `PUBLIC_SITE_URL`，值先填 Vercel 分配的正式项目地址，例如 `https://ansyn-lab.vercel.app`。
9. 点击 Deploy。部署完成后，任何人都能通过 Vercel URL 访问。

Astro 已输出带目录索引的纯静态页面，因此站内详情页刷新不会依赖本地服务。后续每次向所连接的 GitHub 分支推送，Vercel 都会自动重新构建和部署。

### 绑定自定义域名

在 Vercel 项目中打开 **Settings → Domains**，添加域名并按提示设置 DNS。域名生效后，把 `PUBLIC_SITE_URL` 改成新的正式地址并重新部署。

## 其他静态平台

### Netlify

- Build command：`npm run build`
- Publish directory：`dist`
- Node.js：20.x
- 环境变量：`PUBLIC_SITE_URL=https://你的域名`

### Cloudflare Pages

- Framework preset：Astro
- Build command：`npm run build`
- Build output directory：`dist`
- Node.js：20.x
- 环境变量：`PUBLIC_SITE_URL=https://你的域名`

## 当前版本已完成

- 响应式首页：Hero、当前状态、人物介绍、三条探索方向、精选内容、当前实验、公开声明、长期方向
- Writing 列表：站内与外部文章、平台与分类筛选、缺失链接安全状态
- 三篇可访问的 Markdown 站内公开笔记与文章模板
- About 页面、移动导航和自定义 404 页面
- title、description、canonical、Open Graph、X Card、结构化数据、favicon、robots、sitemap、RSS
- 键盘操作、可见焦点、跳转链接与减少动态效果偏好
- Vercel / Netlify / Cloudflare Pages 静态部署配置说明

## 可选增强

- 深色模式（保持当前视觉原则）
- 文章全文搜索与更多筛选维度
- 实验独立详情页和按时间更新的 changelog
- 自动生成每篇文章的专属 OG 图
- 有真实需求后再接入隐私友好的访问统计
