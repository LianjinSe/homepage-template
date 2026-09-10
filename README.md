# 个人主页模板

使用 HTML、CSS 和原生 JavaScript 构建的个人主页模板，包含响应式布局、移动端导航、星空背景、滚动动画和邮箱复制功能。页面中的个人内容已替换为占位符，无需安装项目依赖或执行构建。

## 获取与预览

在 [GitHub 仓库](https://github.com/LianjinSe/homepage-template) 点击 **Use this template** 创建自己的仓库，也可以下载 ZIP 并解压，或使用 Git 克隆：

```sh
git clone https://github.com/LianjinSe/homepage-template.git
cd homepage-template
```

在包含 `index.html` 的目录运行以下命令（需要安装 Python 3）：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 [本地预览](http://127.0.0.1:8080/)，按 `Ctrl+C` 停止服务器。Windows 环境可将 `python3` 替换为 `py -3`。

## 文件结构

```text
.
├── index.html       # 页面内容、元信息和链接
├── styles.css       # 样式、响应式布局和动画
├── script.js        # 导航、邮箱复制等交互
├── favicon.svg      # 通用占位图标
├── fonts/           # 本地字体及对应许可文件
├── LICENSE          # 项目 MIT 协议
└── README.md
```

## 自定义内容

编辑 `index.html`，替换以下内容：

- 页面标题、description、Open Graph 元信息和导航中的名字。
- 首屏文案、个人介绍、方向、技能、状态和签名。
- 项目名称、介绍、标签、年份、链接和链接的 `aria-label`。
- 博客标题、摘要、链接和日期；将 `YYYY-MM-DD` 替换为真实日期，并填写对应的 `datetime` 属性，例如 `2026-09-10`。
- 邮箱按钮的显示文本、`data-copy` 和 `data-copy-label`，三处应保持一致。
- GitHub、QQ 等社交链接。
- 页脚姓名、`YYYY` 年份和备案信息；如需展示备案信息，填写自己的备案号和查询链接，否则删除整个 `.beian` 容器。

所有 `https://example.com/...` 链接及 `hello@example.com` 邮箱都是占位符，使用前请替换。替换 `favicon.svg` 时，如文件名或格式发生变化，请同步修改 HTML 中的图标引用。

样式修改见 `styles.css`，交互修改见 `script.js`。字体优先使用 `fonts/` 中的本地文件，中文字体还配置了公共 CDN 备用地址。

## 部署

将 `index.html`、`styles.css`、`script.js`、`favicon.svg` 和完整的 `fonts/` 目录上传到静态网站托管服务，保持相对目录结构，并随分发保留本项目和字体的许可文件。无需构建命令。

公开 GitHub 仓库用于分发源码；如需网页访问地址，还需要配置 GitHub Pages 或其他静态网站托管服务。

## 开源协议与字体许可

本项目原创代码、文档和占位图标采用 [MIT License](LICENSE)，版权归 LianjinSe 所有。使用、修改或分发时，请保留 MIT 版权声明和许可文本。

第三方字体不适用本项目的 MIT 协议，继续按 **SIL Open Font License 1.1（OFL-1.1）** 授权：

| 资源 | 版权声明与许可文件 |
| --- | --- |
| `fonts/jetbrains-mono-*.woff2`（Regular、Medium、SemiBold、Bold） | Copyright 2020 The JetBrains Mono Project Authors；[JetBrains Mono 许可](fonts/OFL-JetBrains-Mono.txt) |
| `fonts/noto-serif-sc-600.woff2`（Noto Serif SC） | 随附声明为 Copyright 2012 Google Inc.；[Noto Serif SC 许可](fonts/OFL-Noto-Serif-SC.txt) |
| 随附 Source Han Serif 版权声明 | Copyright 2017–2022 Adobe，Reserved Font Name 为 “Source”；[Source Han Serif 许可](fonts/OFL-Source-Han-Serif.txt) |

`fonts/` 同时保留了 Source Han Serif 的许可声明；目录中没有单独以 Source Han Serif 命名的字体文件。分发字体时请保留随附的版权与许可文件，修改字体时遵守 OFL 中的保留字体名称等条款。完整授权条件以对应许可文本为准。
