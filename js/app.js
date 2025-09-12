// Global app utilities
console.log("FarmTech Kenya app loaded");

// Example: save farmer name in localStorage
function saveFarmerName(name) {
  localStorage.setItem("farmer_name", name);
}

function getFarmerName() {
  return localStorage.getItem("farmer_name") || "Guest Farmer";
}
