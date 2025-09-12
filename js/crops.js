document.addEventListener("DOMContentLoaded", () => {
  const cropForm = document.getElementById("cropForm");
  const cropList = document.getElementById("cropList");
  const ctx = document.getElementById("harvestChart").getContext("2d");

  let crops = JSON.parse(localStorage.getItem("farmerCrops")) || [];
  let harvestChart;

  // Render crops on load
  renderCrops();
  updateChart();

  // Add crop
  cropForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const crop = {
      id: Date.now(),
      name: document.getElementById("cropName").value,
      plantDate: document.getElementById("plantDate").value,
      harvestDate: document.getElementById("harvestDate").value,
      yield: document.getElementById("expectedYield").value
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
  window.deleteCrop = function(id) {
    crops = crops.filter(c => c.id !== id);
    localStorage.setItem("farmerCrops", JSON.stringify(crops));
    renderCrops();
    updateChart();
  };

  // Chart.js - Harvest Timeline
  function updateChart() {
    const labels = crops.map(c => c.name);
    const yields = crops.map(c => c.yield);

    if (harvestChart) harvestChart.destroy();

    harvestChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Expected Yield (kg)",
          data: yields,
          backgroundColor: "rgba(0,128,0,0.6)"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
});
