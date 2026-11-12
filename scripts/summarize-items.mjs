import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
const result = {};
for (const phase of ["before", "after"]) {
  const values = [];
  for await (const line of createInterface({
    input: createReadStream(`docs/evidencias/items-${phase}-raw.json`),
    crlfDelay: Infinity,
  })) {
    const point = JSON.parse(line);
    if (
      point.type === "Point" &&
      point.metric === "http_req_duration" &&
      point.data.tags.operation === "create-four"
    )
      values.push(point.data.value);
  }
  values.sort((a, b) => a - b);
  const index = (values.length - 1) * 0.95;
  const low = Math.floor(index);
  const summary = JSON.parse(
    await readFile(`docs/evidencias/items-${phase}-summary.json`, "utf8"),
  );
  result[phase] = {
    createSamples: values.length,
    createP95Ms:
      values[low] + (values[Math.ceil(index)] - values[low]) * (index - low),
    httpErrors: summary.metrics.http_req_failed.value,
    checksPassed: summary.metrics.checks.value,
    requests: summary.metrics.http_reqs.count,
    requestsPerSecond: summary.metrics.http_reqs.rate,
  };
}
result.p95ChangePercent =
  (result.after.createP95Ms / result.before.createP95Ms - 1) * 100;
await writeFile(
  "docs/evidencias/items-comparison.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
