const sellForm = document.getElementById("sellForm");
const productGrid = document.getElementById("productGrid");
const cartList = document.getElementById("cartList");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const orderHistoryDiv = document.getElementById("orderHistory");
const cartTotalEl = document.getElementById("cartTotal");

const PRODUCTS_KEY = "farmtech_products";
const CART_KEY = "farmtech_cart";
const ORDERS_KEY = "farmtech_orders";

let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

function saveData() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function renderProducts() {
  productGrid.innerHTML = "";
  if (products.length === 0) {
    productGrid.innerHTML = "<p>No products available yet.</p>";
    return;
  }
  products.forEach((p, index) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>Price: KES ${p.price}</p>
      <p>Qty: ${p.qty}</p>
      <p><em>${p.category}</em></p>
      <button class="add-cart">Add to Cart</button>
      <button class="remove-product">Remove</button>
      <button class="toggle-details">View Details</button>
      <div class="details hidden">
        <p><strong>Seller:</strong> You (local farmer)</p>
        <p><strong>Category:</strong> ${p.category}</p>
        <p><strong>Stock Left:</strong> ${p.qty}</p>
      </div>
    `;
    card.querySelector(".toggle-details").addEventListener("click", () => {
      card.querySelector(".details").classList.toggle("hidden");
    });
    card.querySelector(".add-cart").addEventListener("click", () => {
      cart.push(p);
      saveData();
      renderCart();
    });
    card.querySelector(".remove-product").addEventListener("click", () => {
      products.splice(index, 1);
      saveData();
      renderProducts();
    });
    productGrid.appendChild(card);
  });
}

function renderCart() {
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartList.innerHTML = "<li>No items in cart</li>";
    cartTotalEl.textContent = "0.00";
    return;
  }
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - KES ${item.price}`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
      cart.splice(index, 1);
      saveData();
      renderCart();
    };
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = total.toFixed(2);
}

function renderOrders() {
  orderHistoryDiv.innerHTML = "";
  if (orders.length === 0) {
    orderHistoryDiv.innerHTML = "<p>No orders yet.</p>";
    return;
  }
  orders.forEach((order, index) => {
    const card = document.createElement("div");
    card.classList.add("order-card");
    card.innerHTML = `
      <h4>Order #${index + 1} - ${order.date}</h4>
      <p><strong>Total:</strong> KES ${order.total}</p>
      <button class="toggle-details">View Details</button>
      <div class="details hidden">
        <ul>
          ${order.items.map(i => `<li>${i.name} - ${i.qty || 1} @ KES ${i.price}</li>`).join("")}
        </ul>
      </div>
    `;
    card.querySelector(".toggle-details").addEventListener("click", () => {
      card.querySelector(".details").classList.toggle("hidden");
    });
    orderHistoryDiv.appendChild(card);
  });
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const newOrder = {
    date: new Date().toLocaleString(),
    items: [...cart],
    total
  };
  orders.push(newOrder);
  cart = [];
  saveData();
  renderCart();
  renderOrders();
  alert("✅ Checkout successful! Your order has been placed.");
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  saveData();
  renderCart();
});

sellForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newProduct = {
    name: document.getElementById("productName").value,
    price: parseFloat(document.getElementById("productPrice").value),
    qty: parseInt(document.getElementById("productQty").value),
    category: document.getElementById("productCategory").value,
    image: document.getElementById("productImage").value
  };
  products.push(newProduct);
  saveData();
  renderProducts();
  sellForm.reset();
document.querySelectorAll('.order-card button').forEach(btn => {
  btn.addEventListener('click', () => {
    const details = btn.closest('.order-card').querySelector('.details');
    details.classList.toggle('hidden');
  });
});
});

renderProducts();
renderCart();
renderOrders();
