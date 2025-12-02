// Vendor Dashboard JavaScript
const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let currentTruck = null;
let menuItems = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initializeNavigation();
    initializeEventListeners();
    loadDashboardData();
});

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
            
            tbody.innerHTML = recentOrders.map(order => {
                const orderDate = new Date(order.createdat);
                const now = new Date();
                const diffMs = now - orderDate;
                const diffMins = Math.floor(diffMs / 60000);
                const timeAgo = diffMins < 60 ? `${diffMins} min ago` : 
                               diffMins < 1440 ? `${Math.floor(diffMins / 60)} hours ago` : 
                               `${Math.floor(diffMins / 1440)} days ago`;
                
                return `
                    <tr>
                        <td><strong>#${order.orderid}</strong></td>
                        <td>Customer ${order.userid}</td>
                        <td>-</td>
                        <td>EGP ${order.totalprice}</td>
                        <td><span class="status-badge status-${order.orderstatus}">${order.orderstatus}</span></td>
                        <td>${timeAgo}</td>
                        <td>
                            <button class="btn-icon" onclick="viewOrder(${order.orderid})">
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No orders yet</td></tr>';
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
                        <img src="${item.image || './images/placeholder.jpg'}" alt="${item.name}">
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
    const grid = document.getElementById('ordersGrid');
    grid.innerHTML = '<div class="loading-message">Loading all orders...</div>';
    
    // Placeholder - implement actual API call
    setTimeout(() => {
        grid.innerHTML = '<div class="empty-state">No orders found</div>';
    }, 500);
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
            document.getElementById('itemImage').value = item.image || '';
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
        image: document.getElementById('itemImage').value || null,
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
            alert(`Busy mode ${isBusy ? 'enabled' : 'disabled'}`);
        }
    } catch (error) {
        console.error('Error toggling busy mode:', error);
        alert('Failed to toggle busy mode');
    }
}

// Filter orders
function filterOrders(status) {
    console.log('Filtering orders by:', status);
    // Implement order filtering logic
}

// Edit menu item
function editMenuItem(itemId) {
    console.log('Editing item:', itemId);
    openMenuItemModal(itemId);
}

// Delete menu item
async function deleteMenuItem(itemId) {
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
async function toggleItemAvailability(itemId, currentStatus) {
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
function viewOrder(orderId) {
    alert('View order: ' + orderId);
    // Implement order detail view
}

// Update order status
function updateOrderStatus(orderId) {
    alert('Update status for: ' + orderId);
    // Implement order status update
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}
