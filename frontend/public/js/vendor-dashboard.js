// Vendor Dashboard JavaScript
const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let currentTruck = null;
let menuItems = [];
let orderPollingInterval = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initializeNavigation();
    initializeEventListeners();
    loadDashboardData();
    startOrderPolling();
    initializeKeyboardShortcuts();
});

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R: Refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshOrders();
        }
        
        // Ctrl/Cmd + M: Add Menu Item
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            openMenuItemModal();
        }
        
        // Ctrl/Cmd + O: Go to Orders
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            document.querySelector('a[href="#orders"]').click();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            closeOrderModal();
            const menuModal = document.getElementById('menuItemModal');
            if (menuModal && menuModal.style.display === 'flex') {
                menuModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
}

// Check if user is authenticated and is a truck owner
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        currentUser = data.user;

        // Check if user is a truck owner
        if (currentUser.role !== 'truckOwner') {
            alert('Access denied. This page is for vendors only.');
            window.location.href = 'dashboard.html';
            return;
        }

        // Update UI with user info
        document.getElementById('vendorName').textContent = currentUser.name;
        
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            document.querySelectorAll('.vendor-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
            
            // Load section data
            loadSectionData(targetId);
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Quick actions
    document.getElementById('addMenuItem').addEventListener('click', () => openMenuItemModal());
    document.getElementById('addMenuItemBtn').addEventListener('click', () => openMenuItemModal());
    document.getElementById('toggleBusyMode').addEventListener('click', toggleBusyMode);
    document.getElementById('manageOrders').addEventListener('click', () => {
        document.querySelector('a[href="#orders"]').click();
    });
    
    // Modal
    const modal = document.getElementById('menuItemModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Menu item form
    document.getElementById('menuItemForm').addEventListener('submit', handleMenuItemSubmit);
    
    // Truck info form
    document.getElementById('truckInfoForm').addEventListener('submit', handleTruckInfoSubmit);
    
    // Status toggles
    document.getElementById('busyMode').addEventListener('change', handleBusyModeToggle);
    
    // Order filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const status = e.target.dataset.status;
            filterOrders(status);
        });
    });
}

// Load dashboard data
async function loadDashboardData() {
    await loadTruckInfo();
    await loadStatistics();
    await loadRecentOrders();
}

// Load truck information
async function loadTruckInfo() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentTruck = data.truck;
            document.getElementById('truckName').textContent = currentTruck.truckname || 'Your Truck';
            
            // Set busy mode checkbox based on truck status
            const busyModeCheckbox = document.getElementById('busyMode');
            if (busyModeCheckbox) {
                busyModeCheckbox.checked = currentTruck.truckstatus === 'unavailable';
            }
            
            // Populate settings form
            if (document.getElementById('truckNameInput')) {
                document.getElementById('truckNameInput').value = currentTruck.truckname || '';
                document.getElementById('truckDescription').value = currentTruck.description || '';
            }
        }
    } catch (error) {
        console.error('Error loading truck info:', error);
    }
}

// Load statistics
async function loadStatistics() {
    const token = localStorage.getItem('token');
    
    try {
        // Load menu items count
        const menuResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            const menuCount = menuData.menuItems ? menuData.menuItems.length : 0;
            document.getElementById('menuItemsCount').textContent = menuCount;
        } else {
            document.getElementById('menuItemsCount').textContent = '0';
        }
        
        // Load orders statistics
        const ordersResponse = await fetch(`${API_BASE_URL}/vendor/my-truck/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            const orders = ordersData.orders || [];
            
            // Calculate today's orders
            const today = new Date().toDateString();
            const todayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdat || order.scheduledat).toDateString();
                return orderDate === today;
            });
            
            // Calculate pending orders
            const pendingOrders = orders.filter(order => 
                order.orderstatus === 'pending' || order.orderstatus === 'preparing'
            );
            
            document.getElementById('todayOrders').textContent = todayOrders.length;
            document.getElementById('pendingOrders').textContent = pendingOrders.length;
        } else {
            document.getElementById('todayOrders').textContent = '0';
            document.getElementById('pendingOrders').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        document.getElementById('todayOrders').textContent = '0';
        document.getElementById('menuItemsCount').textContent = '0';
        document.getElementById('pendingOrders').textContent = '0';
    }
}

// Load recent orders
async function loadRecentOrders() {
    const token = localStorage.getItem('token');
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const orders = data.orders || [];
            
            // Get only recent orders (last 5)
            const recentOrders = orders.slice(0, 5);
            
            if (recentOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No orders yet</td></tr>';
                return;
            }
            
            // Fetch detailed information for recent orders
            const detailedOrders = await Promise.all(
                recentOrders.map(async (order) => {
                    try {
                        const detailResponse = await fetch(`${API_BASE_URL}/orders/${order.orderid}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (detailResponse.ok) {
                            const detailData = await detailResponse.json();
                            return { ...order, details: detailData.data };
                        }
                        return { ...order, details: null };
                    } catch (error) {
                        return { ...order, details: null };
                    }
                })
            );
            
            tbody.innerHTML = detailedOrders.map(order => {
                const orderDate = new Date(order.createdat);
                const now = new Date();
                const diffMs = now - orderDate;
                const diffMins = Math.floor(diffMs / 60000);
                const timeAgo = diffMins < 60 ? `${diffMins} min ago` : 
                               diffMins < 1440 ? `${Math.floor(diffMins / 60)} hours ago` : 
                               `${Math.floor(diffMins / 1440)} days ago`;
                
                const itemsCount = order.details?.items?.length || 0;
                const itemsText = itemsCount === 1 ? '1 item' : `${itemsCount} items`;
                
                return `
                    <tr>
                        <td><strong>#${order.orderid}</strong></td>
                        <td>${order.details?.customerName || `Customer ${order.userid}`}</td>
                        <td>${itemsText}</td>
                        <td>EGP ${parseFloat(order.totalprice).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.orderstatus}">${order.orderstatus}</span></td>
                        <td>${timeAgo}</td>
                        <td>
                            <button class="btn-icon" onclick="viewOrder(${order.orderid})" title="View Details">
                                <span class="material-icons">visibility</span>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No orders yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Error loading orders</td></tr>';
    }
}

// Load section data based on which section is active
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'menu':
            loadMenuItems();
            break;
        case 'orders':
            loadAllOrders();
            break;
        case 'settings':
            // Settings already loaded with truck info
            break;
        default:
            loadDashboardData();
    }
}

// Load menu items
async function loadMenuItems() {
    const grid = document.getElementById('menuItemsGrid');
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            menuItems = data.menuItems || [];
            
            if (menuItems.length === 0) {
                grid.innerHTML = '<div class="empty-state">No menu items yet. Click "Add New Item" to get started!</div>';
                return;
            }
            
            grid.innerHTML = menuItems.map(item => `
                <div class="menu-item-card">
                    <div class="menu-item-image">
                        <img src="${item.image_url || './images/images (3).jpeg'}" alt="${item.name}">
                        <span class="availability-badge ${item.isavailable ? 'available' : 'unavailable'}">
                            ${item.isavailable ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <div class="menu-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'No description'}</p>
                        <div class="menu-item-footer">
                            <span class="price">EGP ${item.price}</span>
                            <div class="item-actions">
                                <button class="btn-icon" onclick="editMenuItem(${item.itemid})">
                                    <span class="material-icons">edit</span>
                                </button>
                                <button class="btn-icon" onclick="deleteMenuItem(${item.itemid})">
                                    <span class="material-icons">delete</span>
                                </button>
                                <button class="btn-icon" onclick="toggleItemAvailability(${item.itemid}, ${item.isavailable})">
                                    <span class="material-icons">${item.isavailable ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        grid.innerHTML = '<div class="error-message">Failed to load menu items</div>';
    }
}

// Load all orders
async function loadAllOrders() {
    const tbody = document.querySelector('#ordersGrid tbody');
    const token = localStorage.getItem('token');
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">Loading orders...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const orders = data.orders || [];
            
            // Get current filter
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.status || 'all';
            const filteredOrders = activeFilter === 'all' 
                ? orders 
                : orders.filter(order => order.orderstatus === activeFilter);
            
            if (filteredOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">No orders found</td></tr>';
                return;
            }
            
            // Fetch order details for each order (to get items)
            const detailedOrders = await Promise.all(
                filteredOrders.map(async (order) => {
                    try {
                        const detailResponse = await fetch(`${API_BASE_URL}/orders/${order.orderid}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (detailResponse.ok) {
                            const detailData = await detailResponse.json();
                            return { ...order, details: detailData.data };
                        }
                        return { ...order, details: null };
                    } catch (error) {
                        console.error(`Error fetching details for order ${order.orderid}:`, error);
                        return { ...order, details: null };
                    }
                })
            );
            
            tbody.innerHTML = detailedOrders.map(order => {
                const orderDate = new Date(order.createdat);
                const now = new Date();
                const diffMs = now - orderDate;
                const diffMins = Math.floor(diffMs / 60000);
                const timeAgo = diffMins < 60 ? `${diffMins} min ago` : 
                               diffMins < 1440 ? `${Math.floor(diffMins / 60)} hours ago` : 
                               `${Math.floor(diffMins / 1440)} days ago`;
                
                const itemsDisplay = order.details?.items 
                    ? order.details.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
                    : 'Loading...';
                
                const itemsCount = order.details?.items?.length || 0;
                const itemsText = itemsCount === 1 ? '1 item' : `${itemsCount} items`;
                
                return `
                    <tr data-order-id="${order.orderid}" data-status="${order.orderstatus}">
                        <td><strong>#${order.orderid}</strong></td>
                        <td>${order.details?.customerName || `Customer ${order.userid}`}</td>
                        <td title="${itemsDisplay}">${itemsText}</td>
                        <td>EGP ${parseFloat(order.totalprice).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.orderstatus}">${order.orderstatus}</span></td>
                        <td>${timeAgo}</td>
                        <td>
                            <div class="action-buttons-group">
                                <button class="btn-icon" onclick="viewOrderDetails(${order.orderid})" title="View Details">
                                    <span class="material-icons">visibility</span>
                                </button>
                                ${order.orderstatus === 'pending' ? `
                                    <button class="btn-icon btn-success" onclick="updateOrderStatusUI(${order.orderid}, 'confirmed')" title="Confirm Order">
                                        <span class="material-icons">check_circle</span>
                                    </button>
                                ` : ''}
                                ${order.orderstatus === 'confirmed' ? `
                                    <button class="btn-icon btn-warning" onclick="updateOrderStatusUI(${order.orderid}, 'ready')" title="Mark Ready">
                                        <span class="material-icons">restaurant</span>
                                    </button>
                                ` : ''}
                                ${order.orderstatus === 'ready' ? `
                                    <button class="btn-icon btn-primary" onclick="updateOrderStatusUI(${order.orderid}, 'completed')" title="Mark Completed">
                                        <span class="material-icons">done_all</span>
                                    </button>
                                ` : ''}
                                ${(order.orderstatus === 'pending' || order.orderstatus === 'confirmed') ? `
                                    <button class="btn-icon btn-danger" onclick="updateOrderStatusUI(${order.orderid}, 'cancelled')" title="Cancel Order">
                                        <span class="material-icons">cancel</span>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">Failed to load orders</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">Error loading orders</td></tr>';
    }
}

// Store current item ID for editing
let currentEditingItemId = null;

// Open menu item modal
function openMenuItemModal(itemId = null) {
    const modal = document.getElementById('menuItemModal');
    const form = document.getElementById('menuItemForm');
    
    currentEditingItemId = itemId;
    form.reset();
    
    // If editing, populate the form with existing data
    if (itemId) {
        const item = menuItems.find(i => i.itemid === itemId);
        if (item) {
            document.getElementById('itemName').value = item.name || '';
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemPrice').value = item.price || '';
            document.getElementById('itemAvailable').checked = item.isavailable !== false;
        }
    }
    
    document.getElementById('modalTitle').textContent = itemId ? 'Edit Menu Item' : 'Add Menu Item';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Handle menu item form submission
async function handleMenuItemSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const itemData = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        isavailable: document.getElementById('itemAvailable').checked
    };
    
    try {
        // Determine if adding or editing
        const isEditing = currentEditingItemId !== null;
        const url = isEditing 
            ? `${API_BASE_URL}/vendor/my-truck/menu/${currentEditingItemId}`
            : `${API_BASE_URL}/vendor/my-truck/menu`;
        const method = isEditing ? 'PATCH' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            alert(isEditing ? 'Menu item updated successfully!' : 'Menu item added successfully!');
            document.getElementById('menuItemModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            currentEditingItemId = null;
            loadMenuItems();
            loadStatistics(); // Refresh statistics
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to save menu item'));
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Failed to save menu item: ' + error.message);
    }
}

// Handle truck info form submission
async function handleTruckInfoSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const truckData = {
        truckname: document.getElementById('truckNameInput').value,
        description: document.getElementById('truckDescription').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(truckData)
        });
        
        if (response.ok) {
            alert('Truck information updated successfully!');
            loadTruckInfo();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error updating truck info:', error);
        alert('Failed to update truck information');
    }
}

// Toggle busy mode (OMS-62)
function toggleBusyMode() {
    const checkbox = document.getElementById('busyMode');
    checkbox.checked = !checkbox.checked;
    handleBusyModeToggle();
}

// Handle busy mode toggle
async function handleBusyModeToggle() {
    const token = localStorage.getItem('token');
    const isBusy = document.getElementById('busyMode').checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/busy-mode`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ busy: isBusy })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Update current truck status
            if (currentTruck) {
                currentTruck.truckstatus = data.status;
            }
            alert(`Busy mode ${isBusy ? 'enabled' : 'disabled'}`);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to toggle busy mode');
        }
    } catch (error) {
        console.error('Error toggling busy mode:', error);
        alert('Failed to toggle busy mode: ' + error.message);
        // Revert checkbox state on error
        document.getElementById('busyMode').checked = !isBusy;
    }
}

// Filter orders
function filterOrders(status) {
    console.log('Filtering orders by:', status);
    loadAllOrders(); // Reload orders with new filter
}

// Edit menu item
// Make globally accessible for inline onclick handlers
window.editMenuItem = function editMenuItem(itemId) {
    console.log('Editing item:', itemId);
    openMenuItemModal(itemId);
}

// Delete menu item
// Make globally accessible for inline onclick handlers
window.deleteMenuItem = async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Menu item deleted successfully!');
            loadMenuItems();
            loadStatistics(); // Refresh statistics
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item');
    }
}

// Toggle item availability
// Make globally accessible for inline onclick handlers
window.toggleItemAvailability = async function toggleItemAvailability(itemId, currentStatus) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/trucks/my-truck/menu/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isavailable: !currentStatus })
        });
        
        if (response.ok) {
            loadMenuItems();
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
        alert('Failed to update availability');
    }
}

// View order details
// Make globally accessible for inline onclick handlers
window.viewOrder = function viewOrder(orderId) {
    viewOrderDetails(orderId);
};

// View detailed order information
// Make globally accessible for inline onclick handlers
window.viewOrderDetails = async function viewOrderDetails(orderId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const order = data.data;
            
            // Create modal HTML for order details
            const itemsList = order.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span><strong>${item.name}</strong> x${item.quantity}</span>
                    <span>EGP ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
            
            const pickupTime = order.scheduledPickupTime 
                ? new Date(order.scheduledPickupTime).toLocaleString() 
                : 'Not scheduled';
            
            const modalContent = `
                <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="margin: 0;">Order #${order.orderId}</h2>
                        <button onclick="closeOrderModal()" style="background: none; border: none; cursor: pointer; font-size: 1.5rem; color: #666;">✕</button>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <span class="status-badge status-${order.orderStatus}" style="font-size: 0.9rem; padding: 0.4rem 1rem;">
                            ${order.orderStatus.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Customer Information</h3>
                        <p style="margin: 0.25rem 0;"><strong>Name:</strong> ${order.customerName}</p>
                        <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${order.email}</p>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Order Details</h3>
                        <p style="margin: 0.25rem 0;"><strong>Truck:</strong> ${order.truckName}</p>
                        <p style="margin: 0.25rem 0;"><strong>Pickup Time:</strong> ${pickupTime}</p>
                        <p style="margin: 0.25rem 0;"><strong>Order Placed:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">Order Items</h3>
                        ${itemsList}
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-weight: bold; font-size: 1.1rem;">
                            <span>Total</span>
                            <span>EGP ${parseFloat(order.totalPrice).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        ${order.orderStatus === 'pending' ? `
                            <button onclick="updateOrderStatusUI(${orderId}, 'confirmed'); closeOrderModal();" 
                                    style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                Confirm Order
                            </button>
                        ` : ''}
                        ${order.orderStatus === 'confirmed' ? `
                            <button onclick="updateOrderStatusUI(${orderId}, 'ready'); closeOrderModal();" 
                                    style="padding: 0.75rem 1.5rem; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                Mark as Ready
                            </button>
                        ` : ''}
                        ${order.orderStatus === 'ready' ? `
                            <button onclick="updateOrderStatusUI(${orderId}, 'completed'); closeOrderModal();" 
                                    style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                Mark as Completed
                            </button>
                        ` : ''}
                        ${(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') ? `
                            <button onclick="updateOrderStatusUI(${orderId}, 'cancelled'); closeOrderModal();" 
                                    style="padding: 0.75rem 1.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                Cancel Order
                            </button>
                        ` : ''}
                        <button onclick="closeOrderModal()" 
                                style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            // Create and show modal
            let modal = document.getElementById('orderDetailsModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'orderDetailsModal';
                modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = modalContent;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
        } else {
            alert('Failed to load order details');
        }
    } catch (error) {
        console.error('Error viewing order details:', error);
        alert('Failed to load order details');
    }
}

// Close order details modal
// Make globally accessible for inline onclick handlers
window.closeOrderModal = function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Update order status with UI feedback
// Make globally accessible for inline onclick handlers
window.updateOrderStatusUI = async function updateOrderStatusUI(orderId, newStatus) {
    const token = localStorage.getItem('token');
    
    // Confirmation messages
    const confirmMessages = {
        'confirmed': 'Confirm this order?',
        'ready': 'Mark this order as ready for pickup?',
        'completed': 'Mark this order as completed?',
        'cancelled': 'Cancel this order? This action cannot be undone.'
    };
    
    if (!confirm(confirmMessages[newStatus] || 'Update order status?')) {
        return;
    }
    
    try {
        console.log('📤 Updating order status:', { orderId, newStatus, token: token ? 'Present' : 'Missing' });
        
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        console.log('📥 Response status:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Order updated successfully:', data);
            
            // Show success message with timing info for confirmed orders
            let successMessage = `Order #${orderId} ${newStatus} successfully!`;
            if (newStatus === 'confirmed' && data.data?.estimatedPreparationMinutes) {
                const minutes = data.data.estimatedPreparationMinutes;
                const pickupTime = new Date(data.data.scheduledPickupTime);
                const timeString = pickupTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                successMessage = `Order #${orderId} confirmed! Ready in ${minutes} minutes (by ${timeString})`;
            }
            
            showNotification(successMessage, 'success');
            
            // Reload orders to reflect changes
            const activeSection = document.querySelector('.vendor-section.active');
            if (activeSection?.id === 'orders') {
                loadAllOrders();
            } else {
                loadRecentOrders();
            }
            
            // Reload statistics
            loadStatistics();
        } else {
            const error = await response.json();
            console.error('❌ Server error:', error);
            throw new Error(error.message || `Server returned ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error updating order status:', {
            orderId,
            newStatus,
            error: error.message,
            stack: error.stack
        });
        
        let errorMessage = 'Failed to update order status';
        
        // Provide more specific error messages
        if (error.message.includes('401') || error.message.includes('Authentication')) {
            errorMessage = 'Authentication failed. Please login again.';
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            errorMessage = 'Access denied. You can only update orders for your own truck.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Order not found or has been deleted.';
        } else {
            errorMessage = error.message || 'Failed to update order status';
        }
        
        showNotification(errorMessage, 'error');
    }
}

// Show notification (toast message)
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('notification-toast');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10001;
        font-weight: 600;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notification
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .action-buttons-group {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .btn-success {
            color: #28a745 !important;
        }
        .btn-warning {
            color: #ff9800 !important;
        }
        .btn-primary {
            color: #007bff !important;
        }
        .btn-danger {
            color: #dc3545 !important;
        }
    `;
    document.head.appendChild(style);
}

// Track previous order count for new order detection
let previousOrderCount = 0;

// Start polling for new orders (real-time updates)
function startOrderPolling() {
    // Poll every 10 seconds for new orders
    orderPollingInterval = setInterval(async () => {
        const activeSection = document.querySelector('.vendor-section.active');
        
        // Check for new orders
        await checkForNewOrders();
        
        // Only refresh if we're on overview or orders section
        if (activeSection?.id === 'overview') {
            await loadRecentOrders();
            await loadStatistics();
        } else if (activeSection?.id === 'orders') {
            await loadAllOrders();
            await loadStatistics();
        }
    }, 10000); // 10 seconds
}

// Check for new orders and notify
async function checkForNewOrders() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/my-truck/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const orders = data.orders || [];
            const pendingOrders = orders.filter(order => order.orderstatus === 'pending');
            const currentCount = pendingOrders.length;
            
            // Check if there are new orders
            if (previousOrderCount > 0 && currentCount > previousOrderCount) {
                const newOrdersCount = currentCount - previousOrderCount;
                showNotification(`🔔 ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`, 'success');
                playNotificationSound();
            }
            
            previousOrderCount = currentCount;
            
            // Update badge in navigation
            updateOrderBadge(currentCount);
        }
    } catch (error) {
        console.error('Error checking for new orders:', error);
    }
}

// Update order badge count in navigation
function updateOrderBadge(count) {
    const ordersNavLink = document.querySelector('a[href="#orders"]');
    if (!ordersNavLink) return;
    
    // Remove existing badge
    const existingBadge = ordersNavLink.querySelector('.order-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if count > 0
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'order-badge';
        badge.textContent = count;
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
        `;
        ordersNavLink.style.position = 'relative';
        ordersNavLink.appendChild(badge);
    }
}

// Play notification sound for new orders
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio notification not available:', error);
    }
}

// Stop polling when leaving the page
window.addEventListener('beforeunload', () => {
    if (orderPollingInterval) {
        clearInterval(orderPollingInterval);
    }
});

// Manual refresh function
// Make globally accessible for inline onclick handlers
window.refreshOrders = function refreshOrders() {
    const activeSection = document.querySelector('.vendor-section.active');
    if (activeSection?.id === 'orders') {
        showNotification('Refreshing orders...', 'info');
        loadAllOrders();
    } else {
        showNotification('Refreshing dashboard...', 'info');
        loadDashboardData();
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Stop polling
        if (orderPollingInterval) {
            clearInterval(orderPollingInterval);
        }
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}
