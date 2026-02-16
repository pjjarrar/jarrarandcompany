// Admin Portal JavaScript
const API_BASE = window.location.origin;

let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        // Verify token is still valid
        checkAuth();
    } else {
        showLoginPage();
    }
});

// Show login page
function showLoginPage() {
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('dashboard-page').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'block';
    // Restore user info if available
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        document.getElementById('admin-user-info').textContent = `Logged in as ${storedUsername}`;
    }
    loadBids();
    loadUsers();
}

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/api/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (response.ok) {
            showDashboard();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            showLoginPage();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        showLoginPage();
    }
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '';
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', data.user.username);
            document.getElementById('admin-user-info').textContent = `Logged in as ${data.user.username}`;
            showDashboard();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
});

// Logout handler
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    showLoginPage();
});

// Tab switching
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update buttons
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update content
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
    });
});

// Load bids
async function loadBids() {
    try {
        const response = await fetch(`${API_BASE}/api/bids`);
        const bids = await response.json();
        
        const tbody = document.getElementById('bids-table-body');
        if (bids.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No bids found</td></tr>';
            return;
        }
        
        tbody.innerHTML = bids.map(bid => {
            const date = new Date(bid.bid_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            const statusClass = bid.status === 'Active' ? 'active' : 'not-active';
            return `
                <tr>
                    <td>${escapeHtml(bid.title)}</td>
                    <td><span class="bid-status ${statusClass}">${escapeHtml(bid.status)}</span></td>
                    <td>${escapeHtml(bid.estimator_name)}</td>
                    <td>${date}</td>
                    <td>${formatTime(bid.bid_time)}</td>
                    <td class="admin-actions">
                        <button class="btn-icon edit-btn" data-id="${bid.id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${bid.id}" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners
        document.querySelectorAll('#bids-table-body .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editBid(btn.dataset.id));
        });
        document.querySelectorAll('#bids-table-body .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteBid(btn.dataset.id));
        });
    } catch (error) {
        console.error('Error loading bids:', error);
        document.getElementById('bids-table-body').innerHTML = 
            '<tr><td colspan="6" class="error">Error loading bids</td></tr>';
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const users = await response.json();
        
        const tbody = document.getElementById('users-table-body');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const date = new Date(user.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            return `
                <tr>
                    <td>${escapeHtml(user.username)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${date}</td>
                    <td class="admin-actions">
                        <button class="btn-icon edit-btn" data-id="${user.id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${user.id}" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners
        document.querySelectorAll('#users-table-body .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        document.querySelectorAll('#users-table-body .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="4" class="error">Error loading users</td></tr>';
    }
}

// Add bid button
document.getElementById('add-bid-btn').addEventListener('click', () => {
    document.getElementById('bid-modal-title').textContent = 'Add New Bid';
    document.getElementById('bid-form').reset();
    document.getElementById('bid-id').value = '';
    document.getElementById('bid-estimator-name').value = 'Moe Naeem';
    document.getElementById('bid-estimator-email').value = 'mnaeem@jarrarandcompany.com';
    document.getElementById('bid-error').textContent = '';
    document.getElementById('bid-modal').style.display = 'flex';
});

// Add user button
document.getElementById('add-user-btn').addEventListener('click', () => {
    document.getElementById('user-modal-title').textContent = 'Add New User';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('password-required').style.display = 'inline';
    document.getElementById('user-password').required = true;
    document.getElementById('user-error').textContent = '';
    document.getElementById('user-modal').style.display = 'flex';
});

// Close modals
document.getElementById('close-bid-modal').addEventListener('click', closeBidModal);
document.getElementById('cancel-bid-btn').addEventListener('click', closeBidModal);
document.getElementById('close-user-modal').addEventListener('click', closeUserModal);
document.getElementById('cancel-user-btn').addEventListener('click', closeUserModal);

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target.id === 'bid-modal') {
        closeBidModal();
    }
    if (e.target.id === 'user-modal') {
        closeUserModal();
    }
});

function closeBidModal() {
    document.getElementById('bid-modal').style.display = 'none';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Bid form handler
document.getElementById('bid-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('bid-error');
    errorDiv.textContent = '';
    
    const formData = {
        title: document.getElementById('bid-title').value,
        status: document.getElementById('bid-status').value,
        estimator_name: document.getElementById('bid-estimator-name').value,
        estimator_email: document.getElementById('bid-estimator-email').value,
        bid_date: document.getElementById('bid-date').value,
        bid_time: document.getElementById('bid-time').value,
        gc_name: document.getElementById('bid-gc').value,
        description: document.getElementById('bid-description').value
    };
    
    const bidId = document.getElementById('bid-id').value;
    const url = bidId ? `${API_BASE}/api/bids/${bidId}` : `${API_BASE}/api/bids`;
    const method = bidId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeBidModal();
            loadBids();
        } else {
            errorDiv.textContent = data.error || 'Failed to save bid';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
});

// User form handler
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('user-error');
    errorDiv.textContent = '';
    
    const formData = {
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value
    };
    
    const password = document.getElementById('user-password').value;
    if (password) {
        formData.password = password;
    }
    
    const userId = document.getElementById('user-id').value;
    const url = userId ? `${API_BASE}/api/users/${userId}` : `${API_BASE}/api/users`;
    const method = userId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeUserModal();
            loadUsers();
        } else {
            errorDiv.textContent = data.error || 'Failed to save user';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
});

// Edit bid
async function editBid(id) {
    try {
        const response = await fetch(`${API_BASE}/api/bids/${id}`);
        const bid = await response.json();
        
        document.getElementById('bid-modal-title').textContent = 'Edit Bid';
        document.getElementById('bid-id').value = bid.id;
        document.getElementById('bid-title').value = bid.title;
        document.getElementById('bid-status').value = bid.status;
        document.getElementById('bid-estimator-name').value = bid.estimator_name;
        document.getElementById('bid-estimator-email').value = bid.estimator_email;
        document.getElementById('bid-date').value = bid.bid_date;
        document.getElementById('bid-time').value = bid.bid_time;
        document.getElementById('bid-gc').value = bid.gc_name;
        document.getElementById('bid-description').value = bid.description || '';
        document.getElementById('bid-error').textContent = '';
        document.getElementById('bid-modal').style.display = 'flex';
    } catch (error) {
        alert('Error loading bid: ' + error.message);
    }
}

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/api/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const user = await response.json();
        
        document.getElementById('user-modal-title').textContent = 'Edit User';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = '';
        document.getElementById('password-required').style.display = 'none';
        document.getElementById('user-password').required = false;
        document.getElementById('user-error').textContent = '';
        document.getElementById('user-modal').style.display = 'flex';
    } catch (error) {
        alert('Error loading user: ' + error.message);
    }
}

// Delete bid
async function deleteBid(id) {
    if (!confirm('Are you sure you want to delete this bid?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/bids/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadBids();
        } else {
            const data = await response.json();
            alert('Error deleting bid: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error deleting bid: ' + error.message);
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const data = await response.json();
            alert('Error deleting user: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

// Format 24-hour time to 12-hour format
function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minutes} ${period}`;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

