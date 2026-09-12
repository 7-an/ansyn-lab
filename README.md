# Ansyn Lab

第二版最终版（2026-09-10）。正式站：https://ansyn.me 。本地源代码是本站真源；设计师的 `7-an/lab` 仓库是设计参考。

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

静态产物生成在 `dist/`。开发服务器与检查/构建使用独立依赖缓存，可在本地预览运行时执行检查，避免首页动效依赖失效。

## 站点结构

- `/` 首页：原五词字符 Hero、连续地球与城市相册、KOSX 当前状态（NOW）、项目/文章/关于大字目录，以及个人联系页脚
- `/work/` 项目与交付：统一网格中的七个独立与社区协作项目，展开 VOIDTYPE 后可在黑框内体验实时粒子
- `/writing/` 公开内容：外部文章索引，文字索引与悬停图片/短视频预览，文章标题保留原文
- `/about/` 关于：参考 Dennis About 的两行大标题、照片视差、三栏能力介绍、KOSX 协作与弧形联系页脚
- `/404.html` 自定义 404 页面

全站导航共用 `src/components/Header.astro` 和 `src/lib/site-navigation.ts`：顶部 Work / Writing / About / Contact，下滑后收成圆形菜单；社交入口位于展开菜单中。首页保留头像与 Ansyn 随滚动显隐，背景音乐暂时关闭。文章一律发布在外部平台（X、抖音等），站内只保留索引，不再维护站内 Markdown 文章。

## 新增外部文章

编辑 `src/data/external-writing.ts`，在 `externalWriting` 数组中新增一项。外部文章支持 X、抖音、小红书、B站和其他平台；有正式链接时卡片会在新标签页打开原平台。

抖音文章的正式分享链接也填写在这个文件中：找到“高三提分不是靠鸡血”这一项，将空的 `externalUrl` 改成 `https://v.douyin.com/...`。无需修改组件，卡片会自动恢复可点击状态。

## 修改项目与交付

精选项目统一维护在 `src/config/projects.ts`，首页 WORK 预览与 `/work/` 共用这份内容；每项包含标题、描述、角色、交付、下一步与状态标签。KOSX 协作项目也在同一配置中维护，首页 Now at KOSX.ai 链接到组织官网。进行中的项目不包装成已完成。

首页目录在 `src/components/HomeDirectory.astro`；地球、城市记录与 Now at 在 `HomeExperience.astro`，城市照片维护于 `src/config/globe-locations.ts`。全站共享 `AboutFooter.astro` 的联系页脚。About 内容在 `AboutExperience.astro`，双语翻译在 `src/data/translations.json`。

首页每个标签页首次直接进入时播放多语言开屏；刷新跳过，站内切换保留圆弧页名转场。实现位于 `PageTransition.astro` 与 `src/lib/page-transition.ts`，Hero 动效在揭幕时开始。减少动态模式跳过开屏。

地球地图文件 `public/data/countries.json` 和翻译表必须随源码提交。根目录 `/data/` 是内部资料，仍被忽略。


## 修改个人信息与社交链接

编辑 `src/config/site.ts`：

- 名称、介绍、SEO 关键词与品牌标语在 `siteConfig` 中。
- X、GitHub、Telegram、邮箱、微信号在 `siteConfig.social` 中；为空的项目不会显示在页面上。
- KOSX 的组织名称与链接在 `siteConfig.kosx` 中。
- `PUBLIC_SITE_URL` 是唯一的正式站点地址入口，默认值为 `https://ansyn.me`。

绑定新域名后，在部署平台把 `PUBLIC_SITE_URL` 设置为完整正式地址（包含 `https://`），重新构建即可统一更新 canonical、OG、robots 和 sitemap 的基础地址。

## 搜索展示信息

首页搜索标题与摘要维护在 `src/config/site.ts`；Work、Writing、About 的独立标题和摘要维护在对应页面的 `BaseLayout` 参数中。视觉大标题与正文独立保留。新增元数据文案的中文翻译同时加入 `src/data/translations.json`，现有切换按钮会同步浏览器标题、描述及社交预览信息；当前仍是同网址切换语言，没有独立中文收录路由。

`BaseLayout.astro` 在首页输出统一的 `WebSite` 名称，在各页关联同一个 `Person`，并区分普通页面、项目/文章目录和个人介绍页。`vercel.json` 仅把 `www.ansyn.me` 永久跳转到 `ansyn.me`，保留路径和查询参数。域名重定向需要在 Vercel 部署后验证，本地 Astro 不执行此规则。

## 发布与回退

正式仓库是 `7-an/ansyn-lab`，Vercel 项目为 `ansyn-lab`，正式分支是 `main`。修改后运行 `npm run check`；经用户确认后提交并推送 `main`，等待 Vercel 成功，再实际检查 https://ansyn.me 的首页、地球、项目、文章、关于与页面转场。

第二版最终版使用标签 `v2.0.0` 保存；此前正式版为 `e2f8f60`。需要回退时，可在 Vercel 将此前成功的生产部署重新提升为正式版本，或通过新的 Git revert 提交撤回第二版发布提交。不要强推或重写历史。

部署环境的 `PUBLIC_SITE_URL` 应为 `https://ansyn.me`，用于 canonical、OG、robots 和 sitemap。构建输出为 `dist/`，不需要数据库或运行服务器。

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

- 响应式首页：五词字符 Hero、连续地球、三城照片入口、NOW、通栏目录与联系页脚
- `/work/` 项目与交付页、`/writing/` 外部文章索引（平台与分类筛选）、`/about/` 关于页、自定义 404
- 简洁主导航与 X 入口、右下角背景音乐开关（默认关闭、记住选择）
- title、description、canonical、Open Graph、X Card、结构化数据、favicon、robots、sitemap
- 键盘操作、可见焦点、跳转链接与减少动态效果偏好
- Vercel / Netlify / Cloudflare Pages 静态部署配置说明

## 可选增强

- 深色模式（保持当前视觉原则）
- 更多外部平台的文章筛选维度
- 项目按时间更新的 changelog
- 自动生成每篇文章的专属 OG 图
- 有真实需求后再接入隐私友好的访问统计
