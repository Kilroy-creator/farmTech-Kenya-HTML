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

// ==== Real-time Weather + 7-Day Forecast + Crop-Specific Advice ====

// Replace with your OpenWeatherMap API key
const apiKey = "5982fb75a6e87eeebbd24dcde553bd24"; 

// Try to get GPS location
function fetchWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Fetch weather & forecast
        getWeather(lat, lon);
        getForecast(lat, lon);
      },
      error => {
        console.error("Location access denied:", error);
        // Fallback to Nairobi
        getWeather(-1.2921, 36.8219);
        getForecast(-1.2921, 36.8219);
      }
    );
  } else {
    alert("Geolocation is not supported.");
    getWeather(-1.2921, 36.8219);
    getForecast(-1.2921, 36.8219);
  }
}

// ==== Fetch Current Weather ====
async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    const weatherDiv = document.getElementById("weatherInfo");

    const temp = data.main.temp;
    const desc = data.weather[0].description;
    const humidity = data.main.humidity;
    const city = data.name;

    // Farming advice (general)
    let generalAdvice = "";
    if (desc.includes("rain")) {
      generalAdvice = "🌱 Good time for planting, expect rain.";
    } else if (temp > 30) {
      generalAdvice = "☀️ Too hot, irrigation recommended.";
    } else if (humidity < 30) {
      generalAdvice = "💧 Dry air, crops may need extra care.";
    } else {
      generalAdvice = "👍 Conditions are stable for farming.";
    }

    // Crop-specific advice
    let cropAdvice = getCropAdvice(temp, desc);

    weatherDiv.innerHTML = `
      <h4>📍 ${city}</h4>
      <p>🌡 Temp: ${temp}°C</p>
      <p>🌤 Condition: ${desc}</p>
      <p>💧 Humidity: ${humidity}%</p>
      <div class="advice">${generalAdvice}</div>
      <div class="crop-advice">${cropAdvice}</div>
    `;
  } catch (error) {
    console.error("Weather fetch failed:", error);
  }
}

// ==== Fetch 7-day Forecast ====
async function getForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = ""; // Clear old data

    data.daily.slice(0, 7).forEach((day, index) => {
      const date = new Date(day.dt * 1000);
      const options = { weekday: "short", month: "short", day: "numeric" };
      const dayName = date.toLocaleDateString("en-US", options);

      const temp = day.temp.day;
      const desc = day.weather[0].description;

      // General & crop-specific advice
      let advice = "";
      if (desc.includes("rain")) {
        advice = "🌧 Expect rainfall → Good for planting.";
      } else if (temp > 30) {
        advice = "☀️ Hot day → Irrigation needed.";
      } else if (temp < 15) {
        advice = "❄️ Cold → Protect seedlings.";
      } else {
        advice = "✅ Normal farming conditions.";
      }
      // --- Planting Advice Logic ---
      advice = "⚠️ Monitor conditions.";
      if (desc.includes("rain") || desc.includes("thunderstorm")) {
        advice = "🌽 Good for planting maize or beans – rain expected.";
      } else if (desc.includes("clear") && temp > 28) {
        advice = "💧 Hot & dry – irrigation needed for crops.";
      } else if (desc.includes("cloud")) {
        advice = "🌱 Suitable for vegetables – mild cloud cover.";
      } else if (humidity > 70 && temp >= 20 && temp <= 26) {
        advice = "🥬 Good for leafy greens (spinach, sukuma wiki).";
      }

      forecastHTML += `
        <li style="margin-bottom:10px;">
          <strong>${date}</strong> → 
          🌡 ${temp}°C, 
          ☁️ ${day.weather[0].description}, 
          💧 ${humidity}% 
          <br><em>${advice}</em>
        </li>
      `;

      let cropAdvice = getCropAdvice(temp, desc);

      // Build forecast card
      forecastDiv.innerHTML += `
        <div class="forecast-day">
          <h5>${dayName}</h5>
          <p>🌡 ${temp}°C</p>
          <p>🌤 ${desc}</p>
          <small>${advice}</small>
          <div class="crop-advice">${cropAdvice}</div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Forecast fetch failed:", error);
  }
}

// ==== Crop-specific Advice ====
function getCropAdvice(temp, desc) {
  let advice = "";

  if (desc.includes("rain")) {
    advice = "🌽 Maize & beans will thrive → plant now.";
  } else if (temp > 28) {
    advice = "🥒 Vegetables may wilt → provide irrigation.";
  } else if (temp < 18) {
    advice = "🍅 Tomatoes may slow growth → consider greenhouse.";
  } else {
    advice = "🌾 Balanced weather → good for most crops.";
  }

  return advice;
}

// Run on page load
fetchWeatherByLocation();

