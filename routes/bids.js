const express = require('express');
const authenticateToken = require('../auth');
const {
    getAllBids,
    getBidById,
    createBid,
    updateBid,
    deleteBid
} = require('../database');

const router = express.Router();

// GET all bids (public)
router.get('/', async (req, res) => {
    try {
        const bids = await getAllBids();
        res.json(bids);
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET single bid (public)
router.get('/:id', async (req, res) => {
    try {
        const bid = await getBidById(req.params.id);
        if (!bid) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        res.json(bid);
    } catch (error) {
        console.error('Error fetching bid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create bid (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description } = req.body;

        // Validation
        if (!title || !status || !estimator_name || !estimator_email || !bid_date || !bid_time || !gc_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (status !== 'Active' && status !== 'Not Active') {
            return res.status(400).json({ error: 'Status must be "Active" or "Not Active"' });
        }

        const bid = await createBid({
            title,
            status,
            estimator_name,
            estimator_email,
            bid_date,
            bid_time,
            gc_name,
            description
        });

        res.status(201).json(bid);
    } catch (error) {
        console.error('Error creating bid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update bid (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, status, estimator_name, estimator_email, bid_date, bid_time, gc_name, description } = req.body;

        // Validation
        if (!title || !status || !estimator_name || !estimator_email || !bid_date || !bid_time || !gc_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (status !== 'Active' && status !== 'Not Active') {
            return res.status(400).json({ error: 'Status must be "Active" or "Not Active"' });
        }

        const bid = await updateBid(req.params.id, {
            title,
            status,
            estimator_name,
            estimator_email,
            bid_date,
            bid_time,
            gc_name,
            description
        });

        res.json(bid);
    } catch (error) {
        console.error('Error updating bid:', error);
        if (error.message === 'Bid not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE bid (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await deleteBid(req.params.id);
        res.json({ message: 'Bid deleted successfully' });
    } catch (error) {
        console.error('Error deleting bid:', error);
        if (error.message === 'Bid not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

