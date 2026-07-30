let products = [];

function readStoredCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("northstar-cart") || "[]");
    return saved.map(([id, quantity]) => [Number(id), Number(quantity)]);
  } catch {
    return [];
  }
}

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: new Map(readStoredCart()),
  favorites: new Set()
};

const els = {
  grid: document.querySelector("[data-product-grid]"),
  count: document.querySelector("[data-result-count]"),
  empty: document.querySelector("[data-empty-state]"),
  search: document.querySelector("[data-search-input]"),
  sort: document.querySelector("[data-sort-select]"),
  tabs: document.querySelector("[data-category-tabs]"),
  clear: document.querySelector("[data-clear-filters]"),
  drawer: document.querySelector("[data-cart-drawer]"),
  cartItems: document.querySelector("[data-cart-items]"),
  cartEmpty: document.querySelector("[data-cart-empty]"),
  cartSummary: document.querySelector("[data-cart-summary]"),
  cartCount: document.querySelector("[data-cart-count]"),
  subtotal: document.querySelector("[data-cart-subtotal]"),
  shippingMessage: document.querySelector("[data-shipping-message]"),
  shippingBar: document.querySelector("[data-shipping-bar]"),
  toast: document.querySelector("[data-toast]")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveCart() {
  localStorage.setItem("northstar-cart", JSON.stringify([...state.cart.entries()]));
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function productCard(product) {
  const name = escapeHtml(product.name);
  const category = escapeHtml(product.category);
  const badge = product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : "";
  const image = product.image
    ? `<img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy">`
    : `<div class="missing-product-image" aria-label="No image available"><i data-lucide="image" aria-hidden="true"></i></div>`;
  const soldOut = product.stock <= 0;

  return `
    <article class="product-card">
      <div class="product-image">
        ${badge}
        <a class="product-image-link" href="/product?id=${product.id}" aria-label="View ${name}">
          ${image}
        </a>
        <button class="favorite-button ${state.favorites.has(product.id) ? "active" : ""}" type="button"
          aria-label="${state.favorites.has(product.id) ? "Remove from" : "Add to"} favorites"
          data-favorite="${product.id}">
          <i data-lucide="heart" aria-hidden="true"></i>
        </button>
        <button class="quick-add" type="button" data-add="${product.id}" ${soldOut ? "disabled" : ""}>
          ${soldOut ? "Sold out" : `Quick add · ${money(product.price)}`}
        </button>
      </div>
      <div class="product-info">
        <div class="product-kicker">
          <span>${category}</span>
          <span class="rating"><i data-lucide="star" aria-hidden="true"></i>${product.rating}</span>
        </div>
        <div class="product-title-row">
          <h3><a href="/product?id=${product.id}">${name}</a></h3>
          <p>${money(product.price)}</p>
        </div>
      </div>
    </article>`;
}

function renderCategories() {
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  els.tabs.innerHTML = ["All", ...categories]
    .map(category => `
      <button class="category-tab ${category === state.category ? "active" : ""}" type="button"
        data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `)
    .join("");
}

function renderLoadingProducts() {
  els.count.textContent = "Loading goods";
  els.empty.hidden = true;
  els.grid.hidden = false;
  els.grid.innerHTML = Array.from({ length: 4 }, () => `
    <div class="product-skeleton" aria-hidden="true">
      <div></div>
      <span></span>
      <span></span>
    </div>
  `).join("");
}

function showProductMessage(title, message) {
  els.grid.hidden = true;
  els.empty.hidden = false;
  els.empty.querySelector("h3").textContent = title;
  els.empty.querySelector("p").textContent = message;
  els.count.textContent = "0 products";
}

async function loadProducts() {
  renderLoadingProducts();
  els.search.disabled = true;
  els.sort.disabled = true;

  try {
    const response = await fetch("/api/getProducts");
    const result = await response.json();

    if (!response.ok || !result.success || !Array.isArray(result.products)) {
      throw new Error(result.message || "Invalid product response");
    }

    products = result.products.map(product => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      rating: Number(product.rating || 0),
      stock: Number(product.stock || 0)
    }));

    renderCategories();
    renderProducts();
    renderCart();
    if (new URLSearchParams(window.location.search).get("cart") === "open") {
      openCart();
    }
  } catch (error) {
    console.error("Failed to load products", error);
    showProductMessage("Unable to load goods", "Please refresh the page and try again.");
  } finally {
    els.search.disabled = false;
    els.sort.disabled = false;
  }
}

function renderProducts() {
  const query = state.search.toLowerCase().trim();
  let visible = products.filter(product => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const matchesSearch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (state.sort === "price-low") visible.sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") visible.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") visible.sort((a, b) => b.rating - a.rating);

  els.grid.innerHTML = visible.map(productCard).join("");
  els.grid.hidden = visible.length === 0;
  els.empty.hidden = visible.length !== 0;
  els.count.textContent = `${visible.length} product${visible.length === 1 ? "" : "s"}`;
  els.clear.hidden = state.category === "All" && !state.search;
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function openCart() {
  document.body.classList.add("drawer-open");
  els.drawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("drawer-open");
  els.drawer.setAttribute("aria-hidden", "true");
}

function cartItemRow(product, quantity) {
  const image = product.image
    ? `<img src="${escapeHtml(product.image)}" alt="">`
    : `<div class="cart-item-image-missing"><i data-lucide="image" aria-hidden="true"></i></div>`;

  return `
    <article class="cart-item">
      ${image}
      <div>
        <h3><a href="/product?id=${product.id}">${escapeHtml(product.name)}</a></h3>
        <p>${money(product.price)}</p>
        <div class="quantity-control" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" data-quantity="${product.id}" data-change="-1">−</button>
          <span>${quantity}</span>
          <button type="button" aria-label="Increase quantity" data-quantity="${product.id}" data-change="1">+</button>
        </div>
      </div>
      <button class="cart-item-remove" type="button" aria-label="Remove ${product.name}" data-remove="${product.id}">
        <i data-lucide="trash-2" aria-hidden="true"></i>
      </button>
    </article>`;
}

function renderCart() {
  let totalItems = 0;
  let subtotal = 0;
  const rows = [];

  state.cart.forEach((quantity, id) => {
    const product = products.find(item => item.id === id);
    if (!product) return;
    totalItems += quantity;
    subtotal += product.price * quantity;
    rows.push(cartItemRow(product, quantity));
  });

  els.cartItems.innerHTML = rows.join("");
  els.cartCount.textContent = totalItems;
  els.subtotal.textContent = money(subtotal);
  els.cartEmpty.hidden = totalItems !== 0;
  els.cartSummary.hidden = totalItems === 0;
  els.shippingBar.style.width = `${Math.min(100, (subtotal / 75) * 100)}%`;
  els.shippingMessage.textContent = subtotal >= 75
    ? "You unlocked free shipping"
    : `Add ${money(75 - subtotal)} for free shipping`;
  refreshIcons();
}

function setCategory(category) {
  state.category = category;
  els.tabs.querySelectorAll("[data-category]").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });
  renderProducts();
}

function clearFilters() {
  state.search = "";
  state.sort = "featured";
  els.search.value = "";
  els.sort.value = "featured";
  setCategory("All");
}

async function loadAccount() {
  const accountMenu = document.querySelector("[data-account-menu]");
  const trigger = document.querySelector("[data-account-trigger]");

  try {
    const response = await fetch("/api/check-login");
    const result = await response.json();

    if (!result.loggedIn || !result.user) return;

    const user = result.user;
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
    const initial = displayName.charAt(0).toUpperCase();

    accountMenu.classList.add("is-authenticated");
    trigger.href = "#account";
    trigger.setAttribute("aria-label", `Account for ${displayName}`);
    document.querySelector("[data-account-icon]").hidden = true;
    document.querySelector("[data-account-avatar]").hidden = false;
    document.querySelector("[data-account-avatar]").textContent = initial;
    document.querySelector("[data-profile-avatar]").textContent = initial;
    document.querySelector("[data-profile-name]").textContent = displayName;
    document.querySelector("[data-profile-email]").textContent = user.email;
    document.querySelector("[data-account-popover]").hidden = false;
    refreshIcons();
  } catch (error) {
    console.error("Unable to load account state", error);
  }
}

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) {
    const id = Number(addButton.dataset.add);
    const product = products.find(item => item.id === id);
    const quantity = state.cart.get(id) || 0;
    if (!product || product.stock <= quantity) {
      showToast("This item is out of stock");
      return;
    }
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
    saveCart();
    renderCart();
    showToast("Added to your bag");
  }

  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    renderProducts();
  }

  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const next = (state.cart.get(id) || 0) + Number(quantityButton.dataset.change);
    next > 0 ? state.cart.set(id, next) : state.cart.delete(id);
    saveCart();
    renderCart();
  }

  if (removeButton) {
    state.cart.delete(Number(removeButton.dataset.remove));
    saveCart();
    renderCart();
  }
});

els.tabs.addEventListener("click", event => {
  const tab = event.target.closest("[data-category]");
  if (tab) setCategory(tab.dataset.category);
});
els.search.addEventListener("input", event => {
  state.search = event.target.value;
  renderProducts();
});
els.sort.addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("[data-cart-open]").addEventListener("click", openCart);
document.querySelector("[data-cart-close]").addEventListener("click", closeCart);
document.querySelector("[data-cart-backdrop]").addEventListener("click", closeCart);
document.querySelector("[data-cart-continue]").addEventListener("click", closeCart);
document.querySelector("[data-search-focus]").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => els.search.focus(), 450);
});
document.querySelector("[data-account-trigger]").addEventListener("click", event => {
  const accountMenu = document.querySelector("[data-account-menu]");
  if (!accountMenu.classList.contains("is-authenticated")) return;

  event.preventDefault();
  accountMenu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(accountMenu.classList.contains("open")));
});
document.addEventListener("click", event => {
  const accountMenu = document.querySelector("[data-account-menu]");
  if (accountMenu.contains(event.target)) return;

  accountMenu.classList.remove("open");
  document.querySelector("[data-account-trigger]").setAttribute("aria-expanded", "false");
});
document.querySelector("[data-menu-toggle]").addEventListener("click", event => {
  const nav = document.querySelector("[data-mobile-nav]");
  nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(nav.classList.contains("open")));
});
document.querySelectorAll("[data-mobile-nav] a").forEach(link => link.addEventListener("click", () => {
  document.querySelector("[data-mobile-nav]").classList.remove("open");
}));
document.querySelector("[data-dismiss-announcement]").addEventListener("click", event => {
  event.currentTarget.closest(".announcement").remove();
});
document.querySelector("[data-filter-link]").addEventListener("click", event => {
  setCategory(event.currentTarget.dataset.filterLink);
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});
els.clear.addEventListener("click", clearFilters);
document.querySelector("[data-empty-clear]").addEventListener("click", clearFilters);
document.querySelector("[data-newsletter-form]").addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  document.querySelector("[data-newsletter-message]").textContent = "Thanks — you are on the list.";
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    document.querySelector("[data-account-menu]").classList.remove("open");
    document.querySelector("[data-account-trigger]").setAttribute("aria-expanded", "false");
  }
});

loadProducts();
loadAccount();
window.addEventListener("load", refreshIcons);
