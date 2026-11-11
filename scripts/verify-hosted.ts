import { writeFile } from "node:fs/promises";
const base = process.env.BASE_URL ?? "https://forma-brasileira.vercel.app";
const backend =
  process.env.API_ORIGIN ?? "https://forma-brasileira-api-7fo6.onrender.com";
async function request(path: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
  return {
    status: response.status,
    traceId: response.headers.get("x-trace-id"),
    data: await response.json(),
  };
}
const page = await fetch(base);
if (!page.ok) throw Error(`Vitrine: HTTP ${page.status}`);
const ready = await fetch(`${backend}/ready`, {
  signal: AbortSignal.timeout(120000),
});
if (!ready.ok) throw Error(`Backend: HTTP ${ready.status}`);
const catalog = await request("/api/products");
if (catalog.data.products.length !== 4) throw Error("Catálogo incompleto");
const order = await request("/api/orders", {
  items: [
    { productId: "luminaria-arco", quantity: 1 },
    { productId: "vaso-terra", quantity: 2 },
  ],
});
if (order.status !== 201 || order.data.totalCents !== 153000)
  throw Error("Total ou status incorreto");
const payments = await Promise.all(
  Array.from({ length: 6 }, () =>
    request(`/api/orders/${order.data.id}/payments`, {}),
  ),
);
let final;
for (let i = 0; i < 40; i++) {
  final = await request(`/api/orders/${order.data.id}`);
  if (final.data.status === "paid") break;
  await new Promise((r) => setTimeout(r, 500));
}
if (final?.data.status !== "paid") throw Error("Pagamento não confirmado");
const result = {
  capturedAt: new Date().toISOString(),
  base,
  backend,
  anonymousPageStatus: page.status,
  readyStatus: ready.status,
  products: catalog.data.products.length,
  createdStatus: order.status,
  orderId: order.data.id,
  totalCents: order.data.totalCents,
  paymentRequests: payments.map((p) => p.status),
  paymentStatus: final.data.status,
  traceId: payments[0].traceId,
};
await writeFile(
  "docs/evidencias/public-smoke.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
