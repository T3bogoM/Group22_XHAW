/* =====================
   Logging Utility
   ===================== */
function logActivity(action, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    details,
    page: window.location.pathname
  };
  console.log(`[LOG] ${timestamp} - ${action}:`, details);
  
  // Store in localStorage for debugging (optional)
  try {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    logs.push(logEntry);
    // Keep only last 50 logs
    if (logs.length > 50) logs.shift();
    localStorage.setItem('activityLogs', JSON.stringify(logs));
  } catch (e) {
    console.warn('Could not save log to localStorage:', e);
  }
}

/* =====================
   Discount Calculator
   ===================== */
const courseForm = document.getElementById("courseForm");
const totalSpan = document.getElementById("total");
const savingsSpan = document.getElementById("savings");

if (courseForm) {
  logActivity('discount_calculator_loaded');
  
  const checkboxes = courseForm.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      let prices = [];
      const selectedCourses = [];
      
      checkboxes.forEach(box => {
        if (box.checked) {
          prices.push(Number(box.value));
          selectedCourses.push(box.parentElement.textContent.trim());
        }
      });

      let total = prices.reduce((a, b) => a + b, 0);
      let discount = 0;

      if (prices.length === 2) discount = 0.05;
      else if (prices.length === 3) discount = 0.10;
      else if (prices.length >= 4) discount = 0.15;

      let savings = total * discount;
      let finalTotal = total - savings;

      if (totalSpan) totalSpan.textContent = finalTotal.toFixed(2);
      if (savingsSpan) savingsSpan.textContent = "R" + savings.toFixed(2);
      
      logActivity('discount_calculated', {
        selectedCourses,
        total,
        discount: discount * 100,
        savings,
        finalTotal
      });
    });
  });
}

/* =====================
   Form Validation with Enhanced Error Handling
   ===================== */
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    logActivity('form_validation_error', { error: 'Form not found', formId });
    return;
  }

  // Remove any existing error messages
  const removeErrors = () => {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.success-message').forEach(el => el.remove());
  };

  // Create error message element
  const createError = (input, message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '-10px';
    errorDiv.style.marginBottom = '10px';
    errorDiv.textContent = message;
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
    input.style.border = "2px solid #d32f2f";
  };

  // Create success message
  const createSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = '#2E7D32';
    successDiv.style.backgroundColor = '#e8f5e9';
    successDiv.style.padding = '10px';
    successDiv.style.borderRadius = '5px';
    successDiv.style.marginBottom = '15px';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (South African format)
  const isValidPhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(\+27|0)[1-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Password validation
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    removeErrors();
    
    let valid = true;
    const errors = [];

    // Validate all inputs
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
      const value = input.value.trim();
      
      // Check required fields
      if (input.hasAttribute("required") && !value) {
        valid = false;
        createError(input, `${input.previousElementSibling?.textContent || 'This field'} is required.`);
        errors.push(`${input.name || input.id}: required field empty`);
      }
      
      // Email validation
      if (input.type === 'email' && value && !isValidEmail(value)) {
        valid = false;
        createError(input, 'Please enter a valid email address.');
        errors.push(`${input.name || input.id}: invalid email format`);
      }
      
      // Phone validation
      if (input.type === 'tel' && value && !isValidPhone(value)) {
        valid = false;
        createError(input, 'Please enter a valid phone number (e.g., +27 11 123 4567 or 011 123 4567).');
        errors.push(`${input.name || input.id}: invalid phone format`);
      }
      
      // Password validation
      if (input.type === 'password' && value && !isValidPassword(value)) {
        valid = false;
        createError(input, 'Password must be at least 6 characters long.');
        errors.push(`${input.name || input.id}: password too short`);
      }
      
      // Confirm password match (for signup form)
      if (input.id === 'signupConfirmPassword' && value) {
        const password = document.getElementById('signupPassword');
        if (password && password.value !== value) {
          valid = false;
          createError(input, 'Passwords do not match.');
          errors.push('password mismatch');
        }
      }
      
      // Clear error styling if valid
      if (valid && input.style.border.includes('red')) {
        input.style.border = "1px solid #ccc";
      }
    });

    if (!valid) {
      logActivity('form_validation_failed', { formId, errors });
      return;
    }

    // Form is valid
    logActivity('form_submitted', { formId, timestamp: new Date().toISOString() });
    createSuccess('✓ Form submitted successfully!');
    
    // In a real application, you would submit to a server here
    // For now, we'll just log the submission
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    logActivity('form_data', { formId, data });
    
    // Reset form after 2 seconds
    setTimeout(() => {
      form.reset();
      removeErrors();
    }, 2000);
  });

  // Real-time validation on input
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => {
      const errorMsg = input.parentNode.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
      
      if (input.hasAttribute('required') && !input.value.trim()) {
        createError(input, `${input.previousElementSibling?.textContent || 'This field'} is required.`);
      } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
        createError(input, 'Please enter a valid email address.');
      } else {
        input.style.border = "1px solid #ccc";
      }
    });
  });
}

// Apply validation to forms if they exist
validateForm("loginForm");
validateForm("signupForm");
validateForm("contactForm");


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

// Initialize form validations
validateForm("registerForm");

// Log page load
document.addEventListener('DOMContentLoaded', () => {
  logActivity('page_loaded', {
    url: window.location.href,
    referrer: document.referrer
  });
  
  // Log navigation clicks
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      logActivity('navigation_click', {
        href: link.href,
        text: link.textContent.trim()
      });
    });
  });
});






