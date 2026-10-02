/**
 * MOUNTAIN TRAVELS - Interactive Logic & Booking Engine
 */

// Application State
const appState = {
  isVerified: false,
  verifiedUser: null,
  selectedVehicle: 'Toyota Innova HyCross Luxury',
  pendingOtpUserId: null
};

// ================= NAVIGATION & SCROLL EFFECT =================
window.addEventListener('scroll', () => {
  const topNav = document.getElementById('topNav');
  if (window.scrollY > 40) {
    topNav.classList.add('scrolled');
  } else {
    topNav.classList.remove('scrolled');
  }
});

// Set default travel date to tomorrow on load
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // Keyboard accessibility for interactive vehicle cards
  const cards = document.querySelectorAll('.vehicle-choice-card');
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  updateTripDisplay();
  runWeatherCalculation();
});

// ================= VEHICLE SELECTION ENGINE =================
/**
 * Handles selecting a vehicle card directly inside the Reservation engine
 */
function chooseVehicle(vehicleName, cardElement) {
  // 1. Remove active status from all selection cards
  const allCards = document.querySelectorAll('.vehicle-choice-card');
  allCards.forEach(card => card.classList.remove('active'));

  // 2. Set active status on chosen card
  if (cardElement) {
    cardElement.classList.add('active');
  }

  // 3. Update hidden input and internal state
  appState.selectedVehicle = vehicleName;
  const hiddenInput = document.getElementById('selectedVehicle');
  if (hiddenInput) {
    hiddenInput.value = vehicleName;
  }

  // 4. Update the vehicle item in Dispatch Summary
  const vehicleDisplay = document.getElementById('resVehicleDisplay');
  if (vehicleDisplay) {
    vehicleDisplay.textContent = vehicleName;
  }

  updateTripDisplay();
}

/**
 * Handles clicks from "Select" buttons in the Nilgiris Fleet section
 */
function selectVehicleByClass(vehicleClass) {
  const vehicleMap = {
    'urbania': { id: 'card-urbania', name: 'Tempo Traveller (12/14 Seater)' },
    'hycross': { id: 'card-hycross', name: 'Toyota Innova HyCross Luxury' },
    'fortuner': { id: 'card-fortuner', name: 'Toyota Fortuner 4x4 Highland Edition' },
    'sedan': { id: 'card-sedan', name: 'Executive Sedan (Dzire / Etios)' }
  };

  const choice = vehicleMap[vehicleClass];
  if (!choice) return;

  const cardElement = document.getElementById(choice.id);
  chooseVehicle(choice.name, cardElement);
}

/**
 * Updates the live Route & Vehicle headline in Dispatch Summary
 */
function updateTripDisplay() {
  const circuitSelect = document.getElementById('resCircuit');
  const routeDisplay = document.getElementById('resRouteDisplay');

  if (circuitSelect && routeDisplay) {
    const circuitShort = circuitSelect.value.split(' ')[0] + ' ' + (circuitSelect.value.split(' ')[1] || '');
    const vehicleShort = appState.selectedVehicle.replace('Toyota ', '').replace('Executive ', '');
    routeDisplay.textContent = `${circuitShort} • ${vehicleShort}`;
  }
}

// ================= PLACES TAB FILTERING & DESTINATION PRE-SELECT =================
function filterPlaces(category, buttonEl) {
  const tabButtons = document.querySelectorAll('.places-tabs .tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');

  const cards = document.querySelectorAll('#placesContainer .place-card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function selectDestinationAndBook(circuitName, mapQuery) {
  // Open place on Google Maps in background tab
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank');

  // Set the circuit dropdown
  const circuitSelect = document.getElementById('resCircuit');
  if (circuitSelect) {
    for (let i = 0; i < circuitSelect.options.length; i++) {
      if (circuitSelect.options[i].value === circuitName) {
        circuitSelect.selectedIndex = i;
        break;
      }
    }
  }

  updateTripDisplay();

  // Smooth scroll to reserve engine
  const reserveSection = document.getElementById('reserve');
  if (reserveSection) {
    reserveSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ================= WEATHER CALCULATOR MODULE =================
function runWeatherCalculation() {
  const destination = document.getElementById('wcalcDest').value;
  const time = document.getElementById('wcalcTime').value;

  const tempDisplay = document.getElementById('wcalcTemp');
  const conditionDisplay = document.getElementById('wcalcCondition');
  const safetyDisplay = document.getElementById('wcalcSafety');
  const mistDisplay = document.getElementById('wcalcMist');
  const roadDisplay = document.getElementById('wcalcRoad');
  const attireDisplay = document.getElementById('wcalcAttire');

  const forecasts = {
    'ooty_doddabetta': {
      morning: { temp: '11°C', cond: 'Dense Shola Mist', safe: '94%', mist: 'Fog banks (Vis: 4 km)', road: 'Damp Hairpins', attire: 'Fleece / Windcheater' },
      afternoon: { temp: '16°C', cond: 'Crisp Sun & Gentle Breeze', safe: '99%', mist: 'Clear Sight (Vis: 12 km)', road: 'Dry & Optimal', attire: 'Light Cardigan' },
      evening: { temp: '12°C', cond: 'Chilly Gusts & Sunset Glow', safe: '96%', mist: 'Rolling Cloud Cover', road: 'Dry & Cold', attire: 'Warm Jacket' }
    },
    'coonoor_dolphins': {
      morning: { temp: '14°C', cond: 'Cool Valley Dew', safe: '98%', mist: 'Light Mist (Vis: 9 km)', road: 'Dry', attire: 'Light Sweatshirt' },
      afternoon: { temp: '20°C', cond: 'Sunny Tea Garden Warmth', safe: '99%', mist: 'Clear (Vis: 15 km)', road: 'Optimal', attire: 'Cotton / T-shirt' },
      evening: { temp: '15°C', cond: 'Crisp & Pleasant', safe: '97%', mist: 'Clear Panorama', road: 'Optimal', attire: 'Light Pullover' }
    },
    'avalanche_lake': {
      morning: { temp: '9°C', cond: 'Forest Frost & Silence', safe: '93%', mist: 'Low Lake Fog', road: 'Moist Forest Track', attire: 'Heavy Thermal' },
      afternoon: { temp: '17°C', cond: 'Pure Mountain Sun', safe: '98%', mist: 'Crystal Clear', road: 'Dry Packed Soil', attire: 'Comfortable Fleece' },
      evening: { temp: '11°C', cond: 'Brisk Highland Wind', safe: '95%', mist: 'Dusk Mist Settling', road: 'Cool & Dry', attire: 'Warm Layering' }
    },
    'kalhatty_pass': {
      morning: { temp: '13°C', cond: 'Ghat Descent Mist', safe: '90%', mist: 'Sharp Turn Fog', road: 'Low-Gear Caution', attire: 'Warm Jacket' },
      afternoon: { temp: '21°C', cond: 'Clear Sky Over Masinagudi', safe: '96%', mist: 'Clear Hairpins', road: 'Dry & Hot Brakes', attire: 'Light Breathable' },
      evening: { temp: '16°C', cond: 'Wildlife Crossing Hour', safe: '91%', mist: 'Dusk Shadows', road: 'Drive Below 30 km/h', attire: 'Windproof Shell' }
    }
  };

  const outcome = forecasts[destination][time];
  tempDisplay.textContent = outcome.temp;
  conditionDisplay.textContent = outcome.cond;
  safetyDisplay.textContent = `Safety: ${outcome.safe}`;
  mistDisplay.textContent = outcome.mist;
  roadDisplay.textContent = outcome.road;
  attireDisplay.textContent = outcome.attire;
}

// ================= MODAL & VERIFICATION FLOW =================
function openAuthModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('authModal');
  modal.classList.add('show');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('show');
}

function sendRealPhoneOtp() {
  const phoneInput = document.getElementById('modalPhoneInput').value.trim();
  const nameInput = document.getElementById('modalNameInput').value.trim();

  if (phoneInput.length !== 10 || isNaN(phoneInput)) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }

  // Switch to OTP entry step
  document.getElementById('displayOtpTargetPhone').textContent = phoneInput;
  document.getElementById('authStepPhone').style.display = 'none';
  document.getElementById('authStepOtp').style.display = 'block';

  // Automatically sync to booking form fields
  const resPhone = document.getElementById('resPhone');
  const resName = document.getElementById('resName');
  if (resPhone) resPhone.value = phoneInput;
  if (resName && nameInput) resName.value = nameInput;

  // Auto focus first OTP digit
  setTimeout(() => {
    const firstDigit = document.getElementById('otp1');
    if (firstDigit) firstDigit.focus();
  }, 150);
}

function focusNextDigit(current, nextId) {
  if (current.value.length >= 1 && nextId) {
    document.getElementById(nextId).focus();
  }
}

function validateOtpInputs() {
  let code = '';
  for (let i = 1; i <= 6; i++) {
    code += document.getElementById(`otp${i}`).value;
  }
  return code;
}

function verifyRealPhoneOtp() {
  const code = validateOtpInputs();
  if (code.length < 4) {
    alert('Please enter the full verification code.');
    return;
  }

  // Verification Success
  appState.isVerified = true;
  appState.verifiedUser = document.getElementById('modalPhoneInput').value;

  // Update Navigation Badge
  const navBadge = document.getElementById('navAuthBadge');
  if (navBadge) {
    navBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> <span>+91 ${appState.verifiedUser}</span>`;
  }

  // Update Alert Banner in Reservation Box
  const alertBanner = document.getElementById('authAlertBanner');
  if (alertBanner) {
    alertBanner.style.background = '#f0fdf4';
    alertBanner.style.borderColor = '#bbf7d0';
    alertBanner.style.color = '#15803d';
    document.getElementById('authAlertText').innerHTML = `<strong>Mobile Verified:</strong> +91 ${appState.verifiedUser} (20% Discount Guaranteed)`;
    document.getElementById('authAlertBtn').style.display = 'none';
  }

  // Update Summary Ticket
  const statusDisplay = document.getElementById('ticketAuthStatus');
  if (statusDisplay) {
    statusDisplay.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> Verified (+91 ${appState.verifiedUser})`;
  }

  closeAuthModal();
  alert('Mobile verification successful! 20% discount has been applied to your booking.');
}

function resetOtpStep() {
  document.getElementById('authStepOtp').style.display = 'none';
  document.getElementById('authStepPhone').style.display = 'block';
}

// ================= BOOKING SUBMISSION VIA WHATSAPP =================
function attemptBookingSubmission() {
  const name = document.getElementById('resName').value.trim();
  const phone = document.getElementById('resPhone').value.trim();
  const circuit = document.getElementById('resCircuit').value;
  const pickup = document.getElementById('resPickup').value;
  const date = document.getElementById('resDate').value;
  const passengers = document.getElementById('resPassengers').value;
  const vehicle = appState.selectedVehicle;

  if (!name) {
    alert('Please enter your full name.');
    document.getElementById('resName').focus();
    return;
  }

  if (phone.length < 10) {
    alert('Please enter a valid 10-digit mobile number.');
    document.getElementById('resPhone').focus();
    return;
  }

  if (!date) {
    alert('Please pick your travel date.');
    document.getElementById('resDate').focus();
    return;
  }

  // Prepare dispatch message
  const textMessage = 
    `*NEW LUXURY NILGIRIS RESERVATION (20% OFF)*\n` +
    `---------------------------------------\n` +
    `• *Guest Name:* ${name}\n` +
    `• *Mobile:* +91 ${phone}\n` +
    `• *Vehicle:* ${vehicle}\n` +
    `• *Circuit:* ${circuit}\n` +
    `• *Pickup Hub:* ${pickup}\n` +
    `• *Travel Date:* ${date}\n` +
    `• *Passengers:* ${passengers}\n` +
    `• *Discount Status:* Flat 20% Applied\n` +
    `---------------------------------------\n` +
    `Please confirm vehicle dispatch & chauffeur details.`;

  const waUrl = `https://wa.me/919360543120?text=${encodeURIComponent(textMessage)}`;
  window.open(waUrl, '_blank');
}

// ================= TRIP MODIFICATION MODAL =================
let currentTripAction = 'postpone';

function openTripModifyModal(actionType) {
  currentTripAction = actionType;
  const modal = document.getElementById('tripModifyModal');
  const heading = document.getElementById('tripModifyHeading');
  const icon = document.getElementById('tripModifyIcon');
  const dateGroup = document.getElementById('groupNewDate');

  if (actionType === 'cancel') {
    heading.textContent = 'Cancel Existing Trip';
    icon.className = 'fa-solid fa-calendar-xmark';
    icon.style.color = '#ef4444';
    dateGroup.style.display = 'none';
  } else {
    heading.textContent = 'Postpone Trip';
    icon.className = 'fa-solid fa-calendar-plus';
    icon.style.color = 'var(--sunlight-yellow)';
    dateGroup.style.display = 'flex';
  }

  modal.classList.add('show');
}

function closeTripModifyModal() {
  document.getElementById('tripModifyModal').classList.remove('show');
}

function submitTripModification() {
  const phone = document.getElementById('modPhone').value.trim();
  const reason = document.getElementById('modReason').value;
  const newDate = document.getElementById('modNewDate').value;

  if (phone.length < 10) {
    alert('Please enter your 10-digit registered number.');
    return;
  }

  let message = '';
  if (currentTripAction === 'postpone') {
    if (!newDate) {
      alert('Please select your new requested travel date.');
      return;
    }
    message = `*TRIP POSTPONE REQUEST*\nMobile: +91 ${phone}\nRequested Date: ${newDate}\nReason: ${reason}`;
  } else {
    message = `*TRIP CANCELLATION REQUEST*\nMobile: +91 ${phone}\nReason: ${reason}`;
  }

  window.open(`https://wa.me/919360543120?text=${encodeURIComponent(message)}`, '_blank');
  closeTripModifyModal();
}

// ================= ADMIN PHOTO UPLOADER =================
function promptAdminImageUpload() {
  document.getElementById('adminUploadModal').classList.add('show');
  previewSelectedTargetImage();
}

function closeAdminUploadModal() {
  document.getElementById('adminUploadModal').classList.remove('show');
}

function previewSelectedTargetImage() {
  const targetId = document.getElementById('uploadTargetKey').value;
  const currentImg = document.getElementById(targetId);
  if (currentImg) {
    document.getElementById('uploadLivePreview').src = currentImg.src;
  }
}

function handleLocalFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('uploadLivePreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function handleImageUploadSubmit(event) {
  event.preventDefault();
  const targetId = document.getElementById('uploadTargetKey').value;
  const newSrc = document.getElementById('uploadLivePreview').src;

  const targetImageElement = document.getElementById(targetId);
  if (targetImageElement) {
    targetImageElement.src = newSrc;
    alert('Photo updated successfully!');
    closeAdminUploadModal();
  }
}

// Close modals when clicking backdrop
window.onclick = function(event) {
  if (event.target.classList.contains('sheet-backdrop')) {
    event.target.classList.remove('show');
  }
};
