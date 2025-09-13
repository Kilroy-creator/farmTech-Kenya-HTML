// Get elements
const livestockForm = document.getElementById("livestockForm");
const vaccineForm = document.getElementById("vaccineForm");
const livestockList = document.getElementById("livestockList");
const productionChartCtx = document.getElementById("productionChart").getContext("2d");

// LocalStorage Keys
const ANIMALS_KEY = "farmtech_animals";
const VACCINE_KEY = "farmtech_vaccines";

// Load existing data
let animals = JSON.parse(localStorage.getItem(ANIMALS_KEY)) || [];
let vaccines = JSON.parse(localStorage.getItem(VACCINE_KEY)) || [];

// Save to localStorage
function saveData() {
  localStorage.setItem(ANIMALS_KEY, JSON.stringify(animals));
  localStorage.setItem(VACCINE_KEY, JSON.stringify(vaccines));
}

// Render animal cards
function renderAnimals() {
  livestockList.innerHTML = "";

  animals.forEach((animal, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Collapsible details
    card.innerHTML = `
      <h3>${animal.type} (${animal.breed}) - Count: ${animal.count}</h3>
      <p><strong>ID:</strong> ${index + 1}</p>
      <button class="toggle-details">View Details</button>
      <button class="edit-animal">✏️ Edit</button>
      <button class="delete-animal">❌ Delete</button>
      <div class="details hidden">
        <p><strong>Date of Birth/Acquisition:</strong> ${animal.dob}</p>
        <p><strong>Production:</strong> ${animal.production || "N/A"}</p>
        <h4>Vaccinations & Treatments:</h4>
        <ul id="vaccineList-${index}">
          ${vaccines
            .filter(v => v.animalId === index + 1)
            .map((v, i) => `
              <li>
                ${v.name} (Given: ${v.date}, Next: ${v.next || "N/A"})
                <button class="edit-vaccine" data-animal="${index + 1}" data-vaccine="${i}">✏️</button>
                <button class="delete-vaccine" data-animal="${index + 1}" data-vaccine="${i}">❌</button>
              </li>
            `)
            .join("")}
        </ul>
      </div>
    `;

    // Toggle details
    card.querySelector(".toggle-details").addEventListener("click", () => {
      card.querySelector(".details").classList.toggle("hidden");
    });

    // Edit animal
    card.querySelector(".edit-animal").addEventListener("click", () => {
      const a = animals[index];
      document.getElementById("animalType").value = a.type;
      document.getElementById("animalBreed").value = a.breed;
      document.getElementById("animalCount").value = a.count;
      document.getElementById("animalDOB").value = a.dob;
      document.getElementById("animalProduction").value = a.production;
      animals.splice(index, 1); // Remove temporarily until re-added
      saveData();
      renderAnimals();
      updateChart();
    });

    // Delete animal
    card.querySelector(".delete-animal").addEventListener("click", () => {
      if (confirm("Delete this animal?")) {
        animals.splice(index, 1);
        // Remove related vaccines
        vaccines = vaccines.filter(v => v.animalId !== index + 1);
        saveData();
        renderAnimals();
        updateChart();
      }
    });

    livestockList.appendChild(card);
  });

  // Attach vaccine edit/delete handlers
  document.querySelectorAll(".edit-vaccine").forEach(btn => {
    btn.addEventListener("click", () => {
      const aId = parseInt(btn.dataset.animal);
      const vId = parseInt(btn.dataset.vaccine);
      const v = vaccines.find((_, i) => i === vId && vaccines[i].animalId === aId);
      if (v) {
        document.getElementById("animalId").value = aId;
        document.getElementById("vaccineName").value = v.name;
        document.getElementById("vaccineDate").value = v.date;
        document.getElementById("nextVaccineDate").value = v.next;
        vaccines.splice(vId, 1); // Remove until re-saved
        saveData();
        renderAnimals();
      }
    });
  });

  document.querySelectorAll(".delete-vaccine").forEach(btn => {
    btn.addEventListener("click", () => {
      const aId = parseInt(btn.dataset.animal);
      const vId = parseInt(btn.dataset.vaccine);
      if (confirm("Delete this treatment?")) {
        vaccines.splice(vId, 1);
        saveData();
        renderAnimals();
      }
    });
  });
}

// Update chart
function updateChart() {
  const labels = animals.map((a, i) => `${a.type} #${i + 1}`);
  const data = animals.map(a => a.production || 0);

  new Chart(productionChartCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Production (Liters/Units)",
        data: data,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    }
  });
}

// Add new animal
livestockForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newAnimal = {
    type: document.getElementById("animalType").value,
    breed: document.getElementById("animalBreed").value,
    count: parseInt(document.getElementById("animalCount").value),
    dob: document.getElementById("animalDOB").value,
    production: parseFloat(document.getElementById("animalProduction").value) || 0
  };
  animals.push(newAnimal);
  saveData();
  renderAnimals();
  updateChart();
  livestockForm.reset();
});

// Add vaccine/treatment
vaccineForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newVaccine = {
    animalId: parseInt(document.getElementById("animalId").value),
    name: document.getElementById("vaccineName").value,
    date: document.getElementById("vaccineDate").value,
    next: document.getElementById("nextVaccineDate").value
  };
  vaccines.push(newVaccine);
  saveData();
  renderAnimals();
  vaccineForm.reset();
});
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("livestockChart");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Cows", "Goats", "Sheep"],
        datasets: [{
          label: "Animals",
          data: [5, 10, 8],
          backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
        }]
      }
    });
  }
});

// Initial render
renderAnimals();
updateChart();
