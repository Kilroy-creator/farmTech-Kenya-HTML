// FARMER PROFILE LOGIC

// When page loads, try to load saved profile
document.addEventListener("DOMContentLoaded", () => {
  displayFarmerProfile();

  // Form submission
  document.getElementById("farmerForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Stop page refresh

    // Get values from form
    const farmer = {
      name: document.getElementById("farmerName").value,
      contact: document.getElementById("farmerContact").value,
      acres: document.getElementById("farmerAcres").value,
      location: document.getElementById("farmerLocation").value
    };

    // Save to LocalStorage
    localStorage.setItem("farmerProfile", JSON.stringify(farmer));

    // Update UI
    displayFarmerProfile();
    alert("✅ Farmer profile saved successfully!");
  });
});

// Function to display saved profile
function displayFarmerProfile() {
  const profileData = localStorage.getItem("farmerProfile");
  const profileDiv = document.getElementById("profileDisplay");

  if (profileData) {
    const farmer = JSON.parse(profileData);
    profileDiv.innerHTML = `
      <p><strong>Name:</strong> ${farmer.name}</p>
      <p><strong>Contact:</strong> ${farmer.contact}</p>
      <p><strong>Total Acres:</strong> ${farmer.acres}</p>
      <p><strong>Location:</strong> ${farmer.location}</p>
    `;
  } else {
    profileDiv.innerHTML = `<p>No farmer profile saved yet.</p>`;
  }
}
