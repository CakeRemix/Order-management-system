// Food web interactive behaviors and a shared cart API
document.addEventListener('DOMContentLoaded', function(){
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  const proceedBtn = document.getElementById('proceedBtn');
  const schedulePickup = document.getElementById('schedulePickup');

  // Order structure: { truck, items, total, pickupTime, status, createdAt }
  // Cart structure: { owner: null|string, truckId: null|number, items: [ {name,price,quantity,itemId} ] }
  let cartStore = { owner: null, truckId: null, items: [] };
  let currentOrder = null;

  // Load from localStorage
  try {
    cartStore = JSON.parse(localStorage.getItem('cartStore') || JSON.stringify(cartStore));
    currentOrder = JSON.parse(localStorage.getItem('currentOrder') || 'null');
  } catch (e) {
    cartStore = { owner: null, truckId: null, items: [] };
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
    if (truckId) cartStore.truckId = truckId;
    
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
    proceedBtn.addEventListener('click', async () => {
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
      const userId = user.userid || user.userId;

      if (!userId) {
        alert('User information is incomplete. Please log in again.');
        window.location.href = 'login.html';
        return;
      }

      if (!cartStore.truckId) {
        alert('Truck information is missing. Please add items to cart again.');
        return;
      }

      const pickupTimeInput = document.getElementById('pickupTime');
      const pickupTime = pickupTimeInput ? pickupTimeInput.value : null;

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
        proceedBtn.disabled = true;
        proceedBtn.textContent = 'Processing...';

        // Send order to backend
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
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
        alert('Failed to place order: ' + error.message);
      } finally {
        // Reset button state
        proceedBtn.disabled = false;
        proceedBtn.textContent = 'Proceed to Checkout';
      }
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
