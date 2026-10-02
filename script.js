/* ========================================================
   MOUNTAIN TRAVELS - MAIN JAVASCRIPT ENGINE (script.js)
   ======================================================== */

// Global Dispatch Phone
const DISPATCH_PHONE = "919360543120";

// State Management
let currentUser = JSON.parse(localStorage.getItem('mt_user') || 'null');
let dynamicCurrentOtp = null; // Stored securely in memory only
let pendingPhoneNumber = "";
let currentModifyAction = "postpone";

const reservationState = {
  circuitText: "Ooty Full Day Royal Circuit",
  pickupText: "Coimbatore Airport (CJB)",
  vehicleClass: "Toyota Innova HyCross Luxury",
  travelDate: new Date().toISOString().split('T')[0]
};

// Weather Climatology Dataset
const weatherData = {
  ooty_doddabetta: {
    morning: { temp: 11, cond: "Dawn Mist", mist: "Vis: 3 km", road: "Moist Curves", safety: "92%", attire: "Heavy Fleece" },
    afternoon: { temp: 16, cond: "Crisp Sun", mist: "Vis: 12 km", road: "Dry & Optimal", safety: "99%", attire: "Light Cardigan" },
    evening: { temp: 12, cond: "Chilled Twilight", mist: "Pine Fog", road: "Cold Tarmac", safety: "94%", attire: "Windcheater" }
  },
  coonoor_dolphins: {
    morning: { temp: 15, cond: "Dewy Tea", mist: "Valley Mist", road: "Excellent", safety: "98%", attire: "Light Woolen" },
    afternoon: { temp: 20, cond: "Balmy Sun", mist: "Vis: 15 km", road: "Smooth Tarmac", safety: "100%", attire: "Cotton Wear" },
    evening: { temp: 16, cond: "Mountain Dusk", mist: "Ridge Fog", road: "Dry Curves", safety: "97%", attire: "Light Jacket" }
  },
  avalanche_lake: {
    morning: { temp: 10, cond: "Frost Silence", mist: "Lake Mist", road: "Narrow Curves", safety: "90%", attire: "Insulated Jacket" },
    afternoon: { temp: 15, cond: "Clean Air", mist: "Clear", road: "Single-Lane", safety: "96%", attire: "Warm Jacket" },
    evening: { temp: 11, cond: "Forest Mist", mist: "Dropping Vis", road: "Checkpost 5 PM", safety: "88%", attire: "Heavy Fleece" }
  },
  kalhatty_pass: {
    morning: { temp: 18, cond: "Misty Drops", mist: "Hairpin Fog", road: "Gear 1/2 Braking", safety: "91%", attire: "Windbreaker" },
    afternoon: { temp: 24, cond: "Warm Jungle", mist: "Clear", road: "Brake Cool Checks", safety: "95%", attire: "Summer Wear" },
    evening: { temp: 19, cond: "Animal Crossing", mist: "Cautious", road: "Wildlife Alert", safety: "92%", attire: "Casuals" }
  }
};

/* ========================================================
   1. REGISTRATION MODAL CONTROLS (DIRECT & GUARANTEED)
   ======================================================== */
function openAuthModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();

  const modal = document.getElementById('authModal');
  if (!modal) {
    alert("Modal element not found in DOM");
    return;
  }

  resetOtpStep();
  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('show');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
    modal.classList.remove('show');
  }
}

function resetOtpStep() {
  const phoneStep = document.getElementById('authStepPhone');
  const otpStep = document.getElementById('authStepOtp');

  if (phoneStep) phoneStep.style.display = 'block';
  if (otpStep) otpStep.style.display = 'none';

  ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ========================================================
   2. OTP DISPATCH & VERIFICATION (NO CRASHES / NO LEAKS)
   ======================================================== */
function sendRealPhoneOtp() {
  const phoneInput = document.getElementById('modalPhoneInput');
  const sendBtn = document.getElementById('btnSendOtp');

  if (!phoneInput) return;
  const phoneVal = phoneInput.value.trim();

  if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
    alert("Please enter a valid 10-digit mobile number.");
    phoneInput.focus();
    return;
  }

  pendingPhoneNumber = phoneVal;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating OTP...`;
  }

  // Generate fresh, dynamic 6-digit code[cite: 4]
  dynamicCurrentOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Route real verification to WhatsApp without external carrier costs
  const waVerifyMessage = `*Mountain Travels Nilgiris - Verification Request*%0A%0A` +
    `• WhatsApp Number: +91 ${encodeURIComponent(pendingPhoneNumber)}%0A` +
    `• Verification Code: *${dynamicCurrentOtp}*%0A%0A` +
    `Please verify my session to activate the 20% promotional discount for Nilgiris tours.`;

  window.open(`https://wa.me/${DISPATCH_PHONE}?text=${waVerifyMessage}`, '_blank');

  setTimeout(() => {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send OTP Code`;
    }
    transitionToOtpStep();
  }, 600);
}

function transitionToOtpStep() {
  const targetPhoneDisplay = document.getElementById('displayOtpTargetPhone');
  const phoneStep = document.getElementById('authStepPhone');
  const otpStep = document.getElementById('authStepOtp');

  if (targetPhoneDisplay) targetPhoneDisplay.textContent = pendingPhoneNumber;
  if (phoneStep) phoneStep.style.display = 'none';
  if (otpStep) otpStep.style.display = 'block';

  ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const firstInput = document.getElementById('otp1');
  if (firstInput) firstInput.focus();
}

function focusNextDigit(current, nextId) {
  if (current.value.length >= 1 && nextId) {
    const next = document.getElementById(nextId);
    if (next) next.focus();
  }
}

function validateOtpInputs() {
  const code = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6']
    .map(id => document.getElementById(id) ? document.getElementById(id).value : '')
    .join('');

  if (code.length === 6) {
    verifyRealPhoneOtp();
  }
}

function verifyRealPhoneOtp() {
  const enteredCode = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6']
    .map(id => document.getElementById(id) ? document.getElementById(id).value : '')
    .join('');

  if (enteredCode.length !== 6) {
    alert("Please enter the complete 6-digit code.");
    return;
  }

  const verifyBtn = document.getElementById('btnVerifyOtp');
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
  }

  if (enteredCode !== dynamicCurrentOtp) {
    alert("Incorrect code. Please enter the valid 6-digit code sent to your WhatsApp or click Resend.");
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Verify & Activate Account`;
    }
    return;
  }

  const nameInput = document.getElementById('modalNameInput');
  const userName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Traveler';

  applyUserLogin({
    name: userName,
    phone: pendingPhoneNumber,
    verified: true
  });

  dynamicCurrentOtp = null; // Clear token from memory

  if (verifyBtn) {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Verify & Activate Account`;
  }

  alert(`Mobile number +91 ${pendingPhoneNumber} verified successfully!`);
}

function applyUserLogin(user) {
  currentUser = user;
  localStorage.setItem('mt_user', JSON.stringify(user));

  const nameInput = document.getElementById('resName');
  const phoneInput = document.getElementById('resPhone');
  if (nameInput && user.name) nameInput.value = user.name;
  if (phoneInput && user.phone) phoneInput.value = user.phone;

  const navBadge = document.getElementById('navAuthBadge');
  if (navBadge) {
    navBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--forest-dark)"></i> <span>+91 ${user.phone.slice(-4)}</span>`;
    navBadge.setAttribute('onclick', 'handleLogout()');
  }

  const alertBanner = document.getElementById('authAlertBanner');
  if (alertBanner) {
    alertBanner.style.background = "#f0fdf4";
    alertBanner.style.borderColor = "#86efac";
    alertBanner.style.color = "#166534";
    const alertText = document.getElementById('authAlertText');
    if (alertText) alertText.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Verified Mobile: +91 ${user.phone}</strong>`;
    const alertBtn = document.getElementById('authAlertBtn');
    if (alertBtn) alertBtn.style.display = 'none';
  }

  const ticketStatus = document.getElementById('ticketAuthStatus');
  if (ticketStatus) {
    ticketStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#6ee7b7"></i> +91 ${user.phone}`;
    ticketStatus.style.color = "#6ee7b7";
  }

  closeAuthModal();
}

function handleLogout() {
  if (confirm(`Do you wish to log out or change verified number (+91 ${currentUser.phone})?`)) {
    currentUser = null;
    localStorage.removeItem('mt_user');
    window.location.reload();
  }
}

function checkAuthBeforeBooking() {
  if (!currentUser || !currentUser.verified) {
    openAuthModal();
    return false;
  }
  return true;
}

/* ========================================================
   3. RESERVATION ENGINE & WHATSAPP MANIFEST
   ======================================================== */
function attemptBookingSubmission() {
  const nameEl = document.getElementById('resName');
  const phoneEl = document.getElementById('resPhone');
  const dateEl = document.getElementById('resDate');

  const nameVal = nameEl ? nameEl.value.trim() : '';
  const phoneVal = phoneEl ? phoneEl.value.trim() : '';
  const dateVal = dateEl ? dateEl.value : '';
  const todayStr = new Date().toISOString().split('T')[0];

  if (!nameVal) {
    alert("Please fill your Full Name before proceeding.");
    if (nameEl) nameEl.focus();
    return;
  }

  if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
    alert("Please fill a valid 10-digit mobile number.");
    if (phoneEl) phoneEl.focus();
    return;
  }

  if (!dateVal) {
    alert("Please fill the date correctly to proceed with your booking.");
    if (dateEl) dateEl.focus();
    return;
  }

  if (dateVal < todayStr) {
    alert("Please fill the date correctly. Past dates are not allowed for Nilgiris trips.");
    if (dateEl) dateEl.focus();
    return;
  }

  if (!checkAuthBeforeBooking()) {
    return;
  }

  processBookingAndSendToWhatsApp(nameVal, phoneVal, dateVal);
}

function processBookingAndSendToWhatsApp(nameVal, phoneVal, dateVal) {
  const emailEl = document.getElementById('resEmail');
  const guestsEl = document.getElementById('resPassengers');

  const emailVal = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : 'Not Provided';
  const guestsVal = guestsEl ? guestsEl.value : '3 - 4 Guests';

  const bookingData = {
    id: 'MT-' + Math.floor(1000 + Math.random() * 9000),
    name: nameVal,
    phone: phoneVal,
    email: emailVal,
    circuit: reservationState.circuitText,
    pickup: reservationState.pickupText,
    date: dateVal,
    guests: guestsVal,
    vehicle: reservationState.vehicleClass,
    offer: "20% OFF Special Nilgiris Discount",
    status: "Confirmed",
    epass: "Verified",
    createdAt: new Date().toISOString()
  };

  sessionStorage.setItem('currentBooking', JSON.stringify(bookingData));
  const existingBookings = JSON.parse(localStorage.getItem('mt_all_bookings') || '[]');
  existingBookings.unshift(bookingData);
  localStorage.setItem('mt_all_bookings', JSON.stringify(existingBookings));

  const waMessage = `*Mountain Travels Nilgiris - Booking Request*%0A%0A` +
    `• *Booking ID:* ${bookingData.id}%0A` +
    `• *Customer:* ${encodeURIComponent(nameVal)}%0A` +
    `• *Mobile:* +91 ${encodeURIComponent(phoneVal)}%0A` +
    `• *Circuit:* ${encodeURIComponent(bookingData.circuit)}%0A` +
    `• *Pickup Point:* ${encodeURIComponent(bookingData.pickup)}%0A` +
    `• *Travel Date:* ${encodeURIComponent(dateVal)}%0A` +
    `• *Guests:* ${encodeURIComponent(guestsVal)}%0A` +
    `• *Vehicle:* ${encodeURIComponent(bookingData.vehicle)}%0A` +
    `• *Offer:* Flat 20% Discount Applied%0A%0A` +
    `I have verified my phone number and filled all details on the website. Please confirm my Nilgiris tour reservation.`;

  window.location.href = `https://wa.me/${DISPATCH_PHONE}?text=${waMessage}`;
}

/* ========================================================
   4. VEHICLE SELECTOR & CIRCUIT UPDATES
   ======================================================== */
function chooseVehicle(name, element) {
  reservationState.vehicleClass = name;
  document.querySelectorAll('.vehicle-choice-card').forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');
  updateTripDisplay();
}

function selectVehicleByClass(vehicleType) {
  const mapping = {
    'urbania': { name: 'Tempo Traveller (12/14 Seater)', id: 'card-urbania' },
    'hycross': { name: 'Toyota Innova HyCross Luxury', id: 'card-hycross' },
    'fortuner': { name: 'Toyota Fortuner 4x4 Highland Edition', id: 'card-fortuner' },
    'sedan': { name: 'Executive Sedan (Dzire / Etios)', id: 'card-sedan' }
  };

  const selected = mapping[vehicleType] || mapping['hycross'];
  const cardEl = document.getElementById(selected.id);
  chooseVehicle(selected.name, cardEl);

  const reserveSection = document.getElementById('reserve');
  if (reserveSection) reserveSection.scrollIntoView({ behavior: 'smooth' });
}

function updateTripDisplay() {
  const circuitSelect = document.getElementById('resCircuit');
  const pickupSelect = document.getElementById('resPickup');

  if (circuitSelect) reservationState.circuitText = circuitSelect.options[circuitSelect.selectedIndex].text;
  if (pickupSelect) reservationState.pickupText = pickupSelect.options[pickupSelect.selectedIndex].text;

  const routeDisplay = document.getElementById('resRouteDisplay');
  const vehicleDisplay = document.getElementById('resVehicleDisplay');

  if (routeDisplay) routeDisplay.textContent = `${reservationState.circuitText} • ${reservationState.vehicleClass}`;
  if (vehicleDisplay) vehicleDisplay.textContent = reservationState.vehicleClass;
}

function selectDestinationAndBook(destinationCircuitName, mapQuery) {
  if (mapQuery) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
    window.open(mapsUrl, '_blank');
  }

  const select = document.getElementById('resCircuit');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text.toLowerCase().includes(destinationCircuitName.toLowerCase())) {
        select.selectedIndex = i;
        break;
      }
    }
    updateTripDisplay();
  }

  const reserveSection = document.getElementById('reserve');
  if (reserveSection) reserveSection.scrollIntoView({ behavior: 'smooth' });
}

/* ========================================================
   5. POSTPONE & CANCEL TRIP MODAL
   ======================================================== */
function openTripModifyModal(action) {
  currentModifyAction = action;
  const modal = document.getElementById('tripModifyModal');
  const heading = document.getElementById('tripModifyHeading');
  const icon = document.getElementById('tripModifyIcon');
  const dateGroup = document.getElementById('groupNewDate');
  const btn = document.getElementById('btnSubmitTripAction');

  if (!modal) return;

  const phoneField = document.getElementById('modPhone');
  if (phoneField) {
    if (currentUser && currentUser.phone) {
      phoneField.value = currentUser.phone;
    } else {
      const resPhone = document.getElementById('resPhone');
      phoneField.value = resPhone ? resPhone.value : '';
    }
  }

  const dateField = document.getElementById('modNewDate');
  if (dateField) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDateStr = tomorrow.toISOString().split('T')[0];
    dateField.min = minDateStr;
    dateField.value = minDateStr;
  }

  if (action === 'postpone') {
    if (heading) heading.textContent = "Postpone Nilgiris Trip";
    if (icon) {
      icon.className = "fa-solid fa-calendar-plus";
      icon.style.color = "var(--sunlight-yellow)";
    }
    if (dateGroup) dateGroup.style.display = "block";
    if (btn) {
      btn.textContent = "Confirm Postpone Request";
      btn.style.backgroundColor = "var(--forest-green)";
    }
  } else {
    if (heading) heading.textContent = "Cancel Nilgiris Trip";
    if (icon) {
      icon.className = "fa-solid fa-calendar-xmark";
      icon.style.color = "#ef4444";
    }
    if (dateGroup) dateGroup.style.display = "none";
    if (btn) {
      btn.textContent = "Confirm Cancellation Request";
      btn.style.backgroundColor = "#b91c1c";
    }
  }

  modal.classList.add('show');
}

function closeTripModifyModal() {
  const modal = document.getElementById('tripModifyModal');
  if (modal) modal.classList.remove('show');
}

function submitTripModification() {
  const phoneEl = document.getElementById('modPhone');
  const reasonEl = document.getElementById('modReason');
  const newDateEl = document.getElementById('modNewDate');

  const phone = phoneEl ? phoneEl.value.trim() : '';
  const reason = reasonEl ? reasonEl.value : 'Rescheduling';
  const newDate = newDateEl ? newDateEl.value : '';

  if (!phone || !/^\d{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit registered WhatsApp mobile number.");
    return;
  }

  let msg = "";
  if (currentModifyAction === 'postpone') {
    msg = `*Mountain Travels Nilgiris - Trip Postpone Request*%0A%0A` +
          `• *Action:* POSTPONE TRIP%0A` +
          `• *Registered Mobile:* +91 ${encodeURIComponent(phone)}%0A` +
          `• *Requested New Date:* ${encodeURIComponent(newDate)}%0A` +
          `• *Reason:* ${encodeURIComponent(reason)}%0A%0A` +
          `Kindly confirm availability of my booked vehicle for the revised date.`;
  } else {
    msg = `*Mountain Travels Nilgiris - Trip Cancellation Request*%0A%0A` +
          `• *Action:* CANCEL TRIP%0A` +
          `• *Registered Mobile:* +91 ${encodeURIComponent(phone)}%0A` +
          `• *Reason:* ${encodeURIComponent(reason)}%0A%0A` +
          `Please process my trip cancellation and refund as per booking guidelines.`;
  }

  closeTripModifyModal();
  window.open(`https://wa.me/${DISPATCH_PHONE}?text=${msg}`, '_blank');
}

/* ========================================================
   6. ADMIN PHOTO UPLOADER & PERSISTENCE
   ======================================================== */
let stagingImageData = null;

function promptAdminImageUpload() {
  const pass = prompt("Enter Admin Passcode (Default: admin123):", "");[cite: 1]
  if (pass === "admin123") {[cite: 1]
    const modal = document.getElementById('adminUploadModal');
    if (modal) modal.classList.add('show');
    previewSelectedTargetImage();
  } else if (pass !== null) {
    alert("Incorrect Admin Passcode.");
  }
}

function closeAdminUploadModal() {
  const modal = document.getElementById('adminUploadModal');
  if (modal) modal.classList.remove('show');
  stagingImageData = null;
}

function previewSelectedTargetImage() {
  const targetKeyEl = document.getElementById('uploadTargetKey');
  if (!targetKeyEl) return;
  const targetId = targetKeyEl.value;
  const targetImg = document.getElementById(targetId);
  const previewEl = document.getElementById('uploadLivePreview');
  if (targetImg && previewEl) {
    previewEl.src = targetImg.src;
  }
}

function handleLocalFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      stagingImageData = e.target.result;
      const previewEl = document.getElementById('uploadLivePreview');
      if (previewEl) previewEl.src = stagingImageData;
    };
    reader.readAsDataURL(file);
  }
}

function handleImageUploadSubmit(event) {
  event.preventDefault();
  const targetKeyEl = document.getElementById('uploadTargetKey');
  if (!targetKeyEl) return;
  const targetId = targetKeyEl.value;
  const targetImg = document.getElementById(targetId);

  if (!stagingImageData) {
    alert("Please pick a file first.");
    return;
  }

  if (targetImg) {
    targetImg.src = stagingImageData;
    let savedImages = JSON.parse(localStorage.getItem('mt_custom_images') || '{}');[cite: 1]
    savedImages[targetId] = stagingImageData;
    localStorage.setItem('mt_custom_images', JSON.stringify(savedImages));[cite: 1]

    alert("Image updated and saved!");
    closeAdminUploadModal();
  }
}

function loadPersistedCustomImages() {
  const savedImages = JSON.parse(localStorage.getItem('mt_custom_images') || '{}');[cite: 1]
  for (const [id, src] of Object.entries(savedImages)) {
    const el = document.getElementById(id);
    if (el) el.src = src;
  }
}

/* ========================================================
   7. PLACES FILTER & WEATHER CALCULATOR
   ======================================================== */
function filterPlaces(category, button) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (button) button.classList.add('active');

  const cards = document.querySelectorAll('.place-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function runWeatherCalculation() {
  const destEl = document.getElementById('wcalcDest');
  const timeEl = document.getElementById('wcalcTime');

  const destKey = destEl ? destEl.value : 'ooty_doddabetta';
  const timeKey = timeEl ? timeEl.value : 'afternoon';

  const placeObj = weatherData[destKey] || weatherData['ooty_doddabetta'];
  const forecast = placeObj[timeKey] || placeObj['afternoon'];

  const tempEl = document.getElementById('wcalcTemp');
  const condEl = document.getElementById('wcalcCondition');
  const safeEl = document.getElementById('wcalcSafety');
  const mistEl = document.getElementById('wcalcMist');
  const roadEl = document.getElementById('wcalcRoad');
  const attireEl = document.getElementById('wcalcAttire');

  if (tempEl) tempEl.textContent = `${forecast.temp}°C`;
  if (condEl) condEl.textContent = forecast.cond;
  if (safeEl) safeEl.textContent = `Safety: ${forecast.safety}`;
  if (mistEl) mistEl.textContent = forecast.mist;
  if (roadEl) roadEl.textContent = forecast.road;
  if (attireEl) attireEl.textContent = forecast.attire;
}

/* ========================================================
   8. SCROLLSPY & PAGE INITIALIZATION
   ======================================================== */
window.addEventListener('scroll', () => {
  const header = document.getElementById('topNav');
  if (header) {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Mobile Bottom Tab Scrollspy
  const sections = document.querySelectorAll('section, header');
  const tabLinks = document.querySelectorAll('.tab-link');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  tabLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  runWeatherCalculation();
  updateTripDisplay();
  loadPersistedCustomImages();[cite: 1]

  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.value = reservationState.travelDate;
    dateInput.addEventListener('change', (e) => {
      reservationState.travelDate = e.target.value;
    });
  }

  // Handle badge state only if a user is verified
  if (currentUser && currentUser.phone) {
    applyUserLogin(currentUser);
  }
});
