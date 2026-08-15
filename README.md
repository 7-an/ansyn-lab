# Ansyn Lab

安寻 Ansyn 的长期个人网站：记录一个 07 后如何利用 AI、互联网和个人系统，从高中环境进入真实世界。网站是纯静态项目，不需要数据库、登录或后台服务，可部署到 Vercel、Netlify 或 Cloudflare Pages。

## 技术栈

- Astro 5 + TypeScript（严格模式）
- 原生 CSS 与少量原生浏览器脚本
- Astro Sitemap
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

静态产物生成在 `dist/`。

## 站点结构

- `/` 首页：粒子头像 Hero、图像化当前坐标，以及项目与文章双导航卡
- `/work/` 项目与交付：独立项目与组织协作的项目卡（角色、交付、下一步），以及「我能干什么」
- `/writing/` 公开内容：外部文章索引，支持按平台与分类筛选
- `/about/` 关于：完整故事与记录原则
- `/404.html` 自定义 404 页面

社交图标在右上角导航；背景音乐开关在右下角。文章一律发布在外部平台（X、抖音等），站内只保留索引，不再维护站内 Markdown 文章。

## 新增外部文章

编辑 `src/data/external-writing.ts`，在 `externalWriting` 数组中新增一项。外部文章支持 X、抖音、小红书、B站和其他平台；有正式链接时卡片会在新标签页打开原平台。

抖音文章的正式分享链接也填写在这个文件中：找到“高三提分不是靠鸡血”这一项，将空的 `externalUrl` 改成 `https://v.douyin.com/...`。无需修改组件，卡片会自动恢复可点击状态。

## 修改项目与交付

首页与 `/work/` 的项目内容直接维护在 `src/pages/index.astro` 与 `src/pages/work.astro` 顶部的数组中，每项包含标题、描述、角色、交付、下一步与状态标签。进行中的项目不包装成已完成。

## 修改个人信息与社交链接

编辑 `src/config/site.ts`：

- 名称、介绍、SEO 关键词与品牌标语在 `siteConfig` 中。
- X、GitHub、Telegram、邮箱、微信号在 `siteConfig.social` 中；为空的项目不会显示在页面上。
- KOSX 的组织名称与链接在 `siteConfig.kosx` 中。
- `PUBLIC_SITE_URL` 是唯一的正式站点地址入口，默认值为 `https://ansyn-lab.vercel.app`。

绑定新域名后，在部署平台把 `PUBLIC_SITE_URL` 设置为完整正式地址（包含 `https://`），重新构建即可统一更新 canonical、OG、robots 和 sitemap 的基础地址。

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

Astro 已输出带目录索引的纯静态页面，因此站内页面刷新不会依赖本地服务。后续每次向所连接的 GitHub 分支推送，Vercel 都会自动重新构建和部署。

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

- 响应式首页：粒子头像、两张现场证据图、KOSX 与当前坐标合并、项目与文章双导航卡
- `/work/` 项目与交付页、`/writing/` 外部文章索引（平台与分类筛选）、`/about/` 关于页、自定义 404
- 右上角社交图标（X / Telegram）、右下角背景音乐开关（默认开启、记住选择）
- title、description、canonical、Open Graph、X Card、结构化数据、favicon、robots、sitemap
- 键盘操作、可见焦点、跳转链接与减少动态效果偏好
- Vercel / Netlify / Cloudflare Pages 静态部署配置说明

## 可选增强

- 深色模式（保持当前视觉原则）
- 更多外部平台的文章筛选维度
- 项目按时间更新的 changelog
- 自动生成每篇文章的专属 OG 图
- 有真实需求后再接入隐私友好的访问统计
