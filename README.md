# 个人主页模板

使用 HTML、CSS 和原生 JavaScript 构建的个人主页模板，包含响应式布局、星空背景、滚动动画与邮箱复制功能。个人内容均为占位符，无需安装依赖或构建。

## 使用

点击 GitHub 的 **Use this template** 创建自己的仓库，或下载源码。在项目目录启动静态服务器：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

访问 http://127.0.0.1:8080。部署时将此目录中的页面、样式、脚本、图标和字体文件一并上传至静态网站托管服务。

## 替换内容

编辑 `index.html`：

- 页面标题、description 和 Open Graph 元信息中的名字及介绍。
- 导航名称、首屏文案、个人背景、方向、技能和签名。
- 项目名称、介绍、标签、年份及项目链接。
- 博客标题、摘要、日期和链接；填写日期时可同步设置 `datetime` 属性。
- 邮箱按钮的文本、`data-copy` 和 `data-copy-label`，三处应保持一致。
- GitHub、QQ 等社交链接。
- 页脚姓名、年份和备案号；填写真实备案信息及查询链接，不需要备案展示时可删除整个 `.beian` 容器。

`https://example.com/...` 和 `hello@example.com` 均为示例占位符，使用前请替换。`YYYY` 和 `YYYY-MM-DD` 分别为年份和日期占位符。

`favicon.svg` 为通用占位图标，可替换为自己的图标并同步更新 HTML 引用。

样式在 `styles.css`，交互在 `script.js`。`fonts/` 包含本地字体及其许可文件，请一并保留。样式保留原站的公共 CDN 备用字体地址。
