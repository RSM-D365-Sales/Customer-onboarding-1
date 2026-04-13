/**
 * Joy Baking Group — Customer Onboarding Portal
 * main.js — UI interactions, form validation, file uploads
 */

'use strict';

/* ============================================================
   POWER AUTOMATE INTEGRATION
   ============================================================
   STEP 1 — In Power Automate, create an instant cloud flow with
             the trigger: "When an HTTP request is received".
             Set the request body JSON schema to match the
             registrationData object below.

   STEP 2 — After saving the flow, Power Automate will generate
             a unique HTTPS URL. Paste it as the value below.

   STEP 3 — In callPowerAutomateFlow(), uncomment the fetch block
             and remove the simulation block beneath it.
   ============================================================ */
var POWER_AUTOMATE_FLOW_URL = 'https://7334890904dae19abaf9c87c4f89f2.00.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d2b1b198ef5b4cde8adc1f0c29a64f61/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_szm5m3QjZW9VvXBYxvn4bcCvAzmIOvy-gVKdBuFwIc';

/**
 * Sends the registration payload to the Power Automate HTTP trigger.
 * Returns a Promise that resolves when the call completes.
 *
 * Expected JSON schema for the flow trigger (use this in Power Automate
 * "Generate from sample" to auto-create the schema):
 * {
 *   "refNumber":    "JBG-2026-000001",
 *   "submittedAt":  "2026-04-13T12:00:00.000Z",
 *   "orgName":      "Sunshine Ice Cream Co.",
 *   "industry":     "Food Service & Restaurants",
 *   "orgSize":      "51-200 employees",
 *   "website":      "https://example.com",
 *   "country":      "United States",
 *   "state":        "Ohio",
 *   "city":         "Columbus",
 *   "firstName":    "Jane",
 *   "lastName":     "Smith",
 *   "contactName":  "Jane Smith",
 *   "jobTitle":     "VP of Procurement",
 *   "email":        "jane@example.com",
 *   "phone":        "(555) 000-0000",
 *   "products":     ["cake-cones", "sugar-cones"],
 *   "channel":      "Food Service – Direct",
 *   "volume":       "1,000 – 10,000 units/cases",
 *   "timeline":     "1–3 months",
 *   "description":  "Looking to source cones for 12 locations."
 * }
 */
function callPowerAutomateFlow(payload) {
  return new Promise(function (resolve, reject) {

    // ── TODO: Remove this simulation block once the flow URL is configured ──
    /*if (POWER_AUTOMATE_FLOW_URL === 'YOUR_POWER_AUTOMATE_HTTP_TRIGGER_URL_HERE') {
      console.log('[Power Automate] Flow URL not yet configured — simulating submission.');
      console.log('[Power Automate] Payload that will be sent:', JSON.stringify(payload, null, 2));
      setTimeout(resolve, 1500); // simulate network delay
      return;
    }*/

    // ── Uncomment below (and remove the simulation block above) once the URL is set ──
    fetch(POWER_AUTOMATE_FLOW_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload)
     })
     .then(function (response) {
       if (!response.ok) { throw new Error('Flow returned HTTP ' + response.status); }
       resolve(response);
     })
     .catch(function (err) {
       console.error('[Power Automate] Flow call failed:', err);
       reject(err);
     });
  });
}

/* ============================================================
   NAVIGATION — Mobile hamburger toggle
   ============================================================ */
(function initNav() {
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ============================================================
   SMOOTH SCROLL — for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   FILE UPLOAD — Drag-and-drop + click upload
   ============================================================ */
(function initFileUpload() {
  var zone      = document.getElementById('uploadZone');
  var input     = document.getElementById('fileInput');
  var fileList  = document.getElementById('fileList');
  if (!zone || !input || !fileList) return;

  var uploadedFiles = [];

  // Helper: Format bytes to human-readable
  function formatSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Helper: Get file icon emoji by extension
  function getFileIcon(name) {
    var ext = name.split('.').pop().toLowerCase();
    var icons = {
      pdf: '📄', doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️'
    };
    return icons[ext] || '📎';
  }

  // Helper: Sanitize display name (no HTML injection)
  function sanitizeName(name) {
    return name.replace(/[<>&"']/g, function(c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Render the file list
  function renderFileList() {
    fileList.innerHTML = '';
    uploadedFiles.forEach(function (file, index) {
      var item = document.createElement('div');
      item.className = 'file-item';
      item.setAttribute('role', 'listitem');

      var icon = document.createElement('span');
      icon.className = 'file-item-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = getFileIcon(file.name);

      var nameEl = document.createElement('span');
      nameEl.className = 'file-item-name';
      nameEl.textContent = file.name;        // Safe — textContent, not innerHTML

      var sizeEl = document.createElement('span');
      sizeEl.className = 'file-item-size';
      sizeEl.textContent = formatSize(file.size);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'file-item-remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + file.name);
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', function () {
        uploadedFiles.splice(index, 1);
        renderFileList();
      });

      item.appendChild(icon);
      item.appendChild(nameEl);
      item.appendChild(sizeEl);
      item.appendChild(removeBtn);
      fileList.appendChild(item);
    });
  }

  // Validate and add files
  function addFiles(newFiles) {
    var maxSize = 10 * 1024 * 1024; // 10 MB
    var allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

    Array.from(newFiles).forEach(function (file) {
      var ext = file.name.split('.').pop().toLowerCase();

      if (!allowed.includes(ext)) {
        showToast('File type not supported: ' + file.name, 'error');
        return;
      }
      if (file.size > maxSize) {
        showToast('File exceeds 10 MB limit: ' + file.name, 'error');
        return;
      }
      // Check for duplicate name
      var isDuplicate = uploadedFiles.some(function (f) { return f.name === file.name; });
      if (isDuplicate) {
        showToast('File already added: ' + file.name, 'error');
        return;
      }
      uploadedFiles.push(file);
    });
    renderFileList();
  }

  // Click on zone triggers file picker
  zone.addEventListener('click', function (e) {
    if (e.target !== input) input.click();
  });

  // Keyboard: Enter / Space activates zone
  zone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  // File input change
  input.addEventListener('change', function () {
    addFiles(this.files);
    this.value = ''; // Reset so same file can be re-added if removed
  });

  // Drag & Drop
  zone.addEventListener('dragover', function (e) {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', function (e) {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    zone.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });
})();

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type) {
  type = type || 'info';

  var toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'background:' + (type === 'error' ? '#C0392B' : type === 'success' ? '#2E7D52' : '#333'),
    'color:#fff',
    'padding:12px 20px',
    'border-radius:8px',
    'font-size:0.88rem',
    'font-family:var(--font-body)',
    'box-shadow:0 4px 16px rgba(0,0,0,0.2)',
    'z-index:9999',
    'max-width:320px',
    'line-height:1.4',
    'transform:translateY(20px)',
    'opacity:0',
    'transition:all 0.25s ease'
  ].join(';');
  toast.textContent = message;  // Safe — textContent

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  // Auto remove after 4s
  setTimeout(function () {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity   = '0';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 280);
  }, 4000);
}

/* ============================================================
   FORM VALIDATION & SUBMISSION
   ============================================================ */
(function initForm() {
  var form = document.getElementById('registrationForm');
  if (!form) return;

  // Remove HTML required attributes so browser-native validation never fires.
  // The visual asterisks (*) in the labels are kept; only the blocking behaviour is removed.
  form.querySelectorAll('[required]').forEach(function (el) {
    el.removeAttribute('required');
  });

  // Required field definitions
  var requiredFields = [
    { id: 'orgName',    label: 'Organization Name' },
    { id: 'industry',   label: 'Industry' },
    { id: 'orgSize',    label: 'Organization Size' },
    { id: 'country',    label: 'Country' },
    { id: 'state',      label: 'State / Province' },
    { id: 'city',       label: 'City' },
    { id: 'firstName',  label: 'First Name' },
    { id: 'lastName',   label: 'Last Name' },
    { id: 'jobTitle',   label: 'Job Title' },
    { id: 'email',      label: 'Email Address' },
    { id: 'phone',      label: 'Phone Number' },
    { id: 'channel',    label: 'Distribution Channel' },
    { id: 'volume',     label: 'Estimated Monthly Volume' },
    { id: 'timeline',   label: 'Expected Start Timeline' },
  ];

  // Show/clear field error
  function setFieldError(fieldId, message) {
    var el    = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + '-error');
    if (el) el.classList.toggle('error', !!message);
    if (errEl) {
      errEl.textContent = message || '';
      errEl.classList.toggle('visible', !!message);
    }
  }

  // Validate email
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  // Validate phone (permissive — allow digits, spaces, dashes, parens, +)
  function isValidPhone(val) {
    return /^[\d\s\-()+]{7,20}$/.test(val.trim());
  }

  // Validate URL (optional field — empty is ok)
  function isValidUrl(val) {
    if (!val) return true;
    try { new URL(val); return true; }
    catch(e) { return false; }
  }

  // Inline format hints on blur (email/phone/url only — blank is always allowed)
  requiredFields.forEach(function (field) {
    var el = document.getElementById(field.id);
    if (!el) return;
    el.addEventListener('blur', function () {
      var val = el.value.trim();
      if (!val) { setFieldError(field.id, ''); return; } // blank is fine
      if (field.id === 'email' && !isValidEmail(val)) {
        setFieldError(field.id, 'Please enter a valid email address.');
      } else if (field.id === 'phone' && !isValidPhone(val)) {
        setFieldError(field.id, 'Please enter a valid phone number.');
      } else {
        setFieldError(field.id, '');
      }
    });
    el.addEventListener('input', function () {
      // Clear format errors as user types
      if (el.classList.contains('error')) setFieldError(field.id, '');
    });
  });

  function validateField(field) {
    // Format-only checks — blank values are permitted for demo purposes
    var el = document.getElementById(field.id);
    if (!el) return true;
    var val = el.value.trim();
    if (!val) return true;
    if (field.id === 'email' && !isValidEmail(val)) {
      setFieldError(field.id, 'Please enter a valid email address.');
      return false;
    }
    if (field.id === 'phone' && !isValidPhone(val)) {
      setFieldError(field.id, 'Please enter a valid phone number.');
      return false;
    }
    setFieldError(field.id, '');
    return true;
  }

  // Website field optional but should be valid if provided
  var websiteEl = document.getElementById('website');
  if (websiteEl) {
    websiteEl.addEventListener('blur', function () {
      if (websiteEl.value && !isValidUrl(websiteEl.value)) {
        setFieldError('website', 'Please enter a valid URL (e.g., https://yourcompany.com).');
      } else {
        setFieldError('website', '');
      }
    });
  }

  // Generate reference number
  function generateRef() {
    var now  = new Date();
    var year = now.getFullYear();
    var seq  = String(Math.floor(Math.random() * 99999) + 1).padStart(6, '0');
    return 'JBG-' + year + '-' + seq;
  }

  // Collect select label (not just value)
  function getSelectLabel(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    var opt = el.options[el.selectedIndex];
    return opt ? opt.textContent.trim() : '';
  }

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Format-only checks on any filled fields (blank is always allowed)
    requiredFields.forEach(function (field) { validateField(field); });
    if (websiteEl && websiteEl.value && !isValidUrl(websiteEl.value)) {
      setFieldError('website', 'Please enter a valid URL.');
    }

    // Collect checked products (none selected is fine for demo)
    var checkedProducts = form.querySelectorAll('input[name="products"]:checked');

    // --- Simulate submission ---
    var submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    // Collect form data for the success page
    var selectedProducts = Array.from(checkedProducts).map(function (cb) { return cb.value; });
    var registrationData = {
      refNumber:    generateRef(),
      submittedAt:  new Date().toISOString(),
      orgName:      document.getElementById('orgName').value.trim(),
      industry:     getSelectLabel('industry'),
      orgSize:      getSelectLabel('orgSize'),
      website:      (document.getElementById('website') ? document.getElementById('website').value.trim() : ''),
      country:      getSelectLabel('country'),
      state:        getSelectLabel('state'),
      city:         document.getElementById('city').value.trim(),
      firstName:    document.getElementById('firstName').value.trim(),
      lastName:     document.getElementById('lastName').value.trim(),
      contactName:  document.getElementById('firstName').value.trim() + ' ' + document.getElementById('lastName').value.trim(),
      jobTitle:     document.getElementById('jobTitle').value.trim(),
      email:        document.getElementById('email').value.trim(),
      phone:        document.getElementById('phone').value.trim(),
      products:     selectedProducts,
      channel:      getSelectLabel('channel'),
      volume:       getSelectLabel('volume'),
      timeline:     getSelectLabel('timeline'),
      description:  (document.getElementById('description') ? document.getElementById('description').value.trim() : '')
    };

    // Persist to sessionStorage for success page
    try {
      sessionStorage.setItem('jbg_registration', JSON.stringify(registrationData));
    } catch(e) { /* storage unavailable — non-fatal */ }

    // Fire Power Automate call without blocking the redirect on it.
    // For demo: always navigate to success after a brief delay regardless of flow outcome.
    callPowerAutomateFlow(registrationData).catch(function (err) {
      console.error('[Power Automate] Flow call failed:', err);
    });

    setTimeout(function () {
      window.location.href = 'success.html';
    }, 1500);
  });
})();

/* ============================================================
   DESCRIPTION CHARACTER COUNTER
   ============================================================ */
(function initCharCounter() {
  var textarea = document.getElementById('description');
  if (!textarea) return;
  var maxChars = 2000;

  var hint = textarea.nextElementSibling;
  if (!hint || !hint.classList.contains('field-hint')) return;

  textarea.addEventListener('input', function () {
    var remaining = maxChars - textarea.value.length;
    if (remaining < 0) {
      textarea.value = textarea.value.substring(0, maxChars);
      remaining = 0;
    }
    hint.textContent = remaining + ' characters remaining.';
    hint.style.color = remaining < 100 ? 'var(--joy-orange)' : 'var(--joy-gray)';
  });
})();
