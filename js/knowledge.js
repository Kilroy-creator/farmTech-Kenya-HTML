// -------- Tabs --------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// -------- Research (static for now, can fetch API later) --------
const articles = [
  { title: "Climate-Smart Agriculture", source: "FAO", link: "#" },
  { title: "New Pest Control Innovations", source: "ILRI", link: "#" },
  { title: "Water-Saving Irrigation Systems", source: "KALRO", link: "#" }
];

const articlesDiv = document.getElementById("articles");
articles.forEach(a => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `<h4>${a.title}</h4><p><em>${a.source}</em></p><a href="${a.link}">Read More</a>`;
  articlesDiv.appendChild(card);
});

// -------- Weather (OpenWeatherMap API) --------
const API_KEY = "Y80311cfb7c571b51310409abed8d79a5"; // <- replace with your real API key

weatherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    const temp = data.main.temp;
    const condition = data.weather[0].description.toLowerCase();
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    const advice = getFarmingAdvice(temp, condition, humidity);

    weatherInfo.innerHTML = `
      <h4>${data.name} Weather</h4>
      <p>🌡️ Temp: ${temp}°C</p>
      <p>☀️ Condition: ${condition}</p>
      <p>💧 Humidity: ${humidity}%</p>
      <p>🌬️ Wind: ${wind} km/h</p>
      <div class="advice">📌 Advice: ${advice}</div>
    `;
  } catch (error) {
    weatherInfo.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
});


// -------- Community Forum (with Categories) --------
const FORUM_KEY = "farmtech_forum";
let posts = JSON.parse(localStorage.getItem(FORUM_KEY)) || [];

function savePosts() {
  localStorage.setItem(FORUM_KEY, JSON.stringify(posts));
}

function renderPosts(filter = "All") {
  const forumDiv = document.getElementById("forumPosts");
  forumDiv.innerHTML = "";

  posts
    .filter(p => filter === "All" || p.category === filter)
    .forEach((p, i) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h4>${p.title}</h4>
        <p>${p.body}</p>
        <small><strong>${p.category}</strong> | Posted on ${p.date}</small>
        <div class="replies">
          ${p.replies.map(r => `<p>💬 ${r}</p>`).join("")}
        </div>
        <input type="text" placeholder="Reply..." id="reply-${i}">
        <button onclick="addReply(${i})">Reply</button>
      `;
      forumDiv.appendChild(card);
    });
}

document.getElementById("forumForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newPost = {
    category: document.getElementById("category").value,
    title: document.getElementById("questionTitle").value,
    body: document.getElementById("questionBody").value,
    date: new Date().toLocaleString(),
    replies: []
  };
  posts.push(newPost);
  savePosts();
  renderPosts();
  e.target.reset();
});

window.addReply = function(index) {
  const replyInput = document.getElementById(`reply-${index}`);
  if (replyInput.value.trim() !== "") {
    posts[index].replies.push(replyInput.value);
    savePosts();
    renderPosts(document.getElementById("filterCategory").value);
  }
};

// Filter posts by category
document.getElementById("filterCategory").addEventListener("change", (e) => {
  renderPosts(e.target.value);
});

// Initial render
renderPosts();

// -------- Weather Smart Advice --------
function getFarmingAdvice(temp, condition, humidity) {
  let advice = "";

  if (condition.includes("rain") || humidity > 70) {
    advice = "🌧️ Good chance of rain – Suitable for planting maize, beans, and vegetables.";
  } else if (temp > 30 && humidity < 50) {
    advice = "☀️ Hot & dry – Consider irrigation and drought-resistant crops like sorghum or millet.";
  } else if (temp >= 20 && temp <= 28) {
    advice = "🌱 Ideal growing conditions – Great for most crops.";
  } else if (condition.includes("cloud")) {
    advice = "☁️ Cloudy – Monitor fields, moderate growth expected.";
  } else {
    advice = "🌾 Standard conditions – Continue regular farming activities.";
  }

  return advice;
}
