// ==== Real-time Weather + 5-Day Forecast + Crop-Specific Advice ====

// Replace with your OpenWeatherMap API key
const apiKey = "5982fb75a6e87eeebbd24dcde553bd24";

let userLat, userLon;

// ==== Detect farmer’s location & attach forecast button ====
function fetchWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;

        // Fetch current weather on load
        getWeather(userLat, userLon);

        // Attach forecast toggle
        const btn = document.getElementById("forecastBtn");
        if (btn) {
          btn.addEventListener("click", () => {
            const forecastBox = document.getElementById("forecast");

            // Toggle display
            const isHidden =
              forecastBox.style.display === "none" ||
              forecastBox.style.display === "";
            if (isHidden) {
              forecastBox.style.display = "grid";
              btn.textContent = "❌ Hide Forecast";
              getForecast(userLat, userLon); // fetch when showing
            } else {
              forecastBox.style.display = "none";
              btn.textContent = "📅 Show 5-Day Forecast";
            }
          });
        }
      },
      (error) => {
        console.error("Location access denied:", error);
        // fallback Nairobi
        userLat = -1.2921;
        userLon = 36.8219;
        getWeather(userLat, userLon);
      }
    );
  }
}

// ==== Fetch Current Weather ====
async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Weather API failed");

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

// ==== Fetch 5-Day Forecast ====
async function getForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Forecast API failed");

    const data = await response.json();

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = ""; // clear old data

    // Group by day (API gives 3-hour intervals)
    const forecastByDay = {};
    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!forecastByDay[date]) forecastByDay[date] = [];
      forecastByDay[date].push(item);
    });

    // Build 5-day forecast
    Object.keys(forecastByDay)
      .slice(0, 5) // only 5 days
      .forEach((date) => {
        const dayData =
          forecastByDay[date][4] || forecastByDay[date][0]; // midday if possible
        const temp = dayData.main.temp;
        const desc = dayData.weather[0].description;
        const humidity = dayData.main.humidity;

        // Advice
        let advice = "";
        if (desc.includes("rain")) {
          advice = "🌧 Rain expected → good for planting maize & beans.";
        } else if (temp > 30) {
          advice = "☀️ Very hot → irrigate crops.";
        } else if (temp < 15) {
          advice = "❄️ Cold → protect seedlings.";
        } else if (humidity > 70 && temp >= 20 && temp <= 26) {
          advice = "🥬 Perfect for leafy greens (spinach, sukuma wiki).";
        } else {
          advice = "✅ Normal farming conditions.";
        }

        let cropAdvice = getCropAdvice(temp, desc);

        forecastDiv.innerHTML += `
          <div class="forecast-day">
            <h5>${date}</h5>
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
  if (desc.includes("rain")) {
    return "🌽 Maize & beans will thrive → plant now.";
  } else if (temp > 28) {
    return "🥒 Vegetables may wilt → provide irrigation.";
  } else if (temp < 18) {
    return "🍅 Tomatoes may slow growth → consider greenhouse.";
  } else {
    return "🌾 Balanced weather → good for most crops.";
  }
}

// Run on page load
fetchWeatherByLocation();
