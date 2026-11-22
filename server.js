// Petit serveur sans dépendance pour jouer depuis l'iPad / le téléphone sur le Wi-Fi de la maison.
// Lancer :  node server.js      (ou :  npm start)
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const file = path.normalize(path.join(ROOT, urlPath));
    // on ne sert que les fichiers du dossier du projet
    if (!file.startsWith(ROOT + path.sep) || path.basename(file).startsWith(".") || file.endsWith("server.js")) {
      res.writeHead(403).end("Interdit");
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Page introuvable");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`\n🎈 Les Petits Jeux sont lancés !\n`);
    console.log(`   Sur cet ordinateur :  http://localhost:${PORT}`);
    for (const list of Object.values(os.networkInterfaces())) {
      for (const net of list || []) {
        if (net.family === "IPv4" && !net.internal) {
          console.log(`   Sur l'iPad / le téléphone :  http://${net.address}:${PORT}`);
        }
      }
    }
    console.log("");
  });
