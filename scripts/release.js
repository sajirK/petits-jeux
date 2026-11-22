#!/usr/bin/env node
// Prépare une nouvelle version du site.
//
//   npm run release -- 2.1.0 "Ajoute le jeu des rimes"            → version + journal + commit + tag git
//   npm run release -- 2.1.0-dev "En cours" --no-git              → sans commit ni tag (travail en local)
//
// Ce que fait le script :
//   1. met à jour js/version.js (numéro, date, note) et package.json
//   2. ajoute ?v=<version> à tous les fichiers CSS/JS chargés par les pages
//      (les tablettes chargent alors la nouvelle version au lieu de l'ancienne en cache)
//   3. ajoute la note en haut de CHANGELOG.md
//   4. fait un commit "Version x.y.z" et un tag git vx.y.z (sans rien pousser)
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const [version, note = ""] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const noGit = process.argv.includes("--no-git");

if (!version || !/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(version)) {
  console.error('Usage : npm run release -- <version x.y.z> "<note>" [--no-git]');
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);

// 1. version.js et package.json
const vFile = path.join(ROOT, "js", "version.js");
let v = fs.readFileSync(vFile, "utf8");
v = v.replace(/version: "[^"]*"/, `version: "${version}"`)
  .replace(/date: "[^"]*"/, `date: "${today}"`)
  .replace(/notes: \[[^\]]*\]/, `notes: [${JSON.stringify(note || `Version ${version}`)}]`);
fs.writeFileSync(vFile, v);
const pkgFile = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
pkg.version = version;
fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");

// 2. ?v=<version> sur les CSS/JS locaux de toutes les pages
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".") || e.name === "node_modules") return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith(".html") ? [p] : [];
  });
}
let touched = 0;
for (const file of htmlFiles(ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(/((?:href|src)="(?!https?:|\/\/)[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?"/g, `$1?v=${version}"`);
  if (after !== before) { fs.writeFileSync(file, after); touched++; }
}

// 3. journal des changements
const logFile = path.join(ROOT, "CHANGELOG.md");
const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "# Journal des versions\n";
const entry = `\n## ${version} — ${today}\n\n- ${note || "Mise à jour"}\n`;
fs.writeFileSync(logFile, log.replace(/^# Journal des versions\n/, `# Journal des versions\n${entry}`));

console.log(`✓ Version ${version} (${today}) — ${touched} pages mises à jour`);

// 4. commit + tag (local uniquement)
if (!noGit) {
  execSync("git add -A", { cwd: ROOT, stdio: "inherit" });
  execSync(`git commit -q -m "Version ${version}" -m ${JSON.stringify(note)}`, { cwd: ROOT, stdio: "inherit" });
  execSync(`git tag -a v${version} -m ${JSON.stringify(note || version)}`, { cwd: ROOT, stdio: "inherit" });
  console.log(`✓ Commit et tag v${version} créés (rien n'est poussé)`);
}
