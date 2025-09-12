const sellForm = document.getElementById("sellForm");
const productGrid = document.getElementById("productGrid");
const cartList = document.getElementById("cartList");

const PRODUCTS_KEY = "farmtech_products";
const CART_KEY = "farmtech_cart";
const checkoutBtn = document.getElementById("checkoutBtn");
const orderHistoryDiv = document.getElementById("orderHistory");

const ORDERS_KEY = "farmtech_orders";

let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

function saveData() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Render order history
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
          ${order.items.map(i => `<li>${i.name} - ${i.qty} @ KES ${i.price}</li>`).join("")}
        </ul>
      </div>
    `;

    card.querySelector(".toggle-details").addEventListener("click", () => {
      card.querySelector(".details").classList.toggle("hidden");
    });

    orderHistoryDiv.appendChild(card);
  });
}

// Checkout
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const newOrder = {
    date: new Date().toLocaleString(),
    items: [...cart],
    total: total
  };

  orders.push(newOrder);
  cart = []; // clear cart

  saveData();
  renderCart();
  renderOrders();

  alert("✅ Checkout successful! Your order has been placed.");
});

// Initial render
renderProducts();
renderCart();
renderOrders();

let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

function saveData() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderProducts() {
  productGrid.innerHTML = "";

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

    // Expand details
    card.querySelector(".toggle-details").addEventListener("click", () => {
      card.querySelector(".details").classList.toggle("hidden");
    });

    // Add to cart
    card.querySelector(".add-cart").addEventListener("click", () => {
      cart.push(p);
      saveData();
      renderCart();
    });

    // Remove product
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
  cart.forEach((item, index) => {
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
}

// Add new product
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
});

// Initial load
renderProducts();
renderCart();
