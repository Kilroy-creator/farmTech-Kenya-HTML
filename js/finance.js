// LocalStorage keys
const EXPENSE_KEY = "farmtech_expenses";
const INCOME_KEY = "farmtech_income";
const LOAN_KEY = "farmtech_loans";

let expenses = JSON.parse(localStorage.getItem(EXPENSE_KEY)) || [];
let incomes = JSON.parse(localStorage.getItem(INCOME_KEY)) || [];
let loans = JSON.parse(localStorage.getItem(LOAN_KEY)) || [];

const transactionList = document.getElementById("transactionList");
let financeChart;

// Save Data
function saveData() {
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  localStorage.setItem(INCOME_KEY, JSON.stringify(incomes));
  localStorage.setItem(LOAN_KEY, JSON.stringify(loans));
}

// Render Summary
function renderSummary() {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
  const loanBalance = loans.reduce((sum, l) => sum + l.amount, 0);
  const profit = totalIncome - totalExpenses - loanBalance;

  document.getElementById("totalIncome").textContent = `KSh ${totalIncome}`;
  document.getElementById("totalExpenses").textContent = `KSh ${totalExpenses}`;
  document.getElementById("loanBalance").textContent = `KSh ${loanBalance}`;
  document.getElementById("profit").textContent = `KSh ${profit}`;
}

// Render Transactions
function renderTransactions() {
  transactionList.innerHTML = "";
  [...expenses, ...incomes, ...loans].forEach((t) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${t.type}</h3>
      <p><strong>Date:</strong> ${t.date}</p>
      <p><strong>Details:</strong> ${t.item || t.source || t.lender}</p>
      <p><strong>Amount:</strong> KSh ${t.cost || t.amount}</p>
      <button class="delete-transaction">❌ Delete</button>
    `;
    card.querySelector(".delete-transaction").addEventListener("click", () => {
      if (confirm("Delete this record?")) {
        if (t.type === "Expense") expenses = expenses.filter(e => e !== t);
        else if (t.type === "Income") incomes = incomes.filter(i => i !== t);
        else loans = loans.filter(l => l !== t);

        saveData();
        renderSummary();
        renderTransactions();
        updateChart();
      }
    });
    transactionList.appendChild(card);
  });
}

// Update Chart
function updateChart() {
  const ctx = document.getElementById("financeChart").getContext("2d");

  if (financeChart) financeChart.destroy();

  financeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses", "Loans"],
      datasets: [{
        label: "Finance Overview",
        data: [
          incomes.reduce((s, i) => s + i.amount, 0),
          expenses.reduce((s, e) => s + e.cost, 0),
          loans.reduce((s, l) => s + l.amount, 0)
        ],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Expense form
document.getElementById("expenseForm").addEventListener("submit", e => {
  e.preventDefault();
  expenses.push({
    type: "Expense",
    date: document.getElementById("expenseDate").value,
    item: document.getElementById("expenseItem").value,
    category: document.getElementById("expenseCategory").value,
    cost: parseInt(document.getElementById("expenseCost").value)
  });
  saveData();
  renderSummary();
  renderTransactions();
  updateChart();
  e.target.reset();
});

// Income form
document.getElementById("incomeForm").addEventListener("submit", e => {
  e.preventDefault();
  incomes.push({
    type: "Income",
    date: document.getElementById("incomeDate").value,
    source: document.getElementById("incomeSource").value,
    amount: parseInt(document.getElementById("incomeAmount").value)
  });
  saveData();
  renderSummary();
  renderTransactions();
  updateChart();
  e.target.reset();
});

// Loan form
document.getElementById("loanForm").addEventListener("submit", e => {
  e.preventDefault();
  loans.push({
    type: "Loan",
    lender: document.getElementById("loanLender").value,
    amount: parseInt(document.getElementById("loanAmount").value),
    date: new Date().toISOString().split("T")[0],
    due: document.getElementById("loanDue").value
  });
  saveData();
  renderSummary();
  renderTransactions();
  updateChart();
  e.target.reset();
});

// Init
renderSummary();
renderTransactions();
updateChart();
