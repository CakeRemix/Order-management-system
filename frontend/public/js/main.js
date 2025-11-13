// Food web interactive behaviors and a shared cart API
document.addEventListener('DOMContentLoaded', function(){
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  const proceedBtn = document.getElementById('proceedBtn');
  const schedulePickup = document.getElementById('schedulePickup');

  // Order structure: { truck, items, total, pickupTime, status, createdAt }
  // Cart structure: { owner: null|string, items: [ {name,price,quantity} ] }
  let cartStore = { owner: null, items: [] };
  let currentOrder = null;

  // Load from localStorage
  try {
    cartStore = JSON.parse(localStorage.getItem('cartStore') || JSON.stringify(cartStore));
    currentOrder = JSON.parse(localStorage.getItem('currentOrder') || 'null');
  } catch (e) {
    cartStore = { owner: null, items: [] };
    currentOrder = null;
  }

  function saveCart() { localStorage.setItem('cartStore', JSON.stringify(cartStore)); }
  function saveOrder() { localStorage.setItem('currentOrder', JSON.stringify(currentOrder)); }

  // Public API to add items to the cart from other pages
  window.addToCart = function(item) {
    if (!item || !item.name) return false;
    const qty = parseInt(item.quantity || 1, 10) || 1;
    const price = parseFloat(item.price) || 0;
    const truck = item.truck || null;

    // If cart has an owner and it's different from current truck, confirm
    if (cartStore.owner && truck && cartStore.owner !== truck) {
      const ok = window.confirm('You are ordering from a different truck. This will clear your current cart. Continue?');
      if (!ok) return false;
      cartStore.items = [];
    }

    if (truck) cartStore.owner = truck;
    const existing = cartStore.items.find(i => i.name === item.name);
    if (existing) existing.quantity += qty;
    else cartStore.items.push({ name: item.name, price: price, quantity: qty });

    saveCart();
    updateCart();
    return true;
  };

  function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');
    const grandTotalAmount = document.querySelector('.grand-total-amount');
    const estimatedTimeEl = document.querySelector('.estimated-time');
    const cartCount = document.querySelector('.cart-count');

    // If there's an active order, show order status instead of cart items
    if (currentOrder && currentOrder.status === 'processing') {
      if (cartItems) {
        cartItems.innerHTML = `
          <div class="order-status-display">
            <p style="font-weight: 600; color: #22c55e; margin-bottom: 0.5rem;">✓ Order in Progress</p>
            <p style="color: #64748b; margin-bottom: 0.75rem;">Your order is being prepared.</p>
            <button class="track-btn" style="width: 100%; padding: 0.6rem; background: #22c55e; color: #fff; border: none; border-radius: 8px; cursor: pointer;">Track Order</button>
          </div>
        `;

        // Track button handler
        const trackBtn = cartItems.querySelector('.track-btn');
        if (trackBtn) {
          trackBtn.addEventListener('click', () => {
            window.location.href = 'track.html';
          });
        }
      }

      if (proceedBtn) proceedBtn.style.display = 'none';
      if (schedulePickup) schedulePickup.style.display = 'none';
      if (totalAmount) totalAmount.textContent = `L.E ${currentOrder.total.toFixed(2)}`;
      if (grandTotalAmount) grandTotalAmount.textContent = `L.E ${currentOrder.total.toFixed(2)}`;
      if (estimatedTimeEl) estimatedTimeEl.textContent = currentOrder.pickupTime ? new Date(currentOrder.pickupTime).toLocaleString() : 'ASAP';
      return;
    }

    // Normal cart display
    if (proceedBtn) proceedBtn.style.display = 'block';
    if (schedulePickup) schedulePickup.style.display = 'block';

    const totalQty = cartStore.items.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;

    if (cartItems) {
      cartItems.innerHTML = cartStore.items.map(item => `
        <div class="cart-item">
          <div class="item-info">
            <span class="cart-item-title">${item.quantity} x ${item.name}</span>
            <span class="cart-item-price">L.E ${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        </div>
      `).join('') || '<p class="muted">Your cart is empty.</p>';
    }

    const subtotal = cartStore.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    if (totalAmount) totalAmount.textContent = `L.E ${subtotal.toFixed(2)}`;
    if (grandTotalAmount) grandTotalAmount.textContent = `L.E ${subtotal.toFixed(2)}`;

    if (estimatedTimeEl) {
      const minMinutes = 10 + totalQty * 3;
      const maxMinutes = minMinutes + 10;
      estimatedTimeEl.textContent = totalQty > 0 ? `${minMinutes} - ${maxMinutes} min` : '--';
    }
  }

  // Proceed button click handler
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (cartStore.items.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const pickupTimeInput = document.getElementById('pickupTime');
      const pickupTime = pickupTimeInput ? pickupTimeInput.value : null;

      // Create order
      const total = cartStore.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      currentOrder = {
        truck: cartStore.owner,
        items: cartStore.items,
        total: total,
        pickupTime: pickupTime,
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      saveOrder();

      // Show success message
      alert('Order has been processed!');

      // Clear cart and update UI
      cartStore.items = [];
      cartStore.owner = null;
      saveCart();

      updateCart();
    });
  }

  // Toggle cart sidebar
  if (cartToggle) cartToggle.addEventListener('click', () => {
    if (cartSidebar) cartSidebar.classList.add('open');
    updateCart();
  });
  if (closeCart) closeCart.addEventListener('click', () => {
    if (cartSidebar) cartSidebar.classList.remove('open');
  });

  // Header brand dropdown toggle
  const brandToggle = document.querySelector('.brand-toggle');
  const brandMenu = document.querySelector('.brand-menu');
  if (brandToggle && brandMenu) {
    brandToggle.addEventListener('click', function(e){
      e.stopPropagation();
      brandMenu.classList.toggle('open');
    });
    document.addEventListener('click', function(){ brandMenu.classList.remove('open'); });
  }

  // Initialize
  updateCart();
});
