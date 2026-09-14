// Preview server: renders the real extension pages in a normal browser tab
// without loading the unpacked extension. A minimal chrome.* mock
// (mock-chrome.js in this folder) stands in for the extension APIs.
//
// Usage: node .preview/serve.mjs   (then open http://127.0.0.1:8642/)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 8642;
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

/**
 * Rewrites relative asset URLs so the preview page can live under /.preview/
 * while styles and scripts still load from the repository root, then injects
 * the chrome.* mock before any extension script runs.
 */
function renderPreviewPage(pageName) {
  const source = fs.readFileSync(path.join(root, pageName), "utf8");
  const absolutized = source
    .replace(/href="(?!https?:|#|\/\/|\/)([^"]+)"/g, 'href="/$1"')
    .replace(/src="(?!https?:|\/\/|\/)([^"]+)"/g, 'src="/$1"');
  return absolutized.replace(
    "<head>",
    '<head>\n    <script src="/.preview/mock-chrome.js"></script>',
  );
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

  if (requestPath === "/" || requestPath === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      [
        "<!doctype html>",
        '<html lang="en"><head><meta charset="utf-8"><title>YouTube Digest preview</title></head>',
        '<body style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto;">',
        "<h1>YouTube Digest UI preview</h1>",
        '<ul><li><a href="/sidepanel.preview.html">Side panel</a></li>',
        '<li><a href="/options.preview.html">Settings (options)</a></li></ul>',
        "<p>A local chrome.* mock stands in for the extension APIs, so these are the real pages rendered outside the extension host.</p>",
        "</body></html>",
      ].join("\n"),
    );
    return;
  }

  if (requestPath === "/sidepanel.preview.html") {
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    res.end(renderPreviewPage("sidepanel.html"));
    return;
  }

  if (requestPath === "/options.preview.html") {
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    res.end(renderPreviewPage("options.html"));
    return;
  }

  const resolved = path.normalize(path.join(root, requestPath));
  if (!resolved.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }
  serveFile(res, resolved);
});

server.listen(port, host, () => {
  console.log(`YouTube Digest preview: http://${host}:${port}/`);
});
