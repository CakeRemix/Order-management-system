// Food web interactive behaviors and a shared cart API using jQuery
$(document).ready(function(){
  const cartToggle = $('#cartToggle');
  const cartSidebar = $('#cartSidebar');
  const closeCart = $('#closeCart');
  const proceedBtn = $('#proceedBtn');
  const schedulePickup = $('#schedulePickup');

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
    const cartItems = $('.cart-items');
    const totalAmount = $('.total-amount');
    const grandTotalAmount = $('.grand-total-amount');
    const estimatedTimeEl = $('.estimated-time');
    const cartCount = $('.cart-count');

    // If there's an active order, show order status instead of cart items
    if (currentOrder && currentOrder.status === 'processing') {
      if (cartItems.length) {
        cartItems.html(`
          <div class="order-status-display">
            <p style="font-weight: 600; color: #22c55e; margin-bottom: 0.5rem;">✓ Order in Progress</p>
            <p style="color: #64748b; margin-bottom: 0.75rem;">Your order is being prepared.</p>
            <button class="track-btn" style="width: 100%; padding: 0.6rem; background: #22c55e; color: #fff; border: none; border-radius: 8px; cursor: pointer;">Track Order</button>
          </div>
        `);

        // Track button handler using jQuery
        cartItems.find('.track-btn').on('click', function() {
          window.location.href = 'track.html';
        });
      }

      proceedBtn.hide();
      schedulePickup.hide();
      totalAmount.text(`L.E ${currentOrder.total.toFixed(2)}`);
      grandTotalAmount.text(`L.E ${currentOrder.total.toFixed(2)}`);
      estimatedTimeEl.text(currentOrder.pickupTime ? new Date(currentOrder.pickupTime).toLocaleString() : 'ASAP');
      return;
    }

    // Normal cart display
    proceedBtn.show();
    schedulePickup.show();

    const totalQty = cartStore.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.text(totalQty);

    if (cartItems.length) {
      const cartHTML = cartStore.items.map(item => `
        <div class="cart-item">
          <div class="item-info">
            <span class="cart-item-title">${item.quantity} x ${item.name}</span>
            <span class="cart-item-price">L.E ${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        </div>
      `).join('') || '<p class="muted">Your cart is empty.</p>';
      cartItems.html(cartHTML);
    }

    const subtotal = cartStore.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    totalAmount.text(`L.E ${subtotal.toFixed(2)}`);
    grandTotalAmount.text(`L.E ${subtotal.toFixed(2)}`);

    const minMinutes = 10 + totalQty * 3;
    const maxMinutes = minMinutes + 10;
    estimatedTimeEl.text(totalQty > 0 ? `${minMinutes} - ${maxMinutes} min` : '--');
  }

  // Proceed button click handler using jQuery
  proceedBtn.on('click', function() {
    if (cartStore.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const pickupTime = $('#pickupTime').val() || null;

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

  // Toggle cart sidebar using jQuery
  cartToggle.on('click', function() {
    cartSidebar.addClass('open');
    updateCart();
  });
  
  closeCart.on('click', function() {
    cartSidebar.removeClass('open');
  });

  // Header brand dropdown toggle using jQuery
  const brandToggle = $('.brand-toggle');
  const brandMenu = $('.brand-menu');
  if (brandToggle.length && brandMenu.length) {
    brandToggle.on('click', function(e){
      e.stopPropagation();
      brandMenu.toggleClass('open');
    });
    $(document).on('click', function(){ 
      brandMenu.removeClass('open'); 
    });
  }

  // Initialize
  updateCart();
});
