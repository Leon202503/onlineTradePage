const detailState = {
  product: null,
  quantity: 1,
  reviewRating: 0
};

const detailEls = {
  loading: document.querySelector("[data-detail-loading]"),
  detail: document.querySelector("[data-product-detail]"),
  error: document.querySelector("[data-detail-error]"),
  image: document.querySelector("[data-detail-image]"),
  imageMissing: document.querySelector("[data-detail-image-missing]"),
  name: document.querySelector("[data-detail-name]"),
  breadcrumb: document.querySelector("[data-detail-breadcrumb]"),
  category: document.querySelector("[data-detail-category]"),
  rating: document.querySelector("[data-detail-rating]"),
  price: document.querySelector("[data-detail-price]"),
  badge: document.querySelector("[data-detail-badge]"),
  stockStatus: document.querySelector("[data-stock-status]"),
  quantity: document.querySelector("[data-detail-quantity]"),
  add: document.querySelector("[data-detail-add]"),
  cartCount: document.querySelector("[data-detail-cart-count]"),
  toast: document.querySelector("[data-detail-toast]"),
  lower: document.querySelector("[data-detail-lower]"),
  description: document.querySelector("[data-detail-description]"),
  reviewAverage: document.querySelector("[data-review-average]"),
  reviewAverageStars: document.querySelector("[data-review-average-stars]"),
  reviewCount: document.querySelector("[data-review-count]"),
  reviewList: document.querySelector("[data-review-list]"),
  reviewsEmpty: document.querySelector("[data-reviews-empty]"),
  reviewDialog: document.querySelector("[data-review-dialog]"),
  reviewForm: document.querySelector("[data-review-form]")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function saveCart(cart) {
  localStorage.setItem("northstar-cart", JSON.stringify([...cart.entries()]));
}

function updateCartCount() {
  const total = [...readCart().values()].reduce((sum, quantity) => sum + quantity, 0);
  detailEls.cartCount.textContent = total;
}

function showToast(message) {
  detailEls.toast.textContent = message;
  detailEls.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => detailEls.toast.classList.remove("show"), 2200);
}

function showError(title, message) {
  detailEls.loading.hidden = true;
  detailEls.detail.hidden = true;
  detailEls.error.hidden = false;
  document.querySelector("[data-detail-error-title]").textContent = title;
  document.querySelector("[data-detail-error-message]").textContent = message;
}

function starsMarkup(rating) {
  return Array.from({ length: 5 }, (_, index) => `
    <i data-lucide="star" class="${index < Math.round(rating) ? "filled" : ""}" aria-hidden="true"></i>
  `).join("");
}

function reviewCard(review) {
  const date = new Date(review.createdAt || review.created_at);
  const dateLabel = Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(date);
  const author = review.customerName || review.customer_name || "Northstar customer";

  return `
    <article class="review-card">
      <div class="review-card-header">
        <div class="review-stars" aria-label="${Number(review.rating)} out of 5 stars">
          ${starsMarkup(Number(review.rating))}
        </div>
        <time>${escapeHtml(dateLabel)}</time>
      </div>
      <h3>${escapeHtml(review.title || "Customer review")}</h3>
      <p>${escapeHtml(review.comment)}</p>
      <div class="review-author">
        ${escapeHtml(author)}
        ${review.verified ? "<span>Verified purchase</span>" : ""}
      </div>
    </article>
  `;
}

function renderReviews(product) {
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const summary = product.reviewSummary || product.review_summary || {};
  const average = Number(summary.average ?? product.rating ?? 0);
  const total = Number(summary.total ?? reviews.length);
  const breakdown = summary.breakdown || {};

  detailEls.reviewAverage.textContent = average.toFixed(1);
  detailEls.reviewAverageStars.innerHTML = starsMarkup(average);
  detailEls.reviewCount.textContent = total === 1 ? "1 customer review" : `${total} customer reviews`;

  for (let rating = 1; rating <= 5; rating += 1) {
    const row = document.querySelector(`[data-rating-row="${rating}"]`);
    const count = Number(breakdown[rating] ?? reviews.filter(review => Number(review.rating) === rating).length);
    const percentage = total > 0 ? Math.min(100, (count / total) * 100) : 0;
    row.querySelector("b").style.width = `${percentage}%`;
    row.querySelector("em").textContent = count;
  }

  detailEls.reviewList.innerHTML = reviews.map(reviewCard).join("");
  detailEls.reviewsEmpty.hidden = reviews.length > 0;
  document.querySelector("[data-review-product-name]").textContent = product.name;
}

function renderProduct(product) {
  detailState.product = {
    ...product,
    id: Number(product.id),
    price: Number(product.price),
    rating: Number(product.rating || 0),
    stock: Number(product.stock || 0)
  };

  const item = detailState.product;
  document.title = `${item.name} | Northstar Supply`;
  detailEls.name.textContent = item.name;
  detailEls.breadcrumb.textContent = item.name;
  detailEls.category.textContent = item.category;
  detailEls.rating.textContent = item.rating;
  detailEls.price.textContent = money(item.price);
  detailEls.description.textContent = item.description || "No product description has been added yet.";
  document.querySelector("[data-spec-category]").textContent = item.category;
  document.querySelector("[data-spec-id]").textContent = `#${String(item.id).padStart(5, "0")}`;
  document.querySelector("[data-spec-stock]").textContent = item.stock > 0 ? `${item.stock} in stock` : "Out of stock";
  document.querySelector("[data-spec-created]").textContent = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(item.created_at));

  if (item.badge) {
    detailEls.badge.textContent = item.badge;
    detailEls.badge.hidden = false;
  }

  if (item.image) {
    detailEls.image.src = item.image;
    detailEls.image.alt = item.name;
  } else {
    detailEls.image.hidden = true;
    detailEls.imageMissing.hidden = false;
  }

  detailEls.image.addEventListener("error", () => {
    detailEls.image.hidden = true;
    detailEls.imageMissing.hidden = false;
  }, { once: true });

  const stockText = detailEls.stockStatus.querySelector("strong");
  if (item.stock > 0) {
    stockText.textContent = `${item.stock} available`;
  } else {
    detailEls.stockStatus.classList.add("out");
    stockText.textContent = "Out of stock";
    detailEls.add.disabled = true;
    detailEls.add.firstChild.textContent = "Sold out";
  }

  detailEls.loading.hidden = true;
  detailEls.detail.hidden = false;
  detailEls.lower.hidden = false;
  renderReviews(item);
  if (window.lucide) window.lucide.createIcons();
}

async function loadProduct() {
  const productId = new URLSearchParams(window.location.search).get("id");

  if (!productId || !/^\d+$/.test(productId)) {
    showError("Product not found", "The product link is invalid.");
    return;
  }

  try {
    const response = await fetch(`/api/getProduct?id=${encodeURIComponent(productId)}`);
    const result = await response.json();

    if (!response.ok || !result.success || !result.product) {
      throw new Error(result.message || "Product not found");
    }

    renderProduct(result.product);
  } catch (error) {
    console.error("Failed to load product", error);
    showError("Product not found", "This product may no longer be available.");
  }
}

document.querySelector("[data-detail-decrease]").addEventListener("click", () => {
  detailState.quantity = Math.max(1, detailState.quantity - 1);
  detailEls.quantity.textContent = detailState.quantity;
});

document.querySelector("[data-detail-increase]").addEventListener("click", () => {
  if (!detailState.product) return;
  detailState.quantity = Math.min(detailState.product.stock, detailState.quantity + 1);
  detailEls.quantity.textContent = detailState.quantity;
});

detailEls.add.addEventListener("click", () => {
  const product = detailState.product;
  if (!product || product.stock <= 0) return;

  const cart = readCart();
  const currentQuantity = cart.get(product.id) || 0;
  const nextQuantity = Math.min(product.stock, currentQuantity + detailState.quantity);
  cart.set(product.id, nextQuantity);
  saveCart(cart);
  updateCartCount();
  showToast(`${product.name} added to your bag`);
});

document.querySelector("[data-review-open]").addEventListener("click", () => {
  detailEls.reviewDialog.showModal();
});

document.querySelector("[data-review-close]").addEventListener("click", () => {
  detailEls.reviewDialog.close();
});

detailEls.reviewDialog.addEventListener("click", event => {
  if (event.target === detailEls.reviewDialog) detailEls.reviewDialog.close();
});

document.querySelectorAll("[data-review-rating]").forEach(button => {
  button.addEventListener("click", () => {
    detailState.reviewRating = Number(button.dataset.reviewRating);
    document.querySelector("[data-review-rating-error]").textContent = "";
    document.querySelectorAll("[data-review-rating]").forEach(item => {
      item.classList.toggle("active", Number(item.dataset.reviewRating) <= detailState.reviewRating);
    });
  });
});

const reviewComment = detailEls.reviewForm.elements.comment;
reviewComment.addEventListener("input", () => {
  document.querySelector("[data-review-character-count]").textContent = reviewComment.value.length;
});

detailEls.reviewForm.addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.querySelector("[data-review-submit-message]");

  if (detailState.reviewRating === 0) {
    document.querySelector("[data-review-rating-error]").textContent = "Choose a rating before submitting.";
    return;
  }

  const formData = new FormData(detailEls.reviewForm);
  const payload = {
    productId: detailState.product.id,
    rating: detailState.reviewRating,
    title: formData.get("title").trim(),
    comment: formData.get("comment").trim()
  };

  try {
    const response = await fetch("/api/addReview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json") ? await response.json() : {};

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to submit review");
    }

    detailEls.reviewForm.reset();
    detailState.reviewRating = 0;
    document.querySelectorAll("[data-review-rating]").forEach(item => item.classList.remove("active"));
    document.querySelector("[data-review-character-count]").textContent = "0";
    detailEls.reviewDialog.close();
    showToast("Thanks for sharing your review");
    await loadProduct();
  } catch (error) {
    console.error("Failed to submit review", error);
    message.textContent = error.message;
  }
});

updateCartCount();
loadProduct();
window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons();
});
