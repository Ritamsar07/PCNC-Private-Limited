// Local preview server for the PCNC site. Run with: node serve.js
// Then open http://localhost:8099 in your browser.
// This file is only for previewing on your own machine, your real host
// (itzcrm.com or wherever you deploy) will serve the site with its own
// server, this script is not part of the deployed site.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8099;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";

    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("403 Forbidden");
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      fs.readFile(filePath, (err2, data) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found: " + urlPath);
          return;
        }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
  })
  .listen(PORT, () => {
    console.log(`PCNC site running at http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop.");
  });
