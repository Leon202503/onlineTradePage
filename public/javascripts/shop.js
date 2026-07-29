const products = [
  {
    id: 1,
    name: "Ridge Ceramic Mug",
    category: "Home",
    price: 28,
    rating: 4.9,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=82",
    colors: ["#ddd4c4", "#738172", "#262b29"]
  },
  {
    id: 2,
    name: "Field Daypack",
    category: "Carry",
    price: 98,
    rating: 4.8,
    badge: "New",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=82",
    colors: ["#31483b", "#b8a17c", "#24282a"]
  },
  {
    id: 3,
    name: "Orbit Desk Lamp",
    category: "Desk",
    price: 124,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=82",
    colors: ["#d9caa9", "#2e3b35"]
  },
  {
    id: 4,
    name: "Linen Throw",
    category: "Home",
    price: 72,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=800&q=82",
    colors: ["#d8d0bd", "#bc7962", "#677267"]
  },
  {
    id: 5,
    name: "Canvas Market Tote",
    category: "Carry",
    price: 42,
    rating: 4.9,
    badge: "Low stock",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=82",
    colors: ["#ddd6c3", "#b1a37e"]
  },
  {
    id: 6,
    name: "Brass Desk Tray",
    category: "Desk",
    price: 46,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=82",
    colors: ["#b28b47"]
  },
  {
    id: 7,
    name: "Trail Flask",
    category: "Outdoor",
    price: 36,
    rating: 4.8,
    badge: "New",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=82",
    colors: ["#293f35", "#cc6a45", "#c1bba8"]
  },
  {
    id: 8,
    name: "Woven Picnic Rug",
    category: "Outdoor",
    price: 86,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=82",
    colors: ["#b85139", "#d1b66f", "#435b4c"]
  }
];

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: new Map(),
  favorites: new Set()
};

const els = {
  grid: document.querySelector("[data-product-grid]"),
  count: document.querySelector("[data-result-count]"),
  empty: document.querySelector("[data-empty-state]"),
  search: document.querySelector("[data-search-input]"),
  sort: document.querySelector("[data-sort-select]"),
  tabs: document.querySelectorAll("[data-category]"),
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

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function productCard(product) {
  const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : "";
  const swatches = product.colors
    .map(color => `<span class="color-swatch" style="background:${color}" aria-hidden="true"></span>`)
    .join("");

  return `
    <article class="product-card">
      <div class="product-image">
        ${badge}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <button class="favorite-button ${state.favorites.has(product.id) ? "active" : ""}" type="button"
          aria-label="${state.favorites.has(product.id) ? "Remove from" : "Add to"} favorites"
          data-favorite="${product.id}">
          <i data-lucide="heart" aria-hidden="true"></i>
        </button>
        <button class="quick-add" type="button" data-add="${product.id}">Quick add · ${money(product.price)}</button>
      </div>
      <div class="product-info">
        <div class="product-kicker">
          <span>${product.category}</span>
          <span class="rating"><i data-lucide="star" aria-hidden="true"></i>${product.rating}</span>
        </div>
        <div class="product-title-row">
          <h3>${product.name}</h3>
          <p>${money(product.price)}</p>
        </div>
        <div class="product-colors" aria-label="${product.colors.length} available colors">${swatches}</div>
      </div>
    </article>`;
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
  return `
    <article class="cart-item">
      <img src="${product.image}" alt="">
      <div>
        <h3>${product.name}</h3>
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
  els.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.category === category));
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
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
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
    renderCart();
  }

  if (removeButton) {
    state.cart.delete(Number(removeButton.dataset.remove));
    renderCart();
  }
});

els.tabs.forEach(tab => tab.addEventListener("click", () => setCategory(tab.dataset.category)));
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

renderProducts();
renderCart();
loadAccount();
window.addEventListener("load", refreshIcons);
