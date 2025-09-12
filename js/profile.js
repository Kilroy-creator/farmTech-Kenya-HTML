const PROFILE_KEY = "farmtech_profile";
let profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

const form = document.getElementById("profileForm");
const nameInput = document.getElementById("farmerName");
const emailInput = document.getElementById("farmerEmail");
const locInput = document.getElementById("farmerLocation");
const langSelect = document.getElementById("language");
const notifCheck = document.getElementById("notifications");

// Load existing profile
if (profile.name) {
  nameInput.value = profile.name;
  emailInput.value = profile.email;
  locInput.value = profile.location;
  langSelect.value = profile.language;
  notifCheck.checked = profile.notifications;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  profile = {
    name: nameInput.value,
    email: emailInput.value,
    location: locInput.value,
    language: langSelect.value,
    notifications: notifCheck.checked
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  alert("✅ Profile updated successfully!");
});

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
