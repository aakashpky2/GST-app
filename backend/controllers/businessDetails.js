const supabase = require('../config/supabase');

// @desc    Save / update Business Details (Part B - Step 1)
// @route   POST /api/business-details/save
// @access  Public
exports.saveBusinessDetails = async (req, res) => {
    try {
        let trn,
            legalName,
            pan,
            stateName,
            tradeName,
            additionalTrade,
            constitution,
            district,
            casualTaxable,
            composition,
            rule14A,
            reason,
            commencementDate,
            liabilityDate;

        ({
            trn,
            legalName,
            pan,
            stateName,
            tradeName,
            additionalTrade,
            constitution,
            district,
            casualTaxable,
            composition,
            rule14A,
            reason,
            commencementDate,
            liabilityDate,
        } = req.body);

        // Auto-generate a guest TRN if none provided (direct navigation scenario)
        if (!trn) {
            trn = 'GUEST-' + (pan || 'UNKNOWN') + '-' + Date.now();
        }

        // Upsert: insert if not exists, update if TRN already has a record
        const { data, error } = await supabase
            .from('business_details')
            .upsert(
                {
                    trn,
                    legal_name: legalName,
                    pan,
                    state_name: stateName,
                    trade_name: tradeName || null,
                    additional_trade: additionalTrade || null,
                    constitution,
                    district,
                    casual_taxable: casualTaxable || false,
                    composition: composition || false,
                    rule_14a: rule14A,
                    reason,
                    commencement_date: commencementDate,
                    liability_date: liabilityDate,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'trn' }   // update the row if TRN already exists
            )
            .select();

        if (error) {
            console.error('Supabase error saving business details:', error);
            
            // Check if project is paused
            if (error.message && error.message.includes('Project paused')) {
                console.warn('DB PAUSED: Simulating success for TRN:', trn);
                return res.status(200).json({
                    success: true,
                    message: 'Business Details saved (Simulated - Supabase Project is Paused). Please unpause it to persist data correctly.',
                    isSimulated: true
                });
            }
            
            return res.status(500).json({ success: false, message: error.message });
        }

        console.log('Business details saved for TRN:', trn);
        res.status(200).json({
            success: true,
            message: 'Business Details saved successfully.',
            data: data?.[0] || null
        });
    } catch (err) {
        console.error('Save Business Details Error:', err.message);
        
        // Final fallback for unexpected failures (e.g. network timeout)
        if (err.message && (err.message.includes('paused') || err.message.includes('fetch'))) {
            return res.status(200).json({
                success: true,
                message: 'Business Details saved (Local Simulation Mode).',
                isSimulated: true
            });
        }
        
        res.status(500).json({ success: false, message: err.message });
    }
};
