let products = [];

window.onload = () => {
  const saved = localStorage.getItem("products");
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = [
      { id: 1, name: "Leche", quantity: 20, minQuantity: 5, priceBuy: 1.0, priceSell: 1.5 },
      { id: 2, name: "Pan", quantity: 30, minQuantity: 10, priceBuy: 0.7, priceSell: 1.2 }
    ];
    saveData();
  }
  renderTable();
  updateTotals();
};

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
}

function getNextId() {
  if (products.length === 0) return 1;
  const maxId = Math.max(...products.map(p => p.id));
  return maxId + 1;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function renderTable(filteredProducts = products) {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";

  if (filteredProducts.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No hay productos</td></tr>";
    return;
  }

  filteredProducts.forEach((p) => {
    const row = document.createElement("tr");

    const trClass = p.quantity < p.minQuantity ? 'class="low-stock"' : '';

    row.innerHTML = `
      <td ${trClass}>${p.id}</td>
      <td ${trClass}>${p.name}</td>
      <td ${trClass}>${p.quantity}</td>
      <td ${trClass}>$${parseFloat(p.priceBuy).toFixed(2)}</td>
      <td ${trClass}>$${parseFloat(p.priceSell).toFixed(2)}</td>
      <td>
        <button onclick="showInOutModal(${p.id})">Ajustar</button>
        <button onclick="editProduct(${p.id})">Editar</button>
        <button onclick="deleteProduct(${p.id})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(term)
  );
  renderTable(filtered);
});

function showAddModal() {
  document.getElementById("modalTitle").textContent = "Agregar Producto";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const minQuantity = parseInt(document.getElementById("productMinQuantity").value);
  const priceBuy = parseFloat(document.getElementById("productPriceBuy").value);
  const priceSell = parseFloat(document.getElementById("productPriceSell").value);

  if (!name || isNaN(quantity) || isNaN(minQuantity) || isNaN(priceBuy) || isNaN(priceSell)) {
    showToast("Todos los campos son obligatorios.");
    return;
  }

  const id = parseInt(document.getElementById("productId").value) || getNextId();

  const product = {
    id: id,
    name: name,
    quantity: quantity,
    minQuantity: minQuantity,
    priceBuy: priceBuy,
    priceSell: priceSell
  };

  if (id && products.some(p => p.id === id)) {
    products = products.filter(p => p.id !== id);
  }

  products.push(product);
  reassignIds();

  saveData();
  renderTable();
  updateTotals();
  closeModal();
  showToast("Producto guardado correctamente.");
});

function editProduct(id) {
  const product = products.find(p => p.id === id);
  document.getElementById("modalTitle").textContent = "Editar Producto";
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productQuantity").value = product.quantity;
  document.getElementById("productMinQuantity").value = product.minQuantity;
  document.getElementById("productPriceBuy").value = product.priceBuy;
  document.getElementById("productPriceSell").value = product.priceSell;
  document.getElementById("modal").style.display = "block";
}

function deleteProduct(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    products = products.filter(p => p.id !== id);
    reassignIds();
    saveData();
    renderTable();
    updateTotals();
    showToast("Producto eliminado.");
  }
}

function reassignIds() {
  products.sort((a, b) => a.id - b.id);
  products.forEach((p, index) => {
    p.id = index + 1;
  });
}

function showInOutModal(id) {
  document.getElementById("productIdInOut").value = id;
  document.getElementById("inOutModal").style.display = "block";
}

function closeInOutModal() {
  document.getElementById("inOutModal").style.display = "none";
}

document.getElementById("inOutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById("productIdInOut").value);
  const type = document.getElementById("typeInOut").value;
  const amount = parseInt(document.getElementById("amountInOut").value);

  adjustStock(id, type, amount);
  closeInOutModal();
});

function adjustStock(id, type, amount) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (type === "entrada") {
    product.quantity += amount;
  } else if (type === "salida") {
    if (product.quantity >= amount) {
      product.quantity -= amount;
    } else {
      showToast("No hay suficiente stock.");
      return;
    }
  }

  saveData();
  renderTable();
  updateTotals();
  showToast(`Stock de "${product.name}" actualizado.`);
}

function updateTotals() {
  let totalInvested = 0;
  let estimatedProfit = 0;

  products.forEach(p => {
    totalInvested += p.priceBuy * p.quantity;
    estimatedProfit += (p.priceSell - p.priceBuy) * p.quantity;
  });

  document.getElementById("totalInvested").textContent = totalInvested.toFixed(2);
  document.getElementById("estimatedProfit").textContent = estimatedProfit.toFixed(2);
}