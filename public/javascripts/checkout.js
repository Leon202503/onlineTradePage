const checkoutState = {
  products: [],
  cart: new Map(),
  subtotal: 0,
  shipping: 0
};

const checkoutEls = {
  loading: document.querySelector("[data-checkout-loading]"),
  layout: document.querySelector("[data-checkout-layout]"),
  empty: document.querySelector("[data-checkout-empty]"),
  success: document.querySelector("[data-checkout-success]"),
  form: document.querySelector("[data-checkout-form]"),
  items: document.querySelector("[data-checkout-items]"),
  count: document.querySelector("[data-checkout-count]"),
  subtotal: document.querySelector("[data-checkout-subtotal]"),
  shipping: document.querySelector("[data-checkout-shipping]"),
  total: document.querySelector("[data-checkout-total]"),
  standardShipping: document.querySelector("[data-standard-shipping]"),
  message: document.querySelector("[data-checkout-message]")
};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("northstar-cart") || "[]");
    return new Map(saved.map(([id, quantity]) => [Number(id), Number(quantity)]));
  } catch {
    return new Map();
  }
}

function createCheckoutItem(product, quantity) {
  const article = document.createElement("article");
  article.className = "checkout-item";

  const media = document.createElement("div");
  media.className = "checkout-item-media";
  if (product.image) {
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    media.append(image);
  }
  const quantityBadge = document.createElement("span");
  quantityBadge.textContent = quantity;
  media.append(quantityBadge);

  const copy = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = product.name;
  const category = document.createElement("p");
  category.textContent = product.category;
  copy.append(title, category);

  const price = document.createElement("strong");
  price.textContent = money(product.price * quantity);
  article.append(media, copy, price);
  return article;
}

function calculateShipping() {
  const method = checkoutEls.form.elements.shippingMethod.value;
  if (method === "express") return 18;
  return checkoutState.subtotal >= 75 ? 0 : 7;
}

function renderTotals() {
  checkoutState.shipping = calculateShipping();
  checkoutEls.subtotal.textContent = money(checkoutState.subtotal);
  checkoutEls.shipping.textContent = checkoutState.shipping === 0 ? "Free" : money(checkoutState.shipping);
  checkoutEls.total.textContent = money(checkoutState.subtotal + checkoutState.shipping);
  checkoutEls.standardShipping.textContent = checkoutState.subtotal >= 75 ? "Free" : "$7.00";
}

function renderCheckout() {
  checkoutEls.items.innerHTML = "";
  checkoutState.subtotal = 0;
  let totalQuantity = 0;
  let hasUnavailableItem = false;

  checkoutState.cart.forEach((quantity, productId) => {
    const product = checkoutState.products.find(item => item.id === productId);
    if (!product) {
      hasUnavailableItem = true;
      return;
    }

    const safeQuantity = Math.min(quantity, product.stock);
    if (safeQuantity <= 0 || safeQuantity !== quantity) hasUnavailableItem = true;
    if (safeQuantity <= 0) return;

    checkoutState.subtotal += product.price * safeQuantity;
    totalQuantity += safeQuantity;
    checkoutEls.items.append(createCheckoutItem(product, safeQuantity));
  });

  checkoutEls.count.textContent = totalQuantity;

  if (totalQuantity === 0) {
    checkoutEls.loading.hidden = true;
    checkoutEls.layout.hidden = true;
    checkoutEls.empty.hidden = false;
    return;
  }

  if (hasUnavailableItem) {
    checkoutEls.message.textContent = "Your bag contains unavailable items. Return to the bag and review it before ordering.";
    checkoutEls.form.querySelector("[type='submit']").disabled = true;
  }

  renderTotals();
  checkoutEls.loading.hidden = true;
  checkoutEls.layout.hidden = false;
}

async function loadCheckout() {
  checkoutState.cart = readCart();

  if (checkoutState.cart.size === 0) {
    renderCheckout();
    return;
  }

  try {
    const response = await fetch("/api/getProducts");
    const result = await response.json();
    if (!response.ok || !result.success || !Array.isArray(result.products)) {
      throw new Error(result.message || "Unable to load products");
    }

    checkoutState.products = result.products.map(product => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      stock: Number(product.stock || 0)
    }));
    renderCheckout();
  } catch (error) {
    console.error("Failed to load checkout", error);
    checkoutEls.loading.hidden = true;
    checkoutEls.empty.hidden = false;
    checkoutEls.empty.querySelector("h1").textContent = "Unable to load checkout";
    checkoutEls.empty.querySelector("p").textContent = "Please refresh the page and try again.";
  }
}

async function loadCustomer() {
  try {
    const response = await fetch("/api/check-login");
    const result = await response.json();
    if (!result.loggedIn || !result.user) return;

    checkoutEls.form.elements.email.value = result.user.email || "";
    checkoutEls.form.elements.firstName.value = result.user.firstName || "";
    checkoutEls.form.elements.lastName.value = result.user.lastName || "";
    document.querySelector("[data-checkout-login-prompt]").textContent = `Signed in as ${result.user.email}`;
  } catch (error) {
    console.error("Unable to load customer", error);
  }
}

checkoutEls.form.addEventListener("change", event => {
  if (event.target.name === "shippingMethod") renderTotals();
});

checkoutEls.form.addEventListener("submit", async event => {
  event.preventDefault();
  checkoutEls.message.textContent = "";

  if (!checkoutEls.form.checkValidity()) {
    checkoutEls.form.reportValidity();
    return;
  }

  const formData = new FormData(checkoutEls.form);
  const payload = {
    contact: {
      email: formData.get("email"),
      phone: formData.get("phone")
    },
    shippingAddress: {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      country: formData.get("country"),
      address: formData.get("address"),
      apartment: formData.get("apartment"),
      city: formData.get("city"),
      province: formData.get("province"),
      postalCode: formData.get("postalCode")
    },
    shippingMethod: formData.get("shippingMethod"),
    paymentMethod: formData.get("paymentMethod"),
    items: [...checkoutState.cart.entries()].map(([productId, quantity]) => ({
      productId,
      quantity
    }))
  };

  const submitButton = checkoutEls.form.querySelector("[type='submit']");
  submitButton.disabled = true;
  submitButton.firstChild.textContent = "Placing order";

  try {
    const response = await fetch("/api/createOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json") ? await response.json() : {};

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to place order");
    }

    localStorage.removeItem("northstar-cart");
    checkoutEls.layout.hidden = true;
    checkoutEls.success.hidden = false;
    document.querySelector("[data-order-number]").textContent = result.orderNumber || `#${result.orderId}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Failed to create order", error);
    checkoutEls.message.textContent = error.message;
    submitButton.disabled = false;
    submitButton.firstChild.textContent = "Place order";
  }
});

loadCheckout();
loadCustomer();
window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons();
});
