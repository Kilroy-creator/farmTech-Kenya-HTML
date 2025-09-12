// Personalize Welcome Message
document.addEventListener("DOMContentLoaded", () => {
  const farmer = JSON.parse(localStorage.getItem("loggedInFarmer"));
  if (farmer) {
    document.getElementById("welcomeMessage").textContent =
      `👋 Welcome back, ${farmer.name}!`;
  }

  // Simple Chat System (localStorage)
  const chatForm = document.getElementById("chatForm");
  const chatBox = document.getElementById("chatBox");

  // Load saved messages
  let messages = JSON.parse(localStorage.getItem("farmerChat")) || [];
  renderMessages();

  chatForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const msg = { name: farmer.name, text: input.value };
    messages.push(msg);
    localStorage.setItem("farmerChat", JSON.stringify(messages));
    input.value = "";
    renderMessages();
  });

  function renderMessages() {
    chatBox.innerHTML = "";
    messages.forEach(m => {
      const p = document.createElement("p");
      p.innerHTML = `<em>${m.name}:</em> ${m.text}`;
      chatBox.appendChild(p);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
