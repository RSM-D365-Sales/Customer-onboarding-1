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
var POWER_AUTOMATE_FLOW_URL = '__POWER_AUTOMATE_FLOW_URL__';

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

    // If the URL hasn't been injected yet (local dev or secret not set), log and skip.
    if (!POWER_AUTOMATE_FLOW_URL || POWER_AUTOMATE_FLOW_URL.indexOf('__') === 0) {
      console.log('[Power Automate] URL not configured — skipping flow call (demo mode).');
      console.log('[Power Automate] Payload:', JSON.stringify(payload, null, 2));
      resolve();
      return;
    }

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
// Declared here so the form submit handler can read it too
var uploadedFiles = [];

(function initFileUpload() {
  var zone      = document.getElementById('uploadZone');
  var input     = document.getElementById('fileInput');
  var fileList  = document.getElementById('fileList');
  if (!zone || !input || !fileList) return;

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
   PDF GENERATION — Application Summary Report
   Requires: jsPDF UMD loaded via CDN before this script.
   Returns the jsPDF document instance (caller can save/export).
   ============================================================ */
function generateApplicationPDF(data) {
  var jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) { throw new Error('jsPDF library not loaded.'); }

  var doc = new jsPDF({ unit: 'mm', format: 'a4' });
  var PW = 210, PH = 297, ML = 15, MR = 15, CW = PW - ML - MR;
  var y  = 0;

  /* ---- Brand palette ---- */
  var CO  = [232, 100,  10];   // JBG orange
  var COL = [255, 218, 185];   // orange light
  var CD  = [ 28,  28,  28];   // dark text
  var CG  = [110, 110, 110];   // gray label
  var CL  = [248, 247, 244];   // cream background
  var CB  = [222, 220, 214];   // border / separator
  var CW_ = [255, 255, 255];   // white

  /* ---- Helpers ---- */
  function checkPage(needed) {
    if (y + (needed || 20) > PH - 18) { doc.addPage(); y = 15; }
  }

  function drawSection(title) {
    checkPage(18);
    doc.setFillColor(CL[0], CL[1], CL[2]);
    doc.rect(ML, y, CW, 9, 'F');
    doc.setFillColor(CO[0], CO[1], CO[2]);
    doc.rect(ML, y, 3, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(CD[0], CD[1], CD[2]);
    doc.text(title, ML + 7, y + 6);
    y += 13;
  }

  // pairs: array of rows, each row is an array of 1-2 {label, value} objects
  function drawRows(pairs) {
    pairs.forEach(function(row) {
      checkPage(14);
      var colW = CW / 2;
      for (var i = 0; i < Math.min(row.length, 2); i++) {
        var f    = row[i];
        var xOff = ML + i * colW;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(CG[0], CG[1], CG[2]);
        doc.text(String(f.label).toUpperCase(), xOff, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(CD[0], CD[1], CD[2]);
        doc.text(String(f.value || '\u2014'), xOff, y + 6);
      }
      doc.setDrawColor(CB[0], CB[1], CB[2]);
      doc.setLineWidth(0.1);
      doc.line(ML, y + 10, ML + CW, y + 10);
      y += 14;
    });
    y += 2;
  }

  function drawFullField(label, value) {
    if (!value) return;
    var lines  = doc.splitTextToSize(String(value), CW);
    var lineH  = 4.5;
    checkPage(10 + lines.length * lineH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(CG[0], CG[1], CG[2]);
    doc.text(String(label).toUpperCase(), ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(CD[0], CD[1], CD[2]);
    doc.text(lines, ML, y + 6);
    doc.setDrawColor(CB[0], CB[1], CB[2]);
    doc.setLineWidth(0.1);
    doc.line(ML, y + 7 + lines.length * lineH, ML + CW, y + 7 + lines.length * lineH);
    y += 7 + lines.length * lineH + 5;
  }

  /* ---- Product key → display label ---- */
  var PROD = {
    'cake-cones':    'Cake Cones',
    'sugar-cones':   'Sugar Cones',
    'waffle-cones':  'Waffle Cones',
    'waffle-bowls':  'Waffle Bowls',
    'gluten-free':   'Gluten-Free Cones',
    'private-label': 'Private Label / Custom'
  };

  /* ======================================================
     HEADER BANNER
     ====================================================== */
  doc.setFillColor(CO[0], CO[1], CO[2]);
  doc.rect(0, 0, PW, 42, 'F');

  // Logo circle
  doc.setFillColor(CW_[0], CW_[1], CW_[2]);
  doc.circle(ML + 9, 21, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(CO[0], CO[1], CO[2]);
  doc.text('J', ML + 9, 25.5, { align: 'center' });

  // Title / subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(CW_[0], CW_[1], CW_[2]);
  doc.text('Joy Baking Group', ML + 22, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COL[0], COL[1], COL[2]);
  doc.text('Customer Application \u2014 Onboarding Request', ML + 22, 26);

  // Reference + submitted date (top-right)
  var fmtDate = '';
  try {
    fmtDate = new Date(data.submittedAt || Date.now())
      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch(e) { fmtDate = String(data.submittedAt || ''); }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COL[0], COL[1], COL[2]);
  doc.text('REFERENCE NUMBER', PW - MR, 12, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(CW_[0], CW_[1], CW_[2]);
  doc.text(String(data.refNumber || 'N/A'), PW - MR, 20.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COL[0], COL[1], COL[2]);
  doc.text('SUBMITTED', PW - MR, 29, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(CW_[0], CW_[1], CW_[2]);
  doc.text(fmtDate, PW - MR, 36.5, { align: 'right' });

  y = 50;

  /* ======================================================
     SECTION 1 — COMPANY INFORMATION
     ====================================================== */
  var location = [data.city, data.state, data.country].filter(Boolean).join(', ');
  drawSection('Company Information');
  drawRows([
    [{ label: 'Organization Name', value: data.orgName  }, { label: 'Industry',        value: data.industry      }],
    [{ label: 'Organization Size', value: data.orgSize  }, { label: 'Annual Revenue',  value: data.annualRevenue }],
    [{ label: 'Location',          value: location      }, { label: 'Website',         value: data.website       }]
  ]);

  /* ======================================================
     SECTION 2 — PRIMARY CONTACT
     ====================================================== */
  drawSection('Primary Contact');
  drawRows([
    [{ label: 'Contact Name',            value: data.contactName      }, { label: 'Job Title', value: data.jobTitle }],
    [{ label: 'Email Address',           value: data.email            }, { label: 'Phone',     value: data.phone   }],
    [{ label: 'Preferred Contact Method', value: data.preferredContact }]
  ]);

  /* ======================================================
     SECTION 3 — PRODUCT INTERESTS & REQUIREMENTS
     ====================================================== */
  drawSection('Product Interests & Requirements');
  drawRows([
    [{ label: 'Distribution Channel',    value: data.channel  }, { label: 'Est. Monthly Volume', value: data.volume   }],
    [{ label: 'Expected Start Timeline', value: data.timeline }, { label: 'Est. Annual Spend',   value: data.budget   }],
    [{ label: 'Geographic Coverage',     value: data.geo      }]
  ]);

  // Products of interest — pill tags
  var prodLabels = Array.isArray(data.products)
    ? data.products.map(function(p) { return PROD[p] || p; })
    : [];

  if (prodLabels.length > 0) {
    checkPage(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(CG[0], CG[1], CG[2]);
    doc.text('PRODUCTS OF INTEREST', ML, y);
    y += 5;

    var tagX = ML, tagH = 6.5;
    doc.setFontSize(8);
    prodLabels.forEach(function(p) {
      var tagW = doc.getTextWidth(p) + 8;
      if (tagX + tagW > ML + CW) { tagX = ML; y += tagH + 3; checkPage(tagH + 4); }
      doc.setFillColor(CO[0], CO[1], CO[2]);
      doc.roundedRect(tagX, y, tagW, tagH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(CW_[0], CW_[1], CW_[2]);
      doc.text(p, tagX + 4, y + 4.6);
      tagX += tagW + 3;
    });
    y += tagH + 8;
  }

  drawFullField('Project Description / Additional Requirements', data.description);

  /* ======================================================
     SECTION 4 — ATTACHED DOCUMENTS (customer-uploaded only)
     ====================================================== */
  var attachments = (data.files || []).filter(function(f) {
    var n = f.fileName || '';
    return n && !/Application\.pdf$/i.test(n);   // exclude the summary PDF itself
  });

  if (attachments.length > 0) {
    drawSection('Attached Supporting Documents');
    attachments.forEach(function(file, idx) {
      checkPage(10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(CD[0], CD[1], CD[2]);
      doc.text((idx + 1) + '.   ' + (file.fileName || 'Unknown'), ML + 4, y + 1);
      y += 7;
    });
  }

  /* ======================================================
     FOOTER — printed on every page
     ====================================================== */
  var totalPages = doc.internal.getNumberOfPages();
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(CL[0], CL[1], CL[2]);
    doc.rect(0, PH - 13, PW, 13, 'F');
    doc.setDrawColor(CB[0], CB[1], CB[2]);
    doc.setLineWidth(0.3);
    doc.line(0, PH - 13, PW, PH - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(CG[0], CG[1], CG[2]);
    doc.text(
      'Generated by Joy Baking Group Customer Portal  \u2022  Confidential \u2014 For Internal Use Only',
      ML, PH - 5.5
    );
    doc.text('Page ' + pg + ' of ' + totalPages, PW - MR, PH - 5.5, { align: 'right' });
  }

  return doc;
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
      products:         selectedProducts,
      channel:          getSelectLabel('channel'),
      volume:           getSelectLabel('volume'),
      timeline:         getSelectLabel('timeline'),
      budget:           getSelectLabel('budget'),
      geo:              getSelectLabel('geo'),
      description:      (document.getElementById('description') ? document.getElementById('description').value.trim() : ''),
      annualRevenue:    getSelectLabel('annualRevenue'),
      preferredContact: getSelectLabel('preferredContact')
    };

    // Persist to sessionStorage for success page
    try {
      sessionStorage.setItem('jbg_registration', JSON.stringify(registrationData));
    } catch(e) { /* storage unavailable — non-fatal */ }

    // Base64-encode all uploaded files, then fire the PA flow.
    function readFileAsBase64(file) {
      return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function (evt) {
          var bytes = new Uint8Array(evt.target.result);
          // Process in 32KB chunks to avoid call stack overflow on large files
          var chunkSize = 0x8000;
          var parts = [];
          for (var i = 0; i < bytes.length; i += chunkSize) {
            parts.push(String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length))));
          }
          resolve({ fileName: file.name, fileType: file.type, fileContentBase64: btoa(parts.join('')) });
        };
        reader.onerror = function () { resolve(null); };
        reader.readAsArrayBuffer(file);  // More reliable than readAsDataURL for binary files
      });
    }

    Promise.all(uploadedFiles.map(readFileAsBase64)).then(function (encodedFiles) {
      registrationData.files = encodedFiles.filter(Boolean);

      // Generate the Application Summary PDF, download it, and embed it in the payload.
      try {
        if (window.jspdf && window.jspdf.jsPDF) {
          var pdfDoc  = generateApplicationPDF(registrationData);
          var safeOrg = (registrationData.orgName || 'Customer')
            .replace(/[^a-zA-Z0-9]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
          var pdfName = registrationData.refNumber + '_' + safeOrg + '_Application.pdf';
          var pdfB64  = pdfDoc.output('datauristring').split(',')[1];
          // Append PDF so Power Automate receives it alongside any uploaded docs
          registrationData.files.push({ fileName: pdfName, fileType: 'application/pdf', fileContentBase64: pdfB64 });
          // Trigger browser download into the user's Downloads folder
          pdfDoc.save(pdfName);
          // Persist file names (no content) so the success page can list them in a re-download
          try {
            sessionStorage.setItem('jbg_file_names', JSON.stringify(
              registrationData.files.map(function(f) { return f.fileName || ''; })
            ));
          } catch(se) { /* storage unavailable — non-fatal */ }
        }
      } catch(pdfErr) {
        console.error('[PDF] Application summary generation failed:', pdfErr);
      }

      callPowerAutomateFlow(registrationData).catch(function (err) {
        console.error('[Power Automate] Flow call failed:', err);
      });

      setTimeout(function () {
        window.location.href = 'success.html';
      }, 1500);
    }).catch(function (err) {
      // File encoding failed — still redirect so demo never stalls
      console.error('[Form] File encoding error:', err);
      window.location.href = 'success.html';
    });
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
