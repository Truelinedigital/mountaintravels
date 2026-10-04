/**
 * MOUNTAIN TRAVELS - saves website activity to Firestore so the admin page can see it.
 * Add <script src="firebase-sync.js"></script> in index.html AFTER the last script tag.
 * Needs no change to script.js. WhatsApp behaviour stays exactly the same.
 */
(function () {
  'use strict';
  if (!window.firebase || !firebase.apps.length || !firebase.firestore) return;

  var db = firebase.firestore();
  var stamp = firebase.firestore.FieldValue.serverTimestamp;
  var lastKey = '', lastAt = 0;

  function v(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function save(col, obj) {
    var key = col + JSON.stringify(obj);
    if (key === lastKey && Date.now() - lastAt < 8000) return; // ignore double taps
    lastKey = key; lastAt = Date.now();
    obj.createdAt = stamp();
    db.collection(col).add(obj).catch(function (e) { console.warn('[sync] ' + col + ' not saved:', e.code || e.message); });
  }

  /* 1. Booking form -> bookings */
  var origBooking = window.submitBookingToWhatsApp;
  if (typeof origBooking === 'function') {
    window.submitBookingToWhatsApp = function () {
      var form = document.getElementById('reservationForm');
      if (form && form.checkValidity() && v('resName') && v('resPhone').length >= 10 && v('resDate')) {
        var verified = false;
        try { verified = !!appState.isVerified; } catch (e) { /* ignore */ }
        save('bookings', {
          name: v('resName'), phone: v('resPhone'), circuit: v('resCircuit'), pickup: v('resPickup'),
          date: v('resDate'), guests: v('resPassengers'), vehicle: v('selectedVehicleInput'),
          verified: verified, status: 'new'
        });
      }
      return origBooking.apply(this, arguments);
    };
  }

  /* 2. Postpone / cancel form -> tripRequests */
  var origTrip = window.submitTripModification;
  if (typeof origTrip === 'function') {
    window.submitTripModification = function () {
      var type = 'postpone';
      try { type = currentTripAction; } catch (e) { /* ignore */ }
      var newDate = v('modNewDate');
      if (v('modPhone').length >= 10 && (type === 'cancel' || newDate)) {
        save('tripRequests', {
          type: type, phone: v('modPhone'), newDate: type === 'postpone' ? newDate : '',
          reason: v('modReason'), status: 'new'
        });
      }
      return origTrip.apply(this, arguments);
    };
  }

  /* 3. OTP-verified customer -> users */
  firebase.auth().onAuthStateChanged(function (u) {
    if (!u || !u.phoneNumber) return;
    var doc = { uid: u.uid, phone: u.phoneNumber, verified: true, lastLogin: stamp() };
    var name = v('modalNameInput');
    if (name) doc.name = name;
    db.collection('users').doc(u.uid).set(doc, { merge: true })
      .catch(function (e) { console.warn('[sync] user not saved:', e.code || e.message); });
  });
})();
