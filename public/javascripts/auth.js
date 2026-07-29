function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showFieldError(input, message) {
  const control = input.closest(".input-control");
  const errorKey = input.dataset.terms !== undefined ? "terms" : input.id;
  const error = document.querySelector(`[data-error-for="${errorKey}"]`);

  if (control) control.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message;
}

function validateInput(input) {
  const value = input.value.trim();
  let message = "";

  if (input.required && !value) {
    message = "This field is required.";
  } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = "Enter a valid email address.";
  } else if (input.type === "password" && value.length < 8) {
    message = "Password must be at least 8 characters.";
  }

  if (input.dataset.confirmPassword !== undefined) {
    const password = document.querySelector("[data-new-password]");
    if (value && password && value !== password.value) {
      message = "Passwords do not match.";
    }
  }

  showFieldError(input, message);
  return !message;
}

document.querySelectorAll("[data-password-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    button.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
    button.innerHTML = `<i data-lucide="${willShow ? "eye-off" : "eye"}" aria-hidden="true"></i>`;
    refreshIcons();
  });
});

document.querySelectorAll("[data-auth-form] input").forEach(input => {
  input.addEventListener("blur", () => {
    if (input.type !== "checkbox") validateInput(input);
  });
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") validateInput(input);
  });
});

const newPassword = document.querySelector("[data-new-password]");
if (newPassword) {
  newPassword.addEventListener("input", () => {
    const value = newPassword.value;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[a-z]/i.test(value) && /\d/.test(value)) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/[^a-z0-9]/i.test(value) && value.length >= 10) score += 1;

    document.querySelector(".password-strength").dataset.score = String(score);
    document.querySelector("[data-password-hint]").textContent = [
      "Use 8+ characters with a number.",
      "Password strength: weak",
      "Password strength: fair",
      "Password strength: good",
      "Password strength: strong"
    ][score];
  });
}

document.querySelectorAll("[data-auth-form]").forEach(form => {
  form.addEventListener("submit", event => {
    const inputs = [...form.querySelectorAll("input:not([type='checkbox'])")];
    const validFields = inputs.map(validateInput).every(Boolean);
    const terms = form.querySelector("[data-terms]");
    let validTerms = true;

    if (terms && !terms.checked) {
      document.querySelector("[data-error-for='terms']").textContent = "You must accept the terms to continue.";
      validTerms = false;
    } else if (terms) {
      document.querySelector("[data-error-for='terms']").textContent = "";
    }

    if (!validFields || !validTerms) {
      event.preventDefault();
      form.querySelector("[aria-invalid='true']")?.focus();
    }
  });
});

const params = new URLSearchParams(window.location.search);
const serverMessage = document.querySelector("[data-server-message]");
if (serverMessage && params.get("error")) {
  serverMessage.textContent = params.get("error");
  serverMessage.hidden = false;
}

window.addEventListener("load", refreshIcons);
