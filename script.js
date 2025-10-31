/* =====================
   Discount Calculator
   ===================== */
const courseForm = document.getElementById("courseForm");
const totalSpan = document.getElementById("total");
const savingsSpan = document.getElementById("savings");

if (courseForm) {
  const checkboxes = courseForm.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      let prices = [];
      checkboxes.forEach(box => {
        if (box.checked) prices.push(Number(box.value));
      });

      let total = prices.reduce((a, b) => a + b, 0);
      let discount = 0;

      if (prices.length === 2) discount = 0.05;
      else if (prices.length === 3) discount = 0.10;
      else if (prices.length >= 4) discount = 0.15;

      let savings = total * discount;
      let finalTotal = total - savings;

      totalSpan.textContent = finalTotal.toFixed(2);
      savingsSpan.textContent = "R" + savings.toFixed(2);
    });
  });
}

/* =====================
   Form Validation
   (Login, Signup, Contact)
   ===================== */
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    let valid = true;
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach(input => {
      if (input.hasAttribute("required") && !input.value.trim()) {
        valid = false;
        input.style.border = "2px solid red";
      } else {
        input.style.border = "1px solid #ccc";
      }
    });

    if (!valid) {
      e.preventDefault();
      alert("⚠ Please fill in all required fields.");
    }
  });
}

// Apply validation to forms if they exist
validateForm("loginForm");
validateForm("signupForm");
validateForm("contactForm");

/* =====================
   Mobile Menu Toggle*/

const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

/* =====================
   Simple Animation on Scroll
   (for features, testimonials, timeline, etc.)
   ===================== */
const animatedElements = document.querySelectorAll(".feature, .testimonial, .timeline li");

function animateOnScroll() {
  animatedElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", animateOnScroll);
animateOnScroll();
validateForm("registerForm");


