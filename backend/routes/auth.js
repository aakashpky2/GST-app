const express = require('express');
const { login, getMe, forgotPassword, changePassword } = require('../controllers/auth');

const router = express.Router();

// Middleware for protected routes
const { protect } = require('../middleware/auth');
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/change-password', changePassword);
router.get('/me', protect, getMe);
router.get('/trn-details/:trn', async (req, res, next) => {
    try {
        const trn = req.params.trn;
        const supabase = require('../config/supabase'); // Local require to avoid circular deps if any
        const { data, error } = await supabase
            .from('business_details')
            .select('legal_name, pan, state_name, district')
            .eq('trn', trn)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'TRN not found' });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
