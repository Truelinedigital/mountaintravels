/**
 * MOUNTAIN TRAVELS - Interactive Logic & Booking Engine with Firebase Phone OTP
 */

// ================= 1. FIREBASE CONFIGURATION =================
// Replace these values with your configuration from Firebase Console:
// Project Settings > General > Your Apps > Web App (</>)
const firebaseConfig = {
  apiKey: "AIzaSyCAuq3dYZnYLlnYd8j-FjyA0AP_EhZ7Ld8",
  authDomain: "mountaintravels-74489.firebaseapp.com",
  projectId: "mountaintravels-74489",
  storageBucket: "mountaintravels-74489.firebasestorage.app",
  messagingSenderId: "524468956734",
  appId: "1:524468956734:web:9e089d3cc950aa85cdab6f",
  measurementId: "G-RY421HFCNG"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Application State
const appState = {
  isVerified: false,
  verifiedUser: null,
  selectedVehicleFull: 'Toyota Innova HyCross Luxury',
  selectedVehicleShort: 'Innova',
  confirmationResult: null
};

// ================= 2. INITIALIZATION & LIFECYCLE =================
document.addEventListener('DOMContentLoaded', () => {
  // Autoplay hero background video fallback
  const bgVideo = document.querySelector('.hero-bg-video');
  if (bgVideo) {
    bgVideo.muted = true;
    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log("Autoplay waiting for first user click.");
      });
    }
  }

  // Populate date pickers with tomorrow as default
  const dateInput = document.getElementById('resDate');
  const modDateInput = document.getElementById('modNewDate');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateInput) {
    dateInput.min = todayStr;
    dateInput.value = tomorrowStr;
  }
  if (modDateInput) {
    modDateInput.min = todayStr;
  }

  // Scroll header styling
  window.addEventListener('scroll', () => {
    const topNav = document.getElementById('topNav');
    if (topNav) {
      if (window.scrollY > 40) {
        topNav.classList.add('scrolled');
      } else {
        topNav.classList.remove('scrolled');
      }
    }
  });

  updateSummaryRoute();
  runWeatherCalculation();
  initRecaptcha();
});

// ================= 3. FIREBASE RECAPTCHA VERIFIER =================
function initRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved automatically
      },
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });
  }
}

// ================= 4. VEHICLE SELECTION ENGINE =================
function pickVehicle(cardId, fullTitle, shortTitle) {
  const cards = document.querySelectorAll('.vehicle-choice-card');
  cards.forEach(card => card.classList.remove('active'));

  const target = document.getElementById(cardId);
  if (target) {
    target.classList.add('active');
  }

  appState.selectedVehicleFull = fullTitle;
  appState.selectedVehicleShort = shortTitle;

  const hiddenInput = document.getElementById('selectedVehicleInput');
  if (hiddenInput) {
    hiddenInput.value = fullTitle;
  }

  const vehicleDisplay = document.getElementById('resVehicleDisplay');
  if (vehicleDisplay) {
    vehicleDisplay.textContent = fullTitle;
  }

  updateSummaryRoute();

  const reserveSection = document.getElementById('reserve');
  if (reserveSection && window.location.hash !== '#reserve') {
    reserveSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function updateSummaryRoute() {
  const circuitSelect = document.getElementById('resCircuit');
  const routeDisplay = document.getElementById('resRouteDisplay');

  if (circuitSelect && routeDisplay) {
    const circuitVal = circuitSelect.value;
    const circuitShort = circuitVal.split(' ')[0] + ' ' + (circuitVal.split(' ')[1] || '');
    routeDisplay.textContent = circuitShort + ' • ' + appState.selectedVehicleShort;
  }
}

// ================= 5. PLACES FILTER & DESTINATION SELECTION =================
function filterPlaces(category, buttonEl) {
  const tabButtons = document.querySelectorAll('.places-tabs .tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');

  const placeCards = document.querySelectorAll('#placesContainer .place-card');
  placeCards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function selectDestinationAndBook(circuitName, queryMap) {
  window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(queryMap), '_blank');

  const circuitSelect = document.getElementById('resCircuit');
  if (circuitSelect) {
    for (let i = 0; i < circuitSelect.options.length; i++) {
      if (circuitSelect.options[i].value === circuitName) {
        circuitSelect.selectedIndex = i;
        break;
      }
    }
  }

  updateSummaryRoute();

  const reserveSection = document.getElementById('reserve');
  if (reserveSection) {
    reserveSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ================= 6. WEATHER FORECAST MODULE =================
function runWeatherCalculation() {
  const destination = document.getElementById('wcalcDest').value;
  const time = document.getElementById('wcalcTime').value;

  const tempDisplay = document.getElementById('wcalcTemp');
  const condDisplay = document.getElementById('wcalcCondition');
  const safeDisplay = document.getElementById('wcalcSafety');
  const mistDisplay = document.getElementById('wcalcMist');
  const roadDisplay = document.getElementById('wcalcRoad');
  const attireDisplay = document.getElementById('wcalcAttire');

  const table = {
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

  const data = table[destination][time];
  tempDisplay.textContent = data.temp;
  condDisplay.textContent = data.cond;
  safeDisplay.textContent = 'Safety: ' + data.safe;
  mistDisplay.textContent = data.mist;
  roadDisplay.textContent = data.road;
  attireDisplay.textContent = data.attire;
}

// ================= 7. MODALS & FIREBASE PHONE AUTH =================
function openAuthModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('show');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('show');
}

/**
 * Triggers real SMS OTP through Firebase
 */
function sendRealPhoneOtp() {
  const phoneInput = document.getElementById('modalPhoneInput').value.trim();
  const nameInput = document.getElementById('modalNameInput').value.trim();

  if (phoneInput.length !== 10 || isNaN(phoneInput)) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }

  // Format to E.164 (+91 for India)
  const fullPhoneNumber = '+91' + phoneInput;

  initRecaptcha();
  const appVerifier = window.recaptchaVerifier;
  const sendBtn = document.getElementById('sendOtpBtn');

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending SMS...';
  }

  auth.signInWithPhoneNumber(fullPhoneNumber, appVerifier)
    .then((confirmationResult) => {
      appState.confirmationResult = confirmationResult;

      // Sync entered info to the reservation form
      const resPhone = document.getElementById('resPhone');
      const resName = document.getElementById('resName');
      if (resPhone) resPhone.value = phoneInput;
      if (resName && nameInput) resName.value = nameInput;

      // Switch view to OTP step
      document.getElementById('displayOtpTargetPhone').textContent = phoneInput;
      document.getElementById('authStepPhone').style.display = 'none';
      document.getElementById('authStepOtp').style.display = 'block';

      setTimeout(() => {
        const firstDigit = document.getElementById('otp1');
        if (firstDigit) firstDigit.focus();
      }, 100);
    })
    .catch((error) => {
      console.error("SMS dispatch error:", error);
      alert('Error sending SMS: ' + error.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          if (window.grecaptcha) grecaptcha.reset(widgetId);
        });
      }
    })
    .finally(() => {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send OTP Code';
      }
    });
}

function focusNextDigit(current, nextId) {
  if (current.value.length >= 1 && nextId) {
    document.getElementById(nextId).focus();
  }
}

/**
 * Validates the entered 6-digit code against Firebase
 */
function verifyRealPhoneOtp() {
  let code = '';
  for (let i = 1; i <= 6; i++) {
    const digitInput = document.getElementById('otp' + i);
    if (digitInput) code += digitInput.value.trim();
  }

  if (code.length !== 6) {
    alert('Please enter the full 6-digit verification code sent to your phone.');
    return;
  }

  if (!appState.confirmationResult) {
    alert('OTP session expired. Please request a new code.');
    resetOtpStep();
    return;
  }

  const verifyBtn = document.getElementById('verifyOtpBtn');
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
  }

  appState.confirmationResult.confirm(code)
    .then((result) => {
      const user = result.user;
      console.log("Firebase user verified successfully:", user);

      appState.isVerified = true;
      appState.verifiedUser = document.getElementById('modalPhoneInput').value.trim();

      // Update Navigation Header Badge
      const navBadge = document.getElementById('navAuthBadge');
      if (navBadge) {
        navBadge.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> <span>+91 ' + appState.verifiedUser + '</span>';
      }

      // Update Alert Banner inside Reservation form
      const alertBanner = document.getElementById('authAlertBanner');
      if (alertBanner) {
        alertBanner.style.background = '#f0fdf4';
        alertBanner.style.borderColor = '#bbf7d0';
        alertBanner.style.color = '#15803d';
        document.getElementById('authAlertText').innerHTML = '<strong>Verified:</strong> +91 ' + appState.verifiedUser + ' (20% Discount Activated)';
        const alertBtn = document.getElementById('authAlertBtn');
        if (alertBtn) alertBtn.style.display = 'none';
      }

      // Update summary dispatch status
      const ticketStatus = document.getElementById('ticketAuthStatus');
      if (ticketStatus) {
        ticketStatus.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> Verified (+91 ' + appState.verifiedUser + ')';
      }

      closeAuthModal();
      alert('Verification successful! 20% discount confirmed on your ride.');
    })
    .catch((error) => {
      console.error("Verification failed:", error);
      alert('Invalid or expired verification code. Please check and try again.');
    })
    .finally(() => {
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Verify & Activate Account';
      }
    });
}

function resetOtpStep() {
  document.getElementById('authStepOtp').style.display = 'none';
  document.getElementById('authStepPhone').style.display = 'block';
  for (let i = 1; i <= 6; i++) {
    const d = document.getElementById('otp' + i);
    if (d) d.value = '';
  }
}

// ================= 8. WHATSAPP BOOKING SUBMISSION =================
function submitBookingToWhatsApp() {
  const name = document.getElementById('resName').value.trim();
  const phone = document.getElementById('resPhone').value.trim();
  const circuit = document.getElementById('resCircuit').value;
  const pickup = document.getElementById('resPickup').value;
  const date = document.getElementById('resDate').value;
  const passengers = document.getElementById('resPassengers').value;
  const vehicle = appState.selectedVehicleFull;

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
    alert('Please choose your travel date.');
    document.getElementById('resDate').focus();
    return;
  }

  const authNote = appState.isVerified ? "Verified via OTP (20% Discount Applied)" : "Unverified (Standard Rate)";

  const textMessage = 
    '*NEW LUXURY NILGIRIS RESERVATION*\n' +
    '---------------------------------------\n' +
    '• *Guest Name:* ' + name + '\n' +
    '• *Contact Phone:* +91 ' + phone + '\n' +
    '• *Status:* ' + authNote + '\n' +
    '• *Selected Vehicle:* ' + vehicle + '\n' +
    '• *Circuit:* ' + circuit + '\n' +
    '• *Pickup Hub:* ' + pickup + '\n' +
    '• *Date of Travel:* ' + date + '\n' +
    '• *Passengers:* ' + passengers + '\n' +
    '---------------------------------------\n' +
    'Please confirm availability and dispatch chauffeur details.';

  window.open('https://wa.me/919360543120?text=' + encodeURIComponent(textMessage), '_blank');
}

// ================= 9. TRIP MODIFICATION MODAL =================
let currentTripAction = 'postpone';

function openTripModifyModal(type) {
  currentTripAction = type;
  const modal = document.getElementById('tripModifyModal');
  const heading = document.getElementById('tripModifyHeading');
  const icon = document.getElementById('tripModifyIcon');
  const dateField = document.getElementById('groupNewDate');

  if (type === 'cancel') {
    heading.textContent = 'Cancel Existing Trip';
    icon.className = 'fa-solid fa-calendar-xmark';
    icon.style.color = '#ef4444';
    dateField.style.display = 'none';
  } else {
    heading.textContent = 'Postpone Trip';
    icon.className = 'fa-solid fa-calendar-plus';
    icon.style.color = 'var(--sunlight-yellow)';
    dateField.style.display = 'flex';
  }

  if (modal) modal.classList.add('show');
}

function closeTripModifyModal() {
  const modal = document.getElementById('tripModifyModal');
  if (modal) modal.classList.remove('show');
}

function submitTripModification() {
  const phone = document.getElementById('modPhone').value.trim();
  const reason = document.getElementById('modReason').value;
  const newDate = document.getElementById('modNewDate').value;

  if (phone.length < 10) {
    alert('Please enter your 10-digit registered number.');
    return;
  }

  let msg = '';
  if (currentTripAction === 'postpone') {
    if (!newDate) {
      alert('Please select your new requested travel date.');
      return;
    }
    msg = '*TRIP POSTPONE REQUEST*\nMobile: +91 ' + phone + '\nNew Travel Date: ' + newDate + '\nReason: ' + reason;
  } else {
    msg = '*TRIP CANCELLATION REQUEST*\nMobile: +91 ' + phone + '\nReason: ' + reason;
  }

  window.open('https://wa.me/919360543120?text=' + encodeURIComponent(msg), '_blank');
  closeTripModifyModal();
}

// Close modals when clicking the dim background
window.onclick = function (e) {
  if (e.target && e.target.classList.contains('sheet-backdrop')) {
    e.target.classList.remove('show');
  }
};
