
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

const categoryFilter = document.getElementById("categoryFilter");
const serviceCards = [...document.querySelectorAll(".service-card")];
const resultsCount = document.getElementById("resultsCount");
const emptyMessage = document.getElementById("emptyMessage");

const bookingForm = document.getElementById("bookingForm");
const formStatus = document.getElementById("formStatus");
const confirmation = document.getElementById("confirmation");
const confirmationDetails = document.getElementById("confirmationDetails");

const bookingDate = document.getElementById("bookingDate");
const serviceSelect = document.getElementById("service");

document.getElementById("year").textContent =
  new Date().getFullYear();

// Set today's date as the earliest selectable date.
function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

bookingDate.min = getLocalDate();

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("active");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navbar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Service category filter
function filterServices() {
  const selectedCategory = categoryFilter.value;
  let visibleCount = 0;

  serviceCards.forEach((card) => {
    const matches =
      selectedCategory === "all" ||
      card.dataset.category === selectedCategory;

    card.hidden = !matches;

    if (matches) {
      visibleCount++;
    }
  });

  resultsCount.textContent =
    `${visibleCount} service${visibleCount === 1 ? "" : "s"} found`;

  emptyMessage.hidden = visibleCount !== 0;
}

categoryFilter.addEventListener("change", filterServices);
filterServices();

// Choose a service from a card
document.querySelectorAll(".select-service").forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;

    document.getElementById("booking").scrollIntoView({
      behavior: "smooth"
    });

    serviceSelect.focus();
  });
});

// Error message helpers
function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);

  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
}

function clearErrors() {
  [
    ["fullName", "nameError"],
    ["email", "emailError"],
    ["phone", "phoneError"],
    ["service", "serviceError"],
    ["bookingDate", "dateError"],
    ["bookingTime", "timeError"]
  ].forEach(([fieldId, errorId]) => {
    showError(fieldId, errorId, "");
  });

  formStatus.textContent = "";
}

function validateForm() {
  clearErrors();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = serviceSelect.value;
  const date = bookingDate.value;
  const time = document.getElementById("bookingTime").value;

  let valid = true;
  let firstInvalidField = null;

  function reject(fieldId, errorId, message) {
    showError(fieldId, errorId, message);
    valid = false;

    if (!firstInvalidField) {
      firstInvalidField = document.getElementById(fieldId);
    }
  }

  if (name.length < 2) {
    reject("fullName", "nameError",
      "Please enter a name with at least 2 characters.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    reject("email", "emailError",
      "Please enter a valid email address.");
  }

  // Accept common Pakistani mobile formats:
  // 03XXXXXXXXX, +923XXXXXXXXX, 00923XXXXXXXXX
  const phonePattern = /^(?:(?:\+92|0092|0)?3\d{9})$/;

  if (!phonePattern.test(phone.replace(/[\s-]/g, ""))) {
    reject("phone", "phoneError",
      "Enter a valid Pakistani mobile number.");
  }

  if (!service) {
    reject("service", "serviceError",
      "Please select a service.");
  }

  if (!date) {
    reject("bookingDate", "dateError",
      "Please select a date.");
  } else if (date < getLocalDate()) {
    reject("bookingDate", "dateError",
      "The date cannot be in the past.");
  }

  if (!time) {
    reject("bookingTime", "timeError",
      "Please select a preferred time.");
  }

  if (!valid && firstInvalidField) {
    firstInvalidField.focus();
  }

  return valid;
}

// Submit and simulate booking confirmation
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  confirmation.hidden = true;

  if (!validateForm()) {
    formStatus.textContent =
      "Please correct the highlighted fields and try again.";
    return;
  }

  const name = document.getElementById("fullName").value.trim();
  const service = serviceSelect.value;
  const date = bookingDate.value;
  const time = document.getElementById("bookingTime").value;
  const email = document.getElementById("email").value.trim();

  const readableDate = new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const readableTime = new Date(
    `2000-01-01T${time}:00`
  ).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  // Use textContent to safely display user-provided values.
  confirmationDetails.textContent =
    `Name: ${name} | Email: ${email} | ` +
    `Service: ${service} | Date: ${readableDate} | ` +
    `Time: ${readableTime}`;

  formStatus.textContent = "";
  confirmation.hidden = false;

  confirmation.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  confirmation.querySelector("h3").focus?.();
});

// Start a new booking
document.getElementById("newBooking").addEventListener("click", () => {
  bookingForm.reset();
  clearErrors();

  confirmation.hidden = true;
  bookingDate.min = getLocalDate();

  bookingForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  document.getElementById("fullName").focus();
});
