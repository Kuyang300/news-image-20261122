import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The front page lives in the repo as base64 text (entry.b64.txt) so the
// snapshot stays text-only; this program decodes it and writes the exact
// bytes to /output/entry.png. Node 22 standard library only.
const here = dirname(fileURLToPath(import.meta.url));
const encoded = readFileSync(join(here, "entry.b64.txt"), "utf8").trim();
const bytes = Buffer.from(encoded, "base64");

// Guard: the payload must be a whole JPEG (magic bytes FF D8).
if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
  throw new Error("entry.b64.txt does not decode to a JPEG");
}

// Guard: the gate allows at most 1 MiB.
if (bytes.length > 1048576) {
  throw new Error("image is over the 1 MiB limit");
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);
