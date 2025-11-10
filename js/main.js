// Food web interactive behaviors
document.addEventListener('DOMContentLoaded', function(){
  // Cart functionality
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  
  // Sample cart data
  let cart = [
    { name: 'Crunchy cashew', quantity: 2, price: 2.60 },
    { name: 'Coke', quantity: 1, price: 1.45 },
    { name: 'Fresh Meat', quantity: 2, price: 3.50 },
    { name: 'Veg Pizza', quantity: 2, price: 2.20 }
  ];
  
  function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');
    const grandTotalAmount = document.querySelector('.grand-total-amount');
    const cartCount = document.querySelector('.cart-count');
    
    // Update cart count
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Clear and rebuild cart items
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="item-info">
          <span>${item.quantity} x ${item.name}</span>
          <span>$${(item.quantity * item.price).toFixed(2)}</span>
        </div>
      </div>
    `).join('');
    
    // Update totals
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gst = subtotal * 0.12;
    totalAmount.textContent = `$${subtotal.toFixed(2)}`;
    grandTotalAmount.textContent = `$${(subtotal + gst).toFixed(2)}`;
  }
  
  // Toggle cart sidebar
  cartToggle.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    updateCart();
  });
  
  closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
  });
  
  // Initialize cart
  updateCart();
});
