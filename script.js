const apiUrl = "https://fakestoreapi.com/products";
const cartApiUrl = "https://fakestoreapi.com/carts";

const productGrid = document.getElementById("productGrid");
const statusMessage = document.getElementById("statusMessage");
const categorySelect = document.getElementById("categorySelect");
const searchInput = document.getElementById("searchInput");
const productTotal = document.getElementById("productTotal");

const openCartButton = document.getElementById("openCartButton");
const closeCartButton = document.getElementById("closeCartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartMessage = document.getElementById("cartMessage");
const clearCartButton = document.getElementById("clearCartButton");
const checkoutButton = document.getElementById("checkoutButton");

let allProducts = [];
let cart = [];

// These functions run when the page first opens.
getProducts();
updateCart();

async function getProducts() {
  try {
    const response = await fetch(apiUrl);
    const products = await response.json();

    allProducts = products;
    productTotal.textContent = allProducts.length;

    showCategories();
    showProducts(allProducts);
    hideStatusMessage();
  } catch (error) {
    statusMessage.textContent = "Sorry, products could not be loaded.";
    console.log("Product loading error:", error);
  }
}

function showCategories() {
  const categories = [];

  for (let i = 0; i < allProducts.length; i++) {
    const category = allProducts[i].category;

    if (categories.includes(category) === false) {
      categories.push(category);
    }
  }

  for (let i = 0; i < categories.length; i++) {
    const option = document.createElement("option");
    option.value = categories[i];
    option.textContent = capitalizeText(categories[i]);
    categorySelect.appendChild(option);
  }
}

function showProducts(products) {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    statusMessage.textContent = "No products match your search.";
    statusMessage.classList.remove("is-hidden");
    return;
  }

  hideStatusMessage();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productCard = document.createElement("article");

    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <p class="category">${capitalizeText(product.category)}</p>
      <h3>${product.title}</h3>
      <p class="rating">Rating ${product.rating.rate} / 5 (${product.rating.count} reviews)</p>
      <div class="product-bottom">
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="add-button" type="button">Add</button>
      </div>
    `;

    const addButton = productCard.querySelector(".add-button");

    addButton.addEventListener("click", function () {
      addToCart(product.id);
    });

    productGrid.appendChild(productCard);
  }
}

function addToCart(productId) {
  const product = findProductById(productId);
  const cartProduct = findCartItemById(productId);

  if (cartProduct) {
    cartProduct.quantity = cartProduct.quantity + 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  updateCart();
  showCartMessage("Item added to cart.", false);
}

function updateCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const cartItem = document.createElement("div");

    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div>
        <h3>${item.title}</h3>
        <p>$${item.price.toFixed(2)}</p>
      </div>
      <div class="quantity-buttons">
        <button type="button" aria-label="Remove one item">-</button>
        <span>${item.quantity}</span>
        <button type="button" aria-label="Add one item">+</button>
      </div>
    `;

    const quantityButtons = cartItem.querySelectorAll("button");
    const minusButton = quantityButtons[0];
    const plusButton = quantityButtons[1];

    minusButton.addEventListener("click", function () {
      changeQuantity(item.id, -1);
    });

    plusButton.addEventListener("click", function () {
      changeQuantity(item.id, 1);
    });

    cartItems.appendChild(cartItem);
  }

  cartCount.textContent = getCartCount();
  cartTotal.textContent = "$" + getCartTotal();
}

function changeQuantity(productId, amount) {
  const cartProduct = findCartItemById(productId);

  cartProduct.quantity = cartProduct.quantity + amount;

  if (cartProduct.quantity <= 0) {
    removeItemFromCart(productId);
  }

  updateCart();
}

function clearCart() {
  if (cart.length === 0) {
    showCartMessage("Your cart is already empty.", true);
    return;
  }

  cart = [];
  updateCart();
  showCartMessage("Cart cleared.", false);
}

async function checkout() {
  if (cart.length === 0) {
    showCartMessage("Please add an item before checkout.", true);
    return;
  }

  const orderTotal = getCartTotal();
  const orderProducts = [];

  for (let i = 0; i < cart.length; i++) {
    orderProducts.push({
      productId: cart[i].id,
      quantity: cart[i].quantity
    });
  }

  checkoutButton.textContent = "Checking out...";
  checkoutButton.disabled = true;

  try {
    const response = await fetch(cartApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: 1,
        date: new Date().toISOString().slice(0, 10),
        products: orderProducts
      })
    });

    if (response.ok === false) {
      throw new Error("Checkout request failed");
    }

    cart = [];
    updateCart();
    showCartMessage("Order placed successfully. Total paid: $" + orderTotal, false);
  } catch (error) {
    showCartMessage("Checkout failed. Please try again.", true);
    
  }

  checkoutButton.textContent = "Checkout";
  checkoutButton.disabled = false;
}

function filterProducts() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;
  const filteredProducts = [];

  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    const titleMatches = product.title.toLowerCase().includes(searchText);
    const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;

    if (titleMatches && categoryMatches) {
      filteredProducts.push(product);
    }
  }

  showProducts(filteredProducts);
}

function findProductById(productId) {
  for (let i = 0; i < allProducts.length; i++) {
    if (allProducts[i].id === productId) {
      return allProducts[i];
    }
  }
}

function findCartItemById(productId) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      return cart[i];
    }
  }
}

function removeItemFromCart(productId) {
  const newCart = [];

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id !== productId) {
      newCart.push(cart[i]);
    }
  }

  cart = newCart;
}

function getCartCount() {
  let count = 0;

  for (let i = 0; i < cart.length; i++) {
    count = count + cart[i].quantity;
  }

  return count;
}

function getCartTotal() {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].price * cart[i].quantity;
  }

  return total.toFixed(2);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  showCartMessage("", false);
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function hideStatusMessage() {
  statusMessage.classList.add("is-hidden");
}

function showCartMessage(message, isError) {
  cartMessage.textContent = message;
  cartMessage.classList.toggle("is-error", isError);
}

function capitalizeText(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);
openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
clearCartButton.addEventListener("click", clearCart);
checkoutButton.addEventListener("click", checkout);

cartDrawer.addEventListener("click", function (event) {
  if (event.target === cartDrawer) {
    closeCart();
  }
});
