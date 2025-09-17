// ==========================
// Knowledge Hub JS
// ==========================

// -------- Tabs --------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// -------- Research Articles (static) --------
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

// -------- Community Forum --------
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

document.getElementById("filterCategory").addEventListener("change", (e) => {
  renderPosts(e.target.value);
});

// Initial forum render
renderPosts();

// -------- Weather & Forecast --------
const weatherForm = document.getElementById("weatherForm");
const weatherInfo = document.getElementById("weatherInfo");
const forecastDiv = document.getElementById("forecast");

const API_KEY = "5982fb75a6e87eeebbd24dcde553bd24"; // replace with your valid key

// Form-based city search
weatherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;
  if (!city) return;
  const res = await fetchWeatherByCity(city);
  if (!res) weatherInfo.innerHTML = `<p style="color:red;">City not found</p>`;
});

// Fetch by city name
async function fetchWeatherByCity(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) return null;
    const data = await res.json();
    updateWeatherDisplay(data);
    return data;
  } catch {
    return null;
  }
}

// Fetch by GPS location
function fetchWeatherByLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      getWeatherByCoords(lat, lon);
    },
    () => getWeatherByCoords(-1.2921, 36.8219) // fallback Nairobi
  );
}

// Main weather fetch by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    updateWeatherDisplay(data);
    getForecast(lat, lon);
  } catch (err) { console.error(err); }
}

// Update weather display + advice
function updateWeatherDisplay(data) {
  const temp = data.main.temp;
  const desc = data.weather[0].description;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;

  weatherInfo.innerHTML = `
    <h4>📍 ${data.name}</h4>
    <p>🌡 Temp: ${temp}°C</p>
    <p>🌤 Condition: ${desc}</p>
    <p>💧 Humidity: ${humidity}%</p>
    <p>🌬 Wind: ${wind} km/h</p>
    <div class="advice">${getGeneralAdvice(temp, desc, humidity)}</div>
    <div class="crop-advice">${getCropAdvice(temp, desc)}</div>
  `;

  // Update map
  map.setView([data.coord.lat, data.coord.lon], 6);
  L.marker([data.coord.lat, data.coord.lon]).addTo(map)
    .bindPopup(`${data.name}: ${temp}°C, ${desc}`).openPopup();
}

// General farming advice
function getGeneralAdvice(temp, desc, humidity) {
  if (desc.includes("rain")) return "🌱 Good time for planting, expect rain.";
  if (temp > 30) return "☀️ Too hot, irrigation recommended.";
  if (humidity < 30) return "💧 Dry air, crops may need extra care.";
  return "👍 Conditions are stable for farming.";
}

// Crop-specific advice
function getCropAdvice(temp, desc) {
  if (desc.includes("rain")) return "🌽 Maize & beans will thrive → plant now.";
  if (temp > 28) return "🥒 Vegetables may wilt → provide irrigation.";
  if (temp < 18) return "🍅 Tomatoes may slow growth → consider greenhouse.";
  return "🌾 Balanced weather → good for most crops.";
}

// 7-day forecast
async function getForecast(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    forecastDiv.innerHTML = "";
    data.daily.slice(0,7).forEach(day => {
      const date = new Date(day.dt * 1000);
      const options = { weekday:"short", month:"short", day:"numeric" };
      const dayName = date.toLocaleDateString("en-US", options);
      const temp = day.temp.day;
      const desc = day.weather[0].description;
      const advice = getForecastAdvice(temp, desc);
      forecastDiv.innerHTML += `
        <div class="forecast-day">
          <h5>${dayName}</h5>
          <p>🌡 ${temp}°C</p>
          <p>🌤 ${desc}</p>
          <small>${advice}</small>
        </div>
      `;
    });
  } catch(err){ console.error(err); }
}

function getForecastAdvice(temp, desc) {
  if (desc.includes("rain") || desc.includes("thunderstorm")) return "🌽 Good for maize/beans – rain expected.";
  if (desc.includes("clear") && temp > 28) return "💧 Hot & dry – irrigation needed.";
  if (desc.includes("cloud")) return "🌱 Suitable for vegetables – mild cloud cover.";
  return "⚠️ Monitor conditions.";
}

// -------- Leaflet Map --------
const map = L.map("map").setView([0, 37], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Run on load
fetchWeatherByLocation();
