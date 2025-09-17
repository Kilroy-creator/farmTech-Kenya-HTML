document.addEventListener("DOMContentLoaded", () => {
  const cropForm = document.getElementById("cropForm");
  const cropList = document.getElementById("cropList");
  const ctx = document.getElementById("harvestChart").getContext("2d");

  let crops = JSON.parse(localStorage.getItem("farmerCrops")) || [];
  let harvestChart;

  // Render crops & chart on load
  renderCrops();
  updateChart();

  // Add crop
  cropForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const crop = {
      id: Date.now(),
      name: document.getElementById("cropName").value,
      plantDate: document.getElementById("plantDate").value,
      harvestDate: document.getElementById("harvestDate").value,
      yield: Number(document.getElementById("expectedYield").value) // ✅ force number
    };

    crops.push(crop);
    localStorage.setItem("farmerCrops", JSON.stringify(crops));

    cropForm.reset();
    renderCrops();
    updateChart();
  });

  // Render crop cards
  function renderCrops() {
    cropList.innerHTML = "";
    if (crops.length === 0) {
      cropList.innerHTML = "<p>No crops added yet 🌱</p>";
      return;
    }

    crops.forEach(crop => {
      const card = document.createElement("div");
      card.className = "crop-card";
      card.innerHTML = `
        <h3>${crop.name}</h3>
        <p>🌱 Planted: ${crop.plantDate}</p>
        <p>🌾 Harvest: ${crop.harvestDate}</p>
        <p>📦 Yield: ${crop.yield} kg</p>
        <button onclick="deleteCrop(${crop.id})">Delete</button>
      `;
      cropList.appendChild(card);
    });
  }

  // Delete crop
  window.deleteCrop = function (id) {
    crops = crops.filter(c => c.id !== id);
    localStorage.setItem("farmerCrops", JSON.stringify(crops));
    renderCrops();
    updateChart();
  };

  // Chart.js - Harvest Timeline
  function updateChart() {
    if (harvestChart) harvestChart.destroy();

    if (crops.length === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }

    const labels = crops.map(c => c.name);
    const yields = crops.map(c => c.yield);

    harvestChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expected Yield (kg)",
            data: yields,
            backgroundColor: "rgba(0,128,0,0.7)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Yield (kg)"
            }
          },
          x: {
            title: {
              display: true,
              text: "Crops"
            }
          }
        }
      }
    });
  }
});
