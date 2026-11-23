// Conformité V2 : chaque jeu respecte docs/REGLES-JEUX.md.
// Un nouveau jeu qui ne suit pas les règles fait échouer `npm test`.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { GAMES } = require("../js/games.js");
const KL = require("../js/kit/levels.js");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

for (const g of GAMES) {
  test(`Conformité V2 : ${g.id}`, () => {
    const dir = `games/${g.id}`;
    assert.ok(fs.existsSync(path.join(ROOT, dir, "logic.js")), `${dir}/logic.js manquant`);
    const logic = require(path.join(ROOT, dir, "logic.js"));
    const isFree = logic.FREE === true;
    if (!isFree) {
      assert.ok(logic.LEVELS, `${g.id} : logic.js doit exporter LEVELS (ou FREE = true)`);
      assert.ok(KL.validateConfig(logic.LEVELS), `${g.id} : les 4 niveaux doivent exister avec "rounds" ≥ 1`);
      assert.deepEqual(Object.keys(logic.LEVELS).sort(), ["1", "2", "3", "4"], `${g.id} : exactement 4 niveaux`);
    }

    const html = read(`${dir}/index.html`);
    for (const f of ["css/tokens.css", "css/kit.css", "js/common.js", "js/kit/levels.js", "js/kit/kit.js"]) {
      assert.ok(html.includes(f), `${g.id} : la page doit charger ${f}`);
    }
    assert.match(html, /src="logic\.js/, `${g.id} : la page doit charger logic.js`);
    assert.ok(html.includes("Kit.game("), `${g.id} : la page doit utiliser Kit.game(...)`);
    assert.ok(html.includes(`id: "${g.id}"`), `${g.id} : Kit.game doit avoir id: "${g.id}"`);
    if (!isFree) assert.match(html, /levels:\s*\w+\.LEVELS/, `${g.id} : les niveaux doivent venir de logic.js (levels: XLogic.LEVELS)`);
    for (const old of ["Jeux.addHomeButton(", "Jeux.progress(", "Jeux.levelBadge("]) {
      assert.ok(!html.includes(old), `${g.id} : outil V1 interdit (${old})`);
    }
    assert.match(html, /user-scalable=no/, `${g.id} : viewport sans zoom`);
    // une fin : manches (par défaut), ou arcade/libre qui appellent round.end / le bouton ✅
    if (/mode:\s*"arcade"/.test(html)) assert.match(html, /\.end\(/, `${g.id} : un jeu arcade doit appeler round.end(...)`);
  });
}
