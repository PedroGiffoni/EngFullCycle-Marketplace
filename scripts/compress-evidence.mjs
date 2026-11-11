import { createReadStream, createWriteStream } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { createHash } from "node:crypto";
const files = [];
for (const name of await readdir("docs/evidencias"))
  if (name.endsWith("-raw.json")) {
    const path = `docs/evidencias/${name}`;
    await pipeline(
      createReadStream(path),
      createGzip({ level: 9 }),
      createWriteStream(`${path}.gz`),
    );
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    files.push({ path: `${path}.gz`, uncompressedSha256: hash.digest("hex") });
  }
await writeFile(
  "docs/evidencias/raw-manifest.json",
  JSON.stringify(files, null, 2),
);
