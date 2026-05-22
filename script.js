const apiUrl = "https://fakestoreapi.com/products";

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

let allProducts = [];
let cart = [];


getProducts();

async function getProducts() {
  try {
    const response = await fetch(apiUrl);
    const products = await response.json();

    allProducts = products;
    productTotal.textContent = allProducts.length;

    showCategories(allProducts);
    showProducts(allProducts);
    hideStatusMessage();
  } catch (error) {
    statusMessage.textContent = "Sorry, products could not be loaded.";
    console.log("Product loading error:", error);
  }
}

function showCategories(products) {
  const categories = [];

  products.forEach(function (product) {
    if (!categories.includes(product.category)) {
      categories.push(product.category);
    }
  });

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = capitalizeText(category);
    categorySelect.appendChild(option);
  });
}

function showProducts(products) {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    statusMessage.textContent = "No products match your search.";
    statusMessage.classList.remove("is-hidden");
    return;
  }

  hideStatusMessage();

  products.forEach(function (product) {
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
  });
}

function addToCart(productId) {
  const product = allProducts.find(function (item) {
    return item.id === productId;
  });

  const cartProduct = cart.find(function (item) {
    return item.id === productId;
  });

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
  openCart();
}

function updateCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<p>Your cart is empty.</p>`;
  }

  cart.forEach(function (item) {
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

    const buttons = cartItem.querySelectorAll("button");

    buttons[0].addEventListener("click", function () {
      changeQuantity(item.id, -1);
    });

    buttons[1].addEventListener("click", function () {
      changeQuantity(item.id, 1);
    });

    cartItems.appendChild(cartItem);
  });

  cartCount.textContent = getCartCount();
  cartTotal.textContent = "$" + getCartTotal();
}

function changeQuantity(productId, amount) {
  const cartProduct = cart.find(function (item) {
    return item.id === productId;
  });

  cartProduct.quantity = cartProduct.quantity + amount;

  if (cartProduct.quantity <= 0) {
    cart = cart.filter(function (item) {
      return item.id !== productId;
    });
  }

  updateCart();
}

function getCartCount() {
  let count = 0;

  cart.forEach(function (item) {
    count = count + item.quantity;
  });

  return count;
}

function getCartTotal() {
  let total = 0;

  cart.forEach(function (item) {
    total = total + item.price * item.quantity;
  });

  return total.toFixed(2);
}

function filterProducts() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;

  const filteredProducts = allProducts.filter(function (product) {
    const titleMatches = product.title.toLowerCase().includes(searchText);
    const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;

    return titleMatches && categoryMatches;
  });

  showProducts(filteredProducts);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function hideStatusMessage() {
  statusMessage.classList.add("is-hidden");
}

function capitalizeText(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);
openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);

cartDrawer.addEventListener("click", function (event) {
  if (event.target === cartDrawer) {
    closeCart();
  }
});
