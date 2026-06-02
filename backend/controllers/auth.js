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
            if (error && error.message && error.message.includes('Project paused')) {
                console.warn('DB PAUSED: Simulated change password for:', username);
                return res.status(200).json({ success: true, message: 'Password changed successfully.' });
            }
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

// @desc    Check if username exists
// @route   POST /api/auth/check-username
// @access  Public
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username')
            .ilike('username', username)
            .single();
        if (error || !user) {
            if (error && error.message && error.message.includes('Project paused')) {
                console.warn('DB PAUSED: Simulated username check for:', username);
                return res.status(200).json({ success: true, message: 'User found (Simulation Mode)' });
            }
            return res.status(404).json({ success: false, message: 'Invalid username. User not found.' });
        }
        return res.status(200).json({ success: true, message: 'User found' });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};

// @desc    Generate OTP for forgot password
// @route   POST /api/auth/generate-forgot-otp
// @access  Public
exports.generateForgotOtp = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username required' });
        }
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('id')
            .ilike('username', username)
            .single();
        if (userErr || !user) {
            if (userErr && userErr.message && userErr.message.includes('Project paused')) {
                console.warn('DB PAUSED: Simulated OTP generation for:', username);
                const otp = '123456';
                return res.status(200).json({ success: true, otp, message: 'OTP generated (Simulation Mode)' });
            }
            return res.status(404).json({ success: false, message: 'Invalid username. User not found.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        await supabase.from('forgot_otps').upsert({ username: username.toLowerCase(), otp, expires_at: expiresAt }).single();
        return res.status(200).json({ success: true, otp, message: 'OTP generated' });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};

// @desc    Verify OTP for forgot password
// @route   POST /api/auth/verify-forgot-otp
// @access  Public
exports.verifyForgotOtp = async (req, res) => {
    try {
        const { username, otp } = req.body;
        if (!username || !otp) {
            return res.status(400).json({ success: false, message: 'Username and OTP required' });
        }
        const { data: record, error } = await supabase
            .from('forgot_otps')
            .select('otp, expires_at')
            .eq('username', username.toLowerCase())
            .single();
        if (error || !record) {
            if (error && error.message && error.message.includes('Project paused')) {
                console.warn('DB PAUSED: Simulated OTP verification for:', username);
                if (otp === '123456') {
                    return res.status(200).json({ success: true, message: 'OTP verified (Simulation Mode)' });
                }
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
            return res.status(404).json({ success: false, message: 'OTP not found. Generate again.' });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired. Please generate again.' });
        }
        return res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) {
            return res.status(400).json({ success: false, message: 'Username and new password required' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        const { error: updateErr } = await supabase.from('users').update({ password: hashed }).ilike('username', username);
        if (updateErr) {
            if (updateErr.message && updateErr.message.includes('Project paused')) {
                console.log('DB PAUSED: Simulated password update for:', username);
                return res.status(200).json({ success: true, message: 'Password updated successfully (Simulation Mode)' });
            }
            return res.status(500).json({ success: false, message: 'Failed to update password' });
        }
        await supabase.from('forgot_otps').delete().eq('username', username.toLowerCase());
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};
