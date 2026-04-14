const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');


// @desc    Register user
// @route   POST /api/registration/step1
// @access  Public
exports.registerStep1 = async (req, res, next) => {
    try {
        const {
            userType,
            state,
            district,
            legalName,
            pan,
            email,
            mobile
        } = req.body;

        // Check if user already exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Simulating TRN generation for step 2
        const trn = 'TRN' + Math.floor(10000000 + Math.random() * 90000000);

        // Simulate OTPs (6 digits)
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`Email OTP for ${email}: ${emailOtp}`);
        console.log(`Mobile OTP for ${mobile}: ${mobileOtp}`);

        res.status(200).json({
            success: true,
            message: 'Details saved. Please verify OTPs sent to your email and mobile.',
            trn,
            debug: { emailOtp, mobileOtp } // For testing purposes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/registration/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, emailOtp, mobileOtp, userType, state, district, legalName, pan, mobile } = req.body;
        console.log('Received for verification:', { email, emailOtp, mobileOtp, userType, pan });

        // In a real app, we would verify against stored OTPs
        // For simulation, we'll accept any 6 digits provided by the user
        if (emailOtp && mobileOtp && emailOtp.length === 6 && mobileOtp.length === 6) {
            const finalTrn = Math.floor(100000000000 + Math.random() * 900000000000) + 'TRN';

            // Save the registration base data immediately to business_details
            const { error: dbError } = await supabase
                .from('business_details')
                .upsert(
                    {
                        trn: finalTrn,
                        email: email || null,
                        mobile: mobile || null,
                        legal_name: legalName || null,
                        pan: pan || null,
                        state_name: state || null,
                        district: district || null,
                        updated_at: new Date().toISOString(),

                    },
                    { onConflict: 'trn' }
                );

            if (dbError) {
                console.error("Failed to persist registration to business_details:", dbError.message);
                
                if (dbError.message && dbError.message.includes('Project paused')) {
                    console.warn("DB PAUSED: Simulating registration success for TRN:", finalTrn);
                    return res.status(200).json({
                        success: true,
                        message: 'OTP Verified (Simulated - Supabase Project Paused). Your TRN has been generated.',
                        trn: finalTrn,
                        isSimulated: true
                    });
                }
                
                return res.status(500).json({ success: false, message: 'Database Error: Could not save registration details. Is your Supabase project paused?' });
            }
            
            console.log("Registration Part A saved successfully for TRN:", finalTrn);

            // Attempt to insert into users table (optional, depending on DB rules)
            const { error: userError } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    pan: pan || null,
                    username: finalTrn, // Uses TRN as a temp username for now
                    password: Math.random().toString(36).slice(-8)
                }]);
            
            if (userError) {
                console.error("Warning: Could not create user record:", userError.message);
                // We won't block the response for the users table since we care more about the TRN flow.
            }

            res.status(200).json({
                success: true,
                message: 'OTP Verified successfully. Your TRN has been generated and saved.',
                trn: finalTrn
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP. Please enter 6-digit OTPs.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Complete registration and generate final credentials
// @route   POST /api/registration/complete
// @access  Public
exports.completeRegistration = async (req, res, next) => {
    try {
        const { trn, legalName, pan } = req.body;

        if (!trn) {

            return res.status(400).json({ success: false, message: 'TRN is required' });
        }

        console.log(`[RegistrationComplete] Attempting to complete registration for TRN: ${trn}`);

        // Fetch business details to associate with the user account
        const { data: bizData, error: bizError } = await supabase
            .from('business_details')
            .select('email, mobile, legal_name, pan, state_name, state')
            .eq('trn', trn)
            .single();

        if (bizError) {
            console.warn(`[RegistrationComplete] Warning: Could not fetch bizData for TRN ${trn}:`, bizError.message);
        }

        const userEmail = bizData?.email || `gst_user_${Math.floor(Math.random()*10000)}@example.com`;
        const userMobile = bizData?.mobile || '0000000000';
        const userPan = pan || bizData?.pan || 'TESTPAN1234';
        const userState = bizData?.state_name || bizData?.state || 'Unknown';
        const actualLegalName = legalName || bizData?.legal_name || 'GST Registrant';

        console.log(`[RegistrationComplete] Derived Data - Email: ${userEmail}, Mobile: ${userMobile}, State: ${userState}, Name: ${actualLegalName}`);


        // Generate username and password according to information in the form
        // Username: First word of legal name + last 4 characters of PAN
        const firstWord = actualLegalName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const panSuffix = userPan.length >= 4 ? userPan.slice(-4) : Math.floor(1000 + Math.random() * 9000);
        const tempUsername = `${firstWord}${panSuffix}`;

        // Password: Capitalized first word + @ + random 4 digits
        const capitalizedFirst = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const tempPassword = `${capitalizedFirst}@${randomDigits}`;


        // Insert/Update the user in the users table
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .upsert(
                {
                    username: tempUsername,
                    password: await bcrypt.hash(tempPassword, 10),
                    email: userEmail,
                    pan: userPan,
                    user_type: 'Taxpayer',
                    state: userState,
                    legal_name: actualLegalName,
                    mobile: userMobile,
                    trn: trn
                },
                { onConflict: 'username' }
            )
            .select();







        if (userError) {
            console.error("Failed to create final credentials:", userError);
            
            if (userError.message && userError.message.includes('Project paused')) {
                console.warn("DB PAUSED: Simulating credential creation success.");
                return res.status(200).json({
                    success: true,
                    message: 'Registration completed (Simulated - Supabase Project Paused).',
                    credentials: {
                        username: tempUsername,
                        password: tempPassword
                    },
                    isSimulated: true
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                message: 'Database Error: Could not create credentials.',
                details: userError.message,
                hint: userError.hint
            });
        }


        // Delete the temporary TRN user so only the new credentials work
        await supabase
            .from('users')
            .delete()
            .eq('username', trn);

        res.status(200).json({
            success: true,
            message: 'Registration completed successfully.',
            credentials: {
                username: tempUsername,
                password: tempPassword
            }
        });
    } catch (err) {
        console.error("Complete registration error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
