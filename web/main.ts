import { animate } from "motion";
import type { Product } from "../src/modules/catalog/public.js";
import type { Order } from "../src/modules/orders/public.js";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value / 100,
  );
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const duration = (token: string) =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(token),
  ) / 1000;
const escapeHTML = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
let products: Product[] = [];
let selected: Product | undefined;
let cleanup3d: (() => void) | undefined;
let filterRequest = 0;
let busy = false;
let pending: Order | undefined;
let catalogScroll = 0;
const cart = new Map<string, { product: Product; quantity: number }>();
const productDialog = $<HTMLDialogElement>("product-dialog");
const cartDialog = $<HTMLDialogElement>("cart-dialog");
async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error ?? "Serviço indisponível.");
  return data;
}
function reveal(el: HTMLElement, panel = false) {
  if (!reduced())
    animate(
      el,
      {
        opacity: [0, 1],
        transform: panel
          ? ["translateX(24px)", "translateX(0)"]
          : ["translateY(12px)", "translateY(0)"],
      },
      { duration: duration(panel ? "--panel" : "--reveal"), ease: "easeOut" },
    );
}
async function loadCatalog(category = "") {
  const request = ++filterRequest;
  const state = $("catalog-state");
  state.textContent = "Carregando peças…";
  try {
    const data = await api<{ products: Product[] }>(
      `/api/products${category ? "?category=" + encodeURIComponent(category) : ""}`,
    );
    if (request !== filterRequest) return;
    products = data.products;
    const grid = $("grid");
    const previous = new Map(
      Array.from(grid.children).map((el) => [
        (el as HTMLElement).dataset.id,
        el.getBoundingClientRect(),
      ]),
    );
    grid.innerHTML = products
      .map(
        (p) =>
          `<article class="card" data-id="${escapeHTML(p.id)}"><button aria-label="Ver ${escapeHTML(p.name)}" data-product="${escapeHTML(p.id)}"><div class="card-image"><img src="${escapeHTML(p.image)}" alt="Ilustração de ${escapeHTML(p.name)}, produto fictício" width="400" height="500" loading="lazy"></div><div class="card-meta"><h3>${escapeHTML(p.name)}</h3><span class="money">${money(p.priceCents)}</span></div><p class="material">${escapeHTML(p.material)}</p></button></article>`,
      )
      .join("");
    state.textContent = products.length ? "" : "Nenhuma peça nesta seleção.";
    $("results").textContent = `${products.length} peças fictícias`;
    grid
      .querySelectorAll<HTMLButtonElement>("button")
      .forEach(
        (button) =>
          (button.onclick = () => void openProduct(button.dataset.product!)),
      );
    if (!reduced())
      for (const child of Array.from(grid.children)) {
        const el = child as HTMLElement;
        const old = previous.get(el.dataset.id);
        const current = el.getBoundingClientRect();
        animate(
          el,
          {
            opacity: [0.4, 1],
            transform: [
              `translate(${old ? old.x - current.x : 0}px,${old ? old.y - current.y : 8}px)`,
              "translate(0,0)",
            ],
          },
          { duration: duration("--fast") },
        );
      }
  } catch (error) {
    if (request !== filterRequest) return;
    state.textContent = `Não foi possível carregar a coleção. ${(error as Error).message}`;
    const retry = document.createElement("button");
    retry.textContent = "Tentar novamente";
    retry.className = "secondary retry";
    retry.onclick = () => void loadCatalog(category);
    state.append(retry);
    $("results").textContent = "Coleção indisponível";
  }
}
document.querySelectorAll<HTMLButtonElement>("[data-category]").forEach(
  (button) =>
    (button.onclick = () => {
      document
        .querySelectorAll("[data-category]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      void loadCatalog(button.dataset.category);
    }),
);
async function openProduct(id: string, updateHistory = true) {
  try {
    selected = await api<Product>(`/api/products/${id}`);
    catalogScroll = window.scrollY;
    const image = $<HTMLImageElement>("product-image");
    image.src = selected.image;
    image.alt = `Ilustração da peça fictícia ${selected.name}`;
    for (const [key, value] of Object.entries({
      title: selected.name,
      category: selected.category,
      description: selected.description,
      material: selected.material,
      dimensions: selected.dimensions,
      price: money(selected.priceCents),
    }))
      $(`product-${key}`).textContent = value;
    $("product-feedback").textContent = "";
    $("load-three").hidden = !selected.model;
    $("load-three").textContent = "Ver em 3D";
    $<HTMLButtonElement>("load-three").disabled = false;
    if (updateHistory)
      history.pushState(
        { fromCatalog: true },
        "",
        `/pecas/${encodeURIComponent(id)}`,
      );
    if (!productDialog.open) productDialog.showModal();
    reveal(productDialog);
  } catch (error) {
    $("catalog-state").textContent = (error as Error).message;
  }
}
$("close-product").onclick = () => productDialog.close();
productDialog.addEventListener("close", () => {
  cleanup3d?.();
  cleanup3d = undefined;
  $("three-host").hidden = true;
  $("product-image").hidden = false;
  $("rotate-three").hidden = true;
  $("reset-three").hidden = true;
  $("three-status").textContent = "";
  window.scrollTo(0, catalogScroll);
  if (location.pathname.startsWith("/pecas/")) {
    if (history.state?.fromCatalog) history.back();
    else history.replaceState(null, "", "/");
  }
});
$("load-three").onclick = async () => {
  const button = $<HTMLButtonElement>("load-three");
  button.disabled = true;
  $("three-status").textContent = "Carregando visualização 3D…";
  const started = performance.now();
  try {
    const module = await import("./three-view.js");
    if (!productDialog.open) {
      button.disabled = false;
      return;
    }
    const view = module.createView($("three-host"));
    cleanup3d = view.dispose;
    $("three-host").hidden = false;
    view.resize();
    $("product-image").hidden = true;
    $("rotate-three").hidden = false;
    $("reset-three").hidden = false;
    $("rotate-three").onclick = view.rotate;
    $("reset-three").onclick = view.reset;
    $("three-status").textContent =
      "Arraste na horizontal para girar. Use os botões ou as setas do teclado.";
    performance.measure("product-3d-activation", {
      start: started,
      end: performance.now(),
    });
  } catch {
    $("three-status").textContent =
      "Visualização 3D indisponível. A ilustração, as dimensões e a compra continuam disponíveis.";
    button.disabled = false;
  }
};
$("add-cart").onclick = async () => {
  if (!selected) return;
  if (busy || pending) {
    $("product-feedback").textContent =
      "Conclua o pedido pendente na sacola antes de adicionar outra peça.";
    return;
  }
  const button = $<HTMLButtonElement>("add-cart");
  button.disabled = true;
  try {
    const fresh = await api<Product>(`/api/products/${selected.id}`);
    const existing = cart.get(fresh.id);
    if ((existing?.quantity ?? 0) >= 20)
      throw Error("Limite de 20 unidades por peça.");
    cart.set(fresh.id, {
      product: fresh,
      quantity: (existing?.quantity ?? 0) + 1,
    });
    pending = undefined;
    $("cart-feedback").textContent = "";
    $("cart-feedback").className = "";
    $("checkout").textContent = "Criar pedido e pagar";
    $("product-feedback").textContent = "✓ Peça adicionada à sacola.";
    renderCart();
    productDialog.close();
    cartDialog.showModal();
    reveal(cartDialog, true);
  } catch (error) {
    $("product-feedback").textContent = (error as Error).message;
  } finally {
    button.disabled = false;
  }
};
function renderCart() {
  $("cart-count").textContent = String(
    [...cart.values()].reduce((sum, i) => sum + i.quantity, 0),
  );
  $("cart-items").innerHTML = cart.size
    ? [...cart.values()]
        .map(
          ({ product: p, quantity }) =>
            `<div class="cart-item"><img src="${escapeHTML(p.image)}" alt="Ilustração ${escapeHTML(p.name)}"><div><p>${escapeHTML(p.name)}</p><p>${money(p.priceCents * quantity)}</p><div class="qty"><button data-qty="${p.id}" data-delta="-1" aria-label="Diminuir ${escapeHTML(p.name)}" ${busy || pending ? "disabled" : ""}>−</button><span>${quantity}</span><button data-qty="${p.id}" data-delta="1" aria-label="Aumentar ${escapeHTML(p.name)}" ${quantity >= 20 || busy || pending ? "disabled" : ""}>+</button></div></div></div>`,
        )
        .join("")
    : "<p>Sua sacola está esperando uma escolha.</p>";
  $("cart-total").textContent = money(
    [...cart.values()].reduce(
      (sum, i) => sum + i.quantity * i.product.priceCents,
      0,
    ),
  );
  $<HTMLButtonElement>("checkout").disabled = !cart.size || busy;
  document.querySelectorAll<HTMLButtonElement>("[data-qty]").forEach(
    (button) =>
      (button.onclick = async () => {
        if (busy || pending) return;
        const entry = cart.get(button.dataset.qty!)!;
        busy = true;
        renderCart();
        try {
          const fresh = await api<Product>(`/api/products/${entry.product.id}`);
          entry.quantity += Number(button.dataset.delta);
          entry.product = fresh;
          if (entry.quantity <= 0) cart.delete(fresh.id);
          pending = undefined;
          $("cart-feedback").textContent = "Quantidade e subtotal atualizados.";
        } catch (error) {
          $("cart-feedback").textContent =
            `Quantidade preservada. ${(error as Error).message} Tente novamente.`;
        } finally {
          busy = false;
          renderCart();
        }
      }),
  );
}
$("open-cart").onclick = () => {
  renderCart();
  cartDialog.showModal();
  reveal(cartDialog, true);
};
$("close-cart").onclick = () => cartDialog.close();
$("checkout").onclick = async () => {
  if (busy || !cart.size) return;
  busy = true;
  renderCart();
  const button = $<HTMLButtonElement>("checkout");
  button.textContent = "Processando…";
  $("cart-feedback").textContent =
    "Criando pedido e registrando pagamento simulado…";
  try {
    if (!pending)
      pending = await api<Order>("/api/orders", {
        items: [...cart.values()].map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      });
    await api(`/api/orders/${pending.id}/payments`, {});
    let paid = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const order = await api<Order>(`/api/orders/${pending.id}`);
      if (order.status === "paid") {
        paid = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!paid)
      throw Error(
        "Pagamento ainda pendente. Tente consultar novamente usando o mesmo pedido.",
      );
    const id = pending.id;
    cart.clear();
    renderCart();
    $("cart-feedback").className = "success confirmation";
    $("cart-feedback").textContent =
      `✓ Pagamento simulado confirmado. Pedido ${id}. Nenhuma cobrança real.`;
    reveal($("cart-feedback"));
    pending = undefined;
    button.textContent = "Pedido confirmado";
  } catch (error) {
    $("cart-feedback").className = "error";
    $("cart-feedback").textContent = (error as Error).message;
    button.textContent = pending
      ? "Consultar e tentar pagamento"
      : "Tentar novamente";
  } finally {
    busy = false;
    renderCart();
  }
};
reveal($("hero"));
void loadCatalog();
renderCart();
window.addEventListener("popstate", () => {
  const id = location.pathname.match(/^\/pecas\/([^/]+)$/)?.[1];
  if (id) void openProduct(decodeURIComponent(id), false);
  else if (productDialog.open) productDialog.close();
});
const initialProduct = location.pathname.match(/^\/pecas\/([^/]+)$/)?.[1];
if (initialProduct) void openProduct(decodeURIComponent(initialProduct), false);
