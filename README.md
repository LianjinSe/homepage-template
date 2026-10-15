# 个人主页模板

带夜海背景与玻璃面板的个人主页模板，使用 HTML、CSS 和原生 JavaScript。无需安装依赖或构建。

页面使用通用头像、示例项目与占位联系方式，不包含作者的个人介绍、实际项目、域名、邮箱、社交账号或备案信息。MIT 版权署名与第三方资源许可按原许可保留。

## 功能

- 居中头像与个人介绍、悬浮导航和夜海背景。
- 关于、完整项目列表、博客、联系按顺序展开，顶部导航与首屏按钮跳转到对应位置。
- 深色 / 浅色模式，自动记住选择。
- 手机折叠菜单、响应式布局和键盘导航。
- 关于介绍与项目直接呈现在页面中，邮件联系保留独立对话框。
- 首屏错峰淡入、一次性滚动显现、悬停反馈和阅读进度，适配减少动态效果偏好。
- 邮箱复制；浏览器拒绝剪贴板访问时可手动复制或打开邮件应用。
- 中文宋体和英文等宽字体，随附本地字体文件。

## 获取与预览

点击仓库顶部的 **Use this template** 创建自己的仓库，也可以下载 ZIP 并解压。然后在项目目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

打开 [本地预览](http://127.0.0.1:8080/)。Windows 可以将 `python3` 替换为 `py -3`。

## 文件结构

```text
index.html          页面内容、元信息、链接与对话框
styles.css          字体、主题与响应式布局
script.js           菜单、主题、对话框和复制交互
favicon.svg         通用头像及站点图标占位图
assets/
  icons/                    Tabler 图标及许可证
fonts/              本地字体及许可文件
LICENSE             项目 MIT 许可证
```

## 替换为你的内容

编辑 `index.html`：

1. 替换 `Your Name`、页面标题、description 和 Open Graph 文案。
2. 替换首屏标题、自我介绍、座右铭、三个技术方向，以及「关于」分区中的内容。
3. 替换项目一、二、三的名称、描述与链接；增删项目时同步调整显示的序号。
4. 替换示例文章标题、摘要、链接和日期；示例日期 `2026-01-01` 应更新为实际发布日期，并同步修改可见文本和 `datetime` 属性。
5. 将所有 `hello@example.com` 改成你的邮箱，包含 `mailto:`、对话框地址和无脚本备用内容。复制按钮直接读取 `.email-address` 的文本，无需再修改 JavaScript。
6. 替换 GitHub、QQ、博客等 `https://example.com/...` 链接；不需要的入口可以直接删除。
7. 更新页脚年份、姓名与个人签名。需要备案展示时，在页脚预留注释处加入你自己的备案号与官方查询链接。

替换 `favicon.svg` 可同时更新导航头像、首屏头像、对话框头像和站点图标。如使用新的文件名或格式，应更新 HTML 中全部引用及图标 MIME 类型。发布社交分享图时，可自行增加使用绝对 URL 的 `og:image` 元信息。

修改颜色、字体、圆角和布局时编辑 `styles.css`。主题偏好存储键为 `homepage-theme`；同一域名下部署多个模板时，可以在 `index.html` 和 `script.js` 中同时更改此键，隔离各站点的设置。

## 发布前检查

- 搜索 `Your Name`、`example.com`、`项目名称`、`示例` 和 `在这里`，确认占位内容均已处理。
- 检查手机布局、所有项目/文章链接和社交入口。
- 测试主题切换、锚点跳转、导航菜单、邮件对话框、邮箱复制以及减少动态效果设置。
- 检查页面标题、描述、头像、日期和页脚内容。

## 部署

将 `index.html`、`styles.css`、`script.js`、`favicon.svg`、完整的 `assets/` 与 `fonts/` 目录上传到静态托管服务，保持目录结构。无需构建命令。更新 CSS/JS 时，同步更新 HTML 中相应资源 URL 的版本查询参数，避免旧缓存。

可以使用 GitHub Pages 或其他静态托管服务。仓库本身不配置自动发布流程。

## 资源与许可

- 本项目代码、文档及通用占位图标采用 [MIT License](LICENSE)。再分发时保留版权与许可文本。
- 图标来自 [Tabler Icons](https://github.com/tabler/tabler-icons)，v3.35.0，MIT；完整许可位于 `assets/icons/LICENSE.txt`。
- 夜海壁纸以参考图轮廓进行离线 SVG 描摹，补入天空渐变与星点；只分发静态矢量路径，作为模板源码随 MIT 许可分发。
- JetBrains Mono 字体采用 SIL Open Font License 1.1，见 `fonts/OFL-JetBrains-Mono.txt`。
- Noto Serif SC 字体采用 SIL Open Font License 1.1，见 `fonts/OFL-Noto-Serif-SC.txt`。
- 随附 Source Han Serif 版权与许可声明见 `fonts/OFL-Source-Han-Serif.txt`；目录中无单独以 Source Han Serif 命名的字体文件。

第三方字体及图标遵循各自许可证，不适用本项目代码的 MIT 授权声明。

## 静态 SVG 壁纸

壁纸保留细致的夜海 SVG 轮廓、天空渐变与星点，完整内联在 `index.html` 的 `.coast-art` 中。没有背景动画、播放按钮、壁纸控制脚本或持续渲染循环；不使用 Canvas、WebGL 或背景位图。

为保留细节，SVG 源码约 2 MB，建议部署时启用 HTML gzip 压缩。页面导航、主题切换、邮箱复制等功能由 `script.js` 提供。
