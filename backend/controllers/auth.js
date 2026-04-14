const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate email & password
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username and password' });
        }

        // Check for user in Supabase (case-insensitive)
        // Check for user in Supabase (case-insensitive)
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('username', username)
            .single();

        if (error || !user) {
            console.warn(`[Login] User not found or DB error: ${username}`);
            
            // Bypass login if Supabase project is paused
            if (error && error.message && error.message.includes('Project paused')) {
                console.warn('DB PAUSED: Bypassing login for user:', username);
                
                // Return a simulated demo user
                const demoUser = {
                    id: 'demo-id-123',
                    username: username,
                    email: username + '@example.com',
                    user_type: 'Taxpayer',
                    legal_name: 'Demo Self-Learning User',
                    isSimulated: true
                };

                const token = jwt.sign({ id: demoUser.id }, process.env.JWT_SECRET || 'secret', {
                    expiresIn: '30d'
                });

                return res.status(200).json({
                    success: true,
                    token,
                    user: demoUser,
                    message: 'Login Successful (Simulation Mode - Supabase Paused)'
                });
            }
            
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`[Login] User found: ${user.username}. Comparing passwords...`);

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn(`[Login] Password mismatch for user: ${username}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`[Login] Login successful for: ${user.username}`);


        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        // Remove password before sending back
        const { password: _, ...userData } = user;

        res.status(200).json({
            success: true,
            token,
            user: userData
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { pan, email } = req.body;

        // Find user by PAN and Email
        const { data: user, error } = await supabase
            .from('users')
            .select('email')
            .eq('pan', pan)
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'No user found with these details' });
        }

        // In a real app, send reset link
        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your registered email'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private (uses username from localStorage passed in body)
exports.changePassword = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        if (!username || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Fetch user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('username', username)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Old password is incorrect.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNew = await bcrypt.hash(newPassword, salt);

        // Update in Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedNew })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ success: false, message: 'Failed to update password.' });
        }

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
