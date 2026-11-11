import { writeFile } from "node:fs/promises";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const catalog = await fetch(`${base}/api/products`);
if (!catalog.ok) throw Error("Catálogo falhou");
const order = await fetch(`${base}/api/orders`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    items: [{ productId: "luminaria-arco", quantity: 1 }],
  }),
});
const data = await order.json();
const response = await fetch(`${base}/api/orders/${data.id}/payments`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{}",
});
if (response.status !== 202) throw Error("Pagamento não aceito");
const traceId = response.headers.get("x-trace-id");
let final;
for (let i = 0; i < 30; i++) {
  final = await (await fetch(`${base}/api/orders/${data.id}`)).json();
  if (final.status === "paid") break;
  await new Promise((r) => setTimeout(r, 200));
}
if (final.status !== "paid") throw Error("Pagamento não confirmado");
const metrics = await (await fetch(`${base}/metrics`)).text();
await writeFile("docs/evidencias/metrics.prom", metrics);
await writeFile(
  "docs/evidencias/trace.json",
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      orderId: data.id,
      traceId,
      jaeger: `http://localhost:16686/trace/${traceId}`,
      payment: final.status,
    },
    null,
    2,
  ),
);
console.log({ orderId: data.id, traceId, status: final.status });
