import { readdir, readFile } from "node:fs/promises";
async function walk(dir) {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) await walk(p);
    else if (p.endsWith(".ts")) {
      const content = await readFile(p, "utf8");
      for (const m of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        if (
          m[1].startsWith("../") &&
          !m[1].startsWith("../../platform/") &&
          !/\/(?:index\.)?public\.js$/.test(m[1])
        )
          throw Error(`Fronteira inválida: ${p} -> ${m[1]}`);
      }
    }
  }
}
await walk("src/modules");
console.log("Fronteiras de módulos verificadas.");
