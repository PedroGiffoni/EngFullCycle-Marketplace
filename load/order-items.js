import http from "k6/http";
import { check, sleep } from "k6";
export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};
export default function () {
  const catalog = http.get(`${__ENV.BASE_URL}/api/products`);
  const products = catalog.json("products");
  const items = products.map((product) => ({
    productId: product.id,
    quantity: 1,
  }));
  const expected = products.reduce(
    (sum, product) => sum + product.priceCents,
    0,
  );
  const response = http.post(
    `${__ENV.BASE_URL}/api/orders`,
    JSON.stringify({ items }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { operation: "create-four" },
    },
  );
  check(response, {
    "pedido completo 201": (r) => r.status === 201,
    "quatro itens e preço autoritativo": (r) =>
      r.status === 201 &&
      r.json("items").length === 4 &&
      r.json("totalCents") === expected,
  });
  sleep(0.1);
}
