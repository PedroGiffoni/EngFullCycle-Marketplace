import { beforeAll, afterAll, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import YAML from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { setup, pool } from "./setup.js";
// JSON Schema 2020-12 do OpenAPI 3.1 validado contra respostas HTTP reais.
const spec = YAML.parse(readFileSync("docs/openapi.yaml", "utf8"));
const ajv = new Ajv2020.default({ strict: false });
addFormats.default(ajv);
for (const [name, schema] of Object.entries(spec.components.schemas))
  ajv.addSchema(schema as object, `#/components/schemas/${name}`);
function validate(name: string, value: unknown) {
  const validator = ajv.getSchema(`#/components/schemas/${name}`)!;
  return validator(value);
}
let app: Awaited<ReturnType<typeof setup>>;
beforeAll(async () => {
  app = await setup();
});
afterAll(async () => {
  await app.close();
  await pool.end();
});
it("catálogo e filtros respeitam contrato", async () => {
  const response = await app.inject("/api/products");
  expect(response.statusCode).toBe(200);
  expect(validate("ProductList", response.json())).toBe(true);
  const filtered = await app.inject("/api/products?category=Objetos");
  expect(filtered.json().products).toHaveLength(2);
  const detail = await app.inject("/api/products/luminaria-arco");
  expect(validate("Product", detail.json())).toBe(true);
});
it("criação, consulta e pagamento respeitam status e tipos", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/orders",
    payload: { items: [{ productId: "vaso-terra", quantity: 2 }] },
  });
  expect(response.statusCode).toBe(201);
  expect(validate("Order", response.json())).toBe(true);
  const id = response.json().id;
  expect(
    validate("Order", (await app.inject(`/api/orders/${id}`)).json()),
  ).toBe(true);
  const paid = await app.inject({
    method: "POST",
    url: `/api/orders/${id}/payments`,
    payload: {},
  });
  expect(paid.statusCode).toBe(202);
  expect(validate("Payment", paid.json())).toBe(true);
  const duplicate = await app.inject({
    method: "POST",
    url: `/api/orders/${id}/payments`,
    payload: {},
  });
  expect(duplicate.statusCode).toBe(200);
  expect(duplicate.json().status).toBe("paid");
});
it("respostas de erro são documentadas", async () => {
  for (const path of [
    "/api/products/ausente",
    "/api/orders/00000000-0000-4000-8000-999999999999",
  ]) {
    const response = await app.inject(path);
    expect(response.statusCode).toBe(404);
    expect(validate("Error", response.json())).toBe(true);
  }
  for (const payload of [
    { items: [] },
    { items: [{ productId: "vaso-terra", quantity: 0 }] },
    { items: [{ productId: "vaso-terra", quantity: 1 }], totalCents: 1 },
  ]) {
    const r = await app.inject({ method: "POST", url: "/api/orders", payload });
    expect(r.statusCode).toBe(400);
    expect(validate("Error", r.json())).toBe(true);
  }
  expect((await app.inject("/api/orders/invalido")).statusCode).toBe(400);
  expect((await app.inject("/api/products?category=invalida")).statusCode).toBe(
    400,
  );
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/api/orders",
        payload: { items: [{ productId: "ausente", quantity: 1 }] },
      })
    ).statusCode,
  ).toBe(404);
  expect(
    (
      await app.inject({
        method: "POST",
        url: "/api/orders/00000000-0000-4000-8000-999999999999/payments",
        payload: {},
      })
    ).statusCode,
  ).toBe(404);
});
it("detecta mudança incompatível deliberada no campo de preço", async () => {
  const response = (await app.inject("/api/products/luminaria-arco")).json();
  expect(validate("Product", response)).toBe(true);
  response.priceCents = "89000";
  expect(validate("Product", response)).toBe(false);
  delete response.priceCents;
  expect(validate("Product", response)).toBe(false);
});
it("saúde, prontidão e RED respondem", async () => {
  expect((await app.inject("/health")).statusCode).toBe(200);
  expect((await app.inject("/ready")).statusCode).toBe(200);
  await app.inject("/api/products");
  const metrics = await app.inject("/metrics");
  expect(metrics.body).toContain("http_requests_total");
  expect(metrics.body).toContain("http_request_duration_seconds_bucket");
});
