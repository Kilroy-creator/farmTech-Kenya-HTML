const livestockForm = document.getElementById("livestockForm");
const vaccineForm = document.getElementById("vaccineForm");
const livestockList = document.getElementById("livestockList");
const animalSelect = document.getElementById("animalSelect"); // ✅ dropdown reference

// Keys
const ANIMALS_KEY = "farmtech_animals";
const VACCINE_KEY = "farmtech_vaccines";

// Load
let animals = JSON.parse(localStorage.getItem(ANIMALS_KEY)) || [];
let vaccines = JSON.parse(localStorage.getItem(VACCINE_KEY)) || [];

function saveData() {
  localStorage.setItem(ANIMALS_KEY, JSON.stringify(animals));
  localStorage.setItem(VACCINE_KEY, JSON.stringify(vaccines));
}

// ✅ Vaccine status color function
function getVaccineStatus(nextDate) {
  if (!nextDate) return "⚪ N/A";

  const today = new Date();
  const due = new Date(nextDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "🔴 Overdue!";
  } else if (diffDays <= 7) {
    return "🟡 Due Soon";
  } else {
    return "🟢 Up-to-date";
  }
}

// ✅ Update dropdown options with animal list
function updateAnimalSelect() {
  animalSelect.innerHTML = `<option value="">-- Select Animal --</option>`;
  animals.forEach((a, index) => {
    const option = document.createElement("option");
    option.value = index + 1; // use ID
    option.textContent = `${index + 1} - ${a.type} (${a.breed})`;
    animalSelect.appendChild(option);
  });
}

// Render animals
function renderAnimals() {
  livestockList.innerHTML = "";
  if (animals.length === 0) {
    livestockList.innerHTML = "<p>No livestock added yet.</p>";
    updateAnimalSelect();
    return;
  }

  animals.forEach((animal, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${animal.type} (${animal.breed})</h3>
      <p><strong>ID:</strong> ${index + 1}</p>
      <p><strong>Count:</strong> ${animal.count}</p>
      <p><strong>DOB/Acquisition:</strong> ${animal.dob}</p>
      <p><strong>Production:</strong> ${animal.production || "N/A"}</p>
      <h4>Vaccines/Treatments:</h4>
      <ul>
        ${
          vaccines
            .filter(v => v.animalId === index + 1)
            .map((v, i) => {
              const status = getVaccineStatus(v.next);
              return `
                <li>
                  ${v.name} (Given: ${v.date}, Next: ${v.next || "N/A"}) 
                  <span>${status}</span>
                  <button class="edit-vaccine" data-animal="${index + 1}" data-vaccine="${i}">✏️</button>
                  <button class="delete-vaccine" data-animal="${index + 1}" data-vaccine="${i}">❌</button>
                </li>`;
            })
            .join("")
        }
      </ul>
      <button class="edit-animal">✏️ Edit</button>
      <button class="delete-animal">❌ Delete</button>
    `;

    // Edit animal
    card.querySelector(".edit-animal").addEventListener("click", () => {
      const a = animals[index];
      document.getElementById("animalType").value = a.type;
      document.getElementById("animalBreed").value = a.breed;
      document.getElementById("animalCount").value = a.count;
      document.getElementById("animalDOB").value = a.dob;
      document.getElementById("animalProduction").value = a.production;
      animals.splice(index, 1);
      saveData();
      renderAnimals();
    });

    // Delete animal
    card.querySelector(".delete-animal").addEventListener("click", () => {
      if (confirm("Delete this animal?")) {
        animals.splice(index, 1);
        vaccines = vaccines.filter(v => v.animalId !== index + 1);
        saveData();
        renderAnimals();
      }
    });

    livestockList.appendChild(card);
  });

  // Attach vaccine handlers
  document.querySelectorAll(".edit-vaccine").forEach(btn => {
    btn.addEventListener("click", () => {
      const aId = parseInt(btn.dataset.animal);
      const vId = parseInt(btn.dataset.vaccine);
      const v = vaccines.find((_, i) => i === vId && vaccines[i].animalId === aId);
      if (v) {
        animalSelect.value = aId; // ✅ select the animal in dropdown
        document.getElementById("vaccineName").value = v.name;
        document.getElementById("vaccineDate").value = v.date;
        document.getElementById("nextVaccineDate").value = v.next;
        vaccines.splice(vId, 1);
        saveData();
        renderAnimals();
      }
    });
  });

  document.querySelectorAll(".delete-vaccine").forEach(btn => {
    btn.addEventListener("click", () => {
      const vId = parseInt(btn.dataset.vaccine);
      if (confirm("Delete this treatment?")) {
        vaccines.splice(vId, 1);
        saveData();
        renderAnimals();
      }
    });
  });

  // ✅ update dropdown whenever animals change
  updateAnimalSelect();
}

// Add animal
livestockForm.addEventListener("submit", e => {
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
  livestockForm.reset();
});

// Add vaccine
vaccineForm.addEventListener("submit", e => {
  e.preventDefault();
  const newVaccine = {
    animalId: parseInt(animalSelect.value), // ✅ correct dropdown
    name: document.getElementById("vaccineName").value,
    date: document.getElementById("vaccineDate").value,
    next: document.getElementById("nextVaccineDate").value
  };
  vaccines.push(newVaccine);
  saveData();
  renderAnimals();
  vaccineForm.reset();
});

// Initial load
renderAnimals();
