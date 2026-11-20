// Hands in the GTA 6 Cover Art Maker entry (Node 22, standard library
// only). The app itself is plain static files under app/ — an index page
// plus ES modules and a stylesheet, no build step, no network at runtime —
// and this program copies app/ and screenshots/ next to this file into the
// output directory and writes dossier.json there with the vendored make.fun
// library, which is the summary the judge reads.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR pointing somewhere
// writable, for example:
//   mkdir -p out-test/a && MAKEFUN_OUTPUT_DIR=out-test/a node main.ts
// The grader runs it twice into two fresh directories and expects the two
// outputs to be byte for byte identical, so this program does nothing
// time- or environment-dependent: it copies files and writes the dossier
// the library builds from them, nothing else.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own limits: at most 4 screenshots of at most
// 256 KiB each, app/ at most 993 files and 48 MiB in all with no path over
// 1000 bytes, and the dossier text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
