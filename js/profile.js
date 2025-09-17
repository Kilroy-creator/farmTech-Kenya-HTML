const PROFILE_KEY = "farmtech_profile";
let profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

const form = document.getElementById("profileForm");
const nameInput = document.getElementById("farmerName");
const emailInput = document.getElementById("farmerEmail");
const contactInput = document.getElementById("farmerContact");
const acresInput = document.getElementById("farmerAcres");
const locInput = document.getElementById("farmerLocation");
const langSelect = document.getElementById("language");
const notifCheck = document.getElementById("notifications");
const profileDisplay = document.getElementById("profileDisplay");

// Load existing profile into form + display
document.addEventListener("DOMContentLoaded", () => {
  if (profile.name) {
    nameInput.value = profile.name || "";
    emailInput.value = profile.email || "";
    contactInput.value = profile.contact || "";
    acresInput.value = profile.acres || "";
    locInput.value = profile.location || "";
    langSelect.value = profile.language || "English";
    notifCheck.checked = profile.notifications || false;
  }
  displayProfile();
});

// Save on form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  profile = {
    name: nameInput.value,
    email: emailInput.value,
    contact: contactInput.value,
    acres: acresInput.value,
    location: locInput.value,
    language: langSelect.value,
    notifications: notifCheck.checked
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  displayProfile();
  showToast("✅ Profile updated successfully!");
});

// Function to show saved profile in display section
function displayProfile() {
  if (profile && profile.name) {
    profileDisplay.innerHTML = `
      <p><strong>Name:</strong> ${profile.name}</p>
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>Contact:</strong> ${profile.contact}</p>
      <p><strong>Total Acres:</strong> ${profile.acres}</p>
      <p><strong>Location:</strong> ${profile.location}</p>
      <p><strong>Language:</strong> ${profile.language}</p>
      <p><strong>Notifications:</strong> ${profile.notifications ? "Enabled" : "Disabled"}</p>
    `;
  } else {
    profileDisplay.innerHTML = `<p>No farmer profile saved yet.</p>`;
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Toast Notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#00796b";
  toast.style.color = "#fff";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.zIndex = "1000";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
