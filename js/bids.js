// Bids Page JavaScript - Fetch and display bids from API
const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    loadBids();
});

async function loadBids() {
    const bidsGrid = document.getElementById('bids-grid');
    
    try {
        const response = await fetch(`${API_BASE}/api/bids`);
        
        if (!response.ok) {
            throw new Error('Failed to load bids');
        }
        
        const bids = await response.json();
        
        if (bids.length === 0) {
            bidsGrid.innerHTML = '<div class="no-bids-message">No active bids at this time. Please check back later.</div>';
            return;
        }
        
        // Filter to show only Active bids, or show all if needed
        const activeBids = bids.filter(bid => bid.status === 'Active');
        const bidsToShow = activeBids.length > 0 ? activeBids : bids;
        
        bidsGrid.innerHTML = bidsToShow.map(bid => {
            const date = formatDate(bid.bid_date);
            const statusClass = bid.status === 'Active' ? 'active' : 'not-active';
            const statusText = bid.status === 'Active' ? 'Active' : 'Not Active';
            
            return `
                <div class="bid-card">
                    <div class="bid-header">
                        <h3>${escapeHtml(bid.title)}</h3>
                        <span class="bid-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="bid-details">
                        <p><strong>Estimator:</strong> ${escapeHtml(bid.estimator_name)}</p>
                        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(bid.estimator_email)}">${escapeHtml(bid.estimator_email)}</a></p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${escapeHtml(bid.bid_time)}</p>
                        <p><strong>G.C.:</strong> ${escapeHtml(bid.gc_name)}</p>
                    </div>
                    ${bid.description ? `
                    <div class="bid-description">
                        <p>${escapeHtml(bid.description)}</p>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading bids:', error);
        bidsGrid.innerHTML = `
            <div class="error-message-box">
                <p>Unable to load bids at this time. Please try again later.</p>
                <p>For a quote please contact our Estimating Department at <a href="tel:+18324674750">(832) 467-4750</a></p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        // Format as MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    } catch (error) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

