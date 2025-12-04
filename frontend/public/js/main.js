// Food web interactive behaviors and a shared cart API using jQuery
$(document).ready(function(){
  const cartToggle = $('#cartToggle');
  const cartSidebar = $('#cartSidebar');
  const closeCart = $('#closeCart');
  const proceedBtn = $('#proceedBtn');
  const schedulePickup = $('#schedulePickup');

  // Get current user ID for user-specific storage keys
  function getCurrentUserId() {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.id || user.userid || user.userId || null;
      }
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
    return null;
  }

  // Generate user-specific storage keys
  function getCartKey() {
    const userId = getCurrentUserId();
    return userId ? `cartStore_${userId}` : 'cartStore_guest';
  }

  function getOrderKey() {
    const userId = getCurrentUserId();
    return userId ? `currentOrder_${userId}` : 'currentOrder_guest';
  }

  // Order structure: { truck, items, total, pickupTime, status, createdAt }
  // Cart structure: { owner: null|string, truckId: null|number, items: [ {name,price,quantity,itemId} ] }
  let cartStore = { owner: null, truckId: null, items: [] };
  let currentOrder = null;

  // Load from localStorage using user-specific keys
  function loadUserCart() {
    try {
      cartStore = JSON.parse(localStorage.getItem(getCartKey()) || JSON.stringify({ owner: null, truckId: null, items: [] }));
      currentOrder = JSON.parse(localStorage.getItem(getOrderKey()) || 'null');
    } catch (e) {
      cartStore = { owner: null, truckId: null, items: [] };
      currentOrder = null;
    }
  }

  // Initial load
  loadUserCart();

  function saveCart() { localStorage.setItem(getCartKey(), JSON.stringify(cartStore)); }
  function saveOrder() { localStorage.setItem(getOrderKey(), JSON.stringify(currentOrder)); }

  // Expose reload function for when user logs in/out
  window.reloadUserCart = function() {
    loadUserCart();
    updateCart();
  };

  // Public API to add items to the cart from other pages
  window.addToCart = function(item) {
    if (!item || !item.name) return false;
    const qty = parseInt(item.quantity || 1, 10) || 1;
    const price = parseFloat(item.price) || 0;
    const truck = item.truck || null;
    const truckId = item.truckId || null;
    const itemId = item.itemId || null;

    // If cart has an owner and it's different from current truck, confirm
    if (cartStore.owner && truck && cartStore.owner !== truck) {
      const ok = window.confirm('You are ordering from a different truck. This will clear your current cart. Continue?');
      if (!ok) return false;
      cartStore.items = [];
      cartStore.truckId = null;
    }

    if (truck) cartStore.owner = truck;
    if (truckId) {
      cartStore.truckId = truckId;
      console.log('Setting truckId in cart:', truckId);
    }
    
    const existing = cartStore.items.find(i => i.name === item.name);
    if (existing) {
      existing.quantity += qty;
    } else {
      cartStore.items.push({ 
        name: item.name, 
        price: price, 
        quantity: qty,
        itemId: itemId
      });
    }

    saveCart();
    console.log('Cart saved:', JSON.stringify(cartStore));
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
  proceedBtn.on('click', async function() {
    if (cartStore.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      alert('Please log in to place an order');
      window.location.href = 'login.html';
      return;
    }

    const user = JSON.parse(userInfo);
    const userId = user.id || user.userid || user.userId;

    if (!userId) {
      alert('User information is incomplete. Please log in again.');
      window.location.href = 'login.html';
      return;
    }

    if (!cartStore.truckId) {
      console.error('Missing truckId. Cart state:', JSON.stringify(cartStore));
      alert('Truck information is missing. Please add items to cart again.');
      return;
    }
    
    console.log('Order proceeding with truckId:', cartStore.truckId);

    const pickupTime = $('#pickupTime').val() || null;

    // Prepare order data for backend
    const orderData = {
      userId: userId,
      truckId: cartStore.truckId,
      items: cartStore.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      scheduledPickupTime: pickupTime
    };

    try {
      // Show loading state
      proceedBtn.prop('disabled', true);
      proceedBtn.text('Processing...');

      // Send order to backend using jQuery AJAX
      const result = await $.ajax({
        url: 'http://localhost:5000/api/orders',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData)
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      // Store order info locally for tracking
      const total = cartStore.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      currentOrder = {
        orderId: result.data.orderId,
        truck: cartStore.owner,
        truckId: cartStore.truckId,
        items: cartStore.items,
        total: total,
        pickupTime: result.data.scheduledPickupTime,
        status: 'processing',
        createdAt: result.data.createdAt
      };

      saveOrder();

      // Show success message
      alert('Order placed successfully! Order ID: ' + result.data.orderId);

      // Clear cart and update UI
      cartStore.items = [];
      cartStore.owner = null;
      cartStore.truckId = null;
      saveCart();

      updateCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order: ' + (error.responseJSON?.message || error.message));
    } finally {
      // Reset button state
      proceedBtn.prop('disabled', false);
      proceedBtn.text('Proceed to Checkout');
    }
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
