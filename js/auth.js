// AUTHENTICATION SYSTEM

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const farmer = {
        name: document.getElementById("farmerName").value,
        contact: document.getElementById("farmerContact").value,
        loggedIn: true
      };

      // Save login details
      localStorage.setItem("loggedInFarmer", JSON.stringify(farmer));

      alert(`✅ Welcome ${farmer.name}!`);
      window.location.href = "index.html"; // redirect to dashboard
    });
  }

  // Protect all pages except login
  if (!window.location.href.includes("login.html")) {
    const farmer = JSON.parse(localStorage.getItem("loggedInFarmer"));
    if (!farmer || !farmer.loggedIn) {
      window.location.href = "login.html"; // force login
    } else {
      // Personalize UI (show farmer name in navbar if exists)
      const navBar = document.querySelector("header nav");
      if (navBar) {
        const userSpan = document.createElement("span");
        userSpan.textContent = `👨‍🌾 ${farmer.name}`;
        userSpan.style.marginLeft = "20px";
        userSpan.style.fontWeight = "bold";
        navBar.appendChild(userSpan);
      }
    }
  }
});

// Logout function
function logoutFarmer() {
  localStorage.removeItem("loggedInFarmer");
  alert("👋 Logged out successfully!");
  window.location.href = "login.html";
}
