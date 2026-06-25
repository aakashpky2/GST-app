const gstr2aService = require('../services/gstr2aService');
const supabase = require('../config/supabase');

// GET /api/gstr2b/:trn
exports.getGSTR2BData = async (req, res) => {
    try {
        const { trn } = req.params;
        const { month, year } = req.query;
        if (!trn) return res.status(400).json({ success: false, error: 'TRN is required' });
        const result = await gstr2aService.getGSTR2BData(trn, month ? parseInt(month) : null, year ? parseInt(year) : null);
        res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/gstr2b/generate
exports.generateGSTR2B = async (req, res) => {
    try {
        const { trn, month, year } = req.body;
        if (!trn || !month || !year) {
            return res.status(400).json({ success: false, error: 'TRN, month, and year are required' });
        }
        const result = await gstr2aService.generateGSTR2BFromGSTR2A(trn, parseInt(month), parseInt(year));
        res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2b/snapshots/:trn
exports.getSnapshots = async (req, res) => {
    try {
        const { trn } = req.params;
        const { data, error } = await supabase
            .from('gstr2b_snapshots')
            .select('*')
            .eq('receiver_trn', trn)
            .order('snapshot_year', { ascending: false })
            .order('snapshot_month', { ascending: false });
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
