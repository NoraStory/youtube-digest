# UI preview harness

Render the real extension pages (side panel and Settings) in a normal browser tab, without loading the unpacked extension. A minimal local mock, `mock-chrome.js`, stands in for the `chrome.*` APIs, so the pages run outside the extension host. Use it for screenshots and quick design checks.

## 使用方法 / Usage

```bash
node .preview/serve.mjs
```

Then open <http://127.0.0.1:8642/>:

- `/sidepanel.preview.html` — the side panel page
- `/options.preview.html` — the Settings (options) page

这个预览只用于界面展示：`chrome.storage` 是内存替身，不会保存数据；字幕抓取与 AI 功能仍需安装扩展并配置你自己的 Supadata / DeepSeek API 密钥。

The mock is a test fixture only. It is not part of the release ZIP, because packaging copies a fixed allowlist of files.
