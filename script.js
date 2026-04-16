const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbynDXh83OlrwTBfekrxtIQ6Aoen3xLIUvQyLbalFzBytDE-LiRpyEjOWwg7-k68m27k/exec";

const fallbackProducts = [
  {
    id: 1,
    name: "PBT Cherry Profile Keycap Set",
    category: "Keycaps",
    price: 1499,
    shop: "Shopee",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    description: "Thick PBT keycaps with clean legends and a muted enthusiast sound profile.",
    affiliateLink: "https://example.com/affiliate-keycaps",
    tag: "Best Seller",
    featured: true
  },
  {
    id: 2,
    name: "Linear Switch Set – 70pcs",
    category: "Switches",
    price: 1190,
    shop: "Lazada",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    description: "Smooth linear switches ideal for a creamy build with mod potential.",
    affiliateLink: "https://example.com/affiliate-switches",
    tag: "Smooth",
    featured: true
  },
  {
    id: 3,
    name: "Switch Lube Kit",
    category: "Lube",
    price: 650,
    shop: "Amazon",
    stock: "Limited",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
    description: "Starter lube set for switches and stabilizers with brush and opener.",
    affiliateLink: "https://example.com/affiliate-lube",
    tag: "Modding",
    featured: false
  },
  {
    id: 4,
    name: "Keyboard Cleaning Gel & Brush Kit",
    category: "Cleaner",
    price: 399,
    shop: "Shopee",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    description: "Cleaning set for dust, crumbs, and fingerprints on your board and desk setup.",
    affiliateLink: "https://example.com/affiliate-cleaner",
    tag: "Maintenance",
    featured: false
  },
  {
    id: 5,
    name: "Screw-in Stabilizer Set",
    category: "Accessories",
    price: 820,
    shop: "AliExpress",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80",
    description: "Reliable screw-in stabilizers for cleaner tuning and reduced rattle.",
    affiliateLink: "https://example.com/affiliate-stabs",
    tag: "Tuning",
    featured: true
  },
  {
    id: 6,
    name: "Extended Desk Mat",
    category: "Accessories",
    price: 990,
    shop: "Lazada",
    stock: "Out of Stock",
    image: "https://images.unsplash.com/photo-1545231027-637d2f6210f8?auto=format&fit=crop&w=900&q=80",
    description: "Large stitched-edge desk mat to complete the setup and reduce desk noise.",
    affiliateLink: "https://example.com/affiliate-deskmat",
    tag: "Setup",
    featured: false
  }
];

const state = {
  allProducts: [],
  filteredProducts: []
};

const productGrid = document.getElementById("productGrid");
const resultsText = document.getElementById("resultsText");
const statCount = document.getElementById("statCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const shopFilter = document.getElementById("shopFilter");
const stockFilter = document.getElementById("stockFilter");
const sortFilter = document.getElementById("sortFilter");

async function loadProducts() {
  try {
    if (!SHEET_API_URL || SHEET_API_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
      throw new Error("No sheet API URL yet. Using fallback data.");
    }

    const response = await fetch(SHEET_API_URL);
    if (!response.ok) throw new Error("Failed to fetch Google Sheets data.");

    const data = await response.json();
    const rows = Array.isArray(data) ? data : (data.products || []);

    if (!rows.length) throw new Error("No products found in sheet.");

    state.allProducts = rows.map(normalizeProduct);
  } catch (error) {
    console.warn(error.message);
    state.allProducts = fallbackProducts.map(normalizeProduct);
  }

  buildFilterOptions();
  applyFilters();
  statCount.textContent = state.allProducts.length;
}

function normalizeProduct(item) {
  return {
    id: Number(item.id || Date.now() + Math.random()),
    name: String(item.name || "Untitled Product"),
    category: String(item.category || "Other"),
    price: Number(item.price || 0),
    shop: String(item.shop || "Marketplace"),
    stock: String(item.stock || "In Stock"),
    image: String(item.image || "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80"),
    description: String(item.description || "No description available."),
    affiliateLink: String(item.affiliateLink || item.link || "#"),
    tag: String(item.tag || "Featured"),
    featured: String(item.featured).toLowerCase() === "true" || item.featured === true
  };
}

function buildFilterOptions() {
  const categories = [...new Set(state.allProducts.map(product => product.category))].sort();
  const shops = [...new Set(state.allProducts.map(product => product.shop))].sort();

  categoryFilter.innerHTML =
    '<option value="all">All categories</option>' +
    categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");

  shopFilter.innerHTML =
    '<option value="all">All shops</option>' +
    shops.map(shop => `<option value="${escapeHtml(shop)}">${escapeHtml(shop)}</option>`).join("");
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value.toLowerCase();
  const shop = shopFilter.value.toLowerCase();
  const stock = stockFilter.value.toLowerCase();
  const sort = sortFilter.value;

  let products = [...state.allProducts].filter(product => {
    const matchesSearch = !q || [
      product.name,
      product.category,
      product.shop,
      product.description,
      product.tag
    ].join(" ").toLowerCase().includes(q);

    const matchesCategory = category === "all" || product.category.toLowerCase() === category;
    const matchesShop = shop === "all" || product.shop.toLowerCase() === shop;
    const matchesStock = stock === "all" || product.stock.toLowerCase() === stock;

    return matchesSearch && matchesCategory && matchesShop && matchesStock;
  });

  switch (sort) {
    case "low-high":
      products.sort((a, b) => a.price - b.price);
      break;
    case "high-low":
      products.sort((a, b) => b.price - a.price);
      break;
    case "name":
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      products.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
      break;
  }

  state.filteredProducts = products;
  renderProducts(products);
}

function renderProducts(products) {
  resultsText.textContent = `${products.length} product${products.length !== 1 ? "s" : ""} found`;

  if (!products.length) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3 style="margin-top:0;color:var(--text);">No products matched your filters.</h3>
        <p>Try another category, marketplace, or search term.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = products.map(product => `
    <article class="card">
      <div class="thumb">
        <img src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.name)}" loading="lazy">
      </div>

      <div class="badge-row">
        ${product.featured ? '<span class="badge primary">Featured</span>' : ""}
        <span class="badge">${escapeHtml(product.tag)}</span>
      </div>

      <h3 class="title">${escapeHtml(product.name)}</h3>

      <div class="meta">
        <div><strong>Category</strong><br>${escapeHtml(product.category)}</div>
        <div><strong>Stock</strong><br>${escapeHtml(product.stock)}</div>
      </div>

      <p class="desc">${escapeHtml(product.description)}</p>

      <div class="price-row">
        <div>
          <div class="price">₱${formatPrice(product.price)}</div>
          <div class="market">${escapeHtml(product.shop)}</div>
        </div>
      </div>

      <div class="button-row">
        <a class="btn btn-primary" href="${escapeAttribute(product.affiliateLink)}" target="_blank" rel="nofollow sponsored noopener">View Product</a>
        <button class="btn btn-secondary" type="button" onclick="copyLink('${jsEscape(product.affiliateLink)}')">Copy Link</button>
      </div>
    </article>
  `).join("");
}

function formatPrice(price) {
  return Number(price).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function copyLink(link) {
  navigator.clipboard.writeText(link)
    .then(() => alert("Product link copied."))
    .catch(() => alert("Could not copy link."));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(str) {
  return escapeHtml(str).replace(/`/g, "&#096;");
}

function jsEscape(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

[searchInput, categoryFilter, shopFilter, stockFilter, sortFilter].forEach(element => {
  element.addEventListener("input", applyFilters);
  element.addEventListener("change", applyFilters);
});

loadProducts();