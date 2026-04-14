import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRAddInvoice.css'; // Reusing common grid styles
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1AdjAdvancesAddDetails = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        pos: '',
        supplyType: '',
        differentialRate: false,
        grossAdjustment: '',
        rate: '',
        igst: '',
        cgst: '',
        sgst: '',
        cess: ''
    });

    const posOptions = [
        "01-Jammu & Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh", "05-Uttarakhand",
        "06-Haryana", "07-Delhi", "08-Rajasthan", "09-Uttar Pradesh", "10-Bihar",
        "11-Sikkim", "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur", "15-Mizoram",
        "16-Tripura", "17-Meghalaya", "18-Assam", "19-West Bengal", "20-Jharkhand",
        "21-Odisha", "22-Chhattisgarh", "23-Madhya Pradesh", "24-Gujarat", "25-Daman & Diu",
        "26-Dadra & Nagar Haveli", "27-Maharashtra", "29-Karnataka", "30-Goa", "31-Lakshadweep",
        "32-Kerala", "33-Tamil Nadu", "34-Puducherry", "35-Andaman & Nicobar Islands", "36-Telangana",
        "37-Andhra Pradesh", "38-Ladakh", "97-Other Territory"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        if (name === 'pos' && value) {
            // Assume 33 is local state (Tamil Nadu)
            const isLocal = value.startsWith('33');
            newFormData.supplyType = isLocal ? 'Intra-State' : 'Inter-State';
        }

        setFormData(newFormData);
    };

    const handleSave = async () => {
        if (!formData.pos || !formData.rate || !formData.grossAdjustment) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const res = await api.get(`/forms/tab/${trn}/GSTR1_AdjAdvances_Invoices`);
            let existingRecords = [];
            if (res.data.success && res.data.data) {
                existingRecords = res.data.data.records || (Array.isArray(res.data.data) ? res.data.data : []);
            }

            const newRecord = { ...formData, id: Date.now() };
            existingRecords.push(newRecord);

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: 'GSTR1_AdjAdvances_Invoices',
                data: { records: existingRecords }
            });

            if (saveRes.data.success) {
                toast.success('Adjustment of Advances Record saved successfully!');
                navigate('/returns/gstr1/adjadvances');
            } else {
                toast.error('Failed to save record');
            }
        } catch (err) {
            toast.error('Error saving: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1/adjadvances" style={{ textDecoration: 'none', color: '#167dc2' }}>Adjustment of Advances</Link>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="cdnr-add-main-content">
                <div className="cdnr-add-header-banner">
                    <h2 className="cdnr-add-title">Adjustment of Advances - Add Details</h2>
                </div>

                <div className="cdnr-add-body">
                    {/* Note Box */}
                    <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                        <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                            <span style={{ fontWeight: '500' }}>Note:</span> Declare the amount of advance for which tax has already been paid receipt of consideration in an earlier period and invoices issued in the current period for the supplies.
                        </p>
                    </div>

                    <div className="cdnr-add-top-bar" style={{ justifyContent: 'flex-end', borderBottom: 'none', paddingBottom: '0' }}>
                        <div className="mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* POS and Supply Type Row */}
                    <div className="cdnr-add-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div className="cdnr-form-group">
                            <label>
                                POS <span style={{ fontSize: '11px', border: '1px solid #111', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-block', textAlign: 'center', lineHeight: '13px', marginLeft: '4px' }}>i</span> <span className="red-dot">*</span>
                            </label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="disabled-input" />
                        </div>
                    </div>

                    {/* Tax Amount Fields */}
                    <div className="cdnr-add-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                        <div className="cdnr-form-group">
                            <label>Rate (%) <span className="red-dot">*</span></label>
                            <select name="rate" value={formData.rate} onChange={handleChange}>
                                <option value="">Select</option>
                                {["0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Gross Advance Adjusted (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="grossAdjustment" value={formData.grossAdjustment} onChange={handleChange} />
                        </div>

                        {formData.supplyType === 'Inter-State' ? (
                            <div className="cdnr-form-group">
                                <label>Integrated Tax (₹) <span className="red-dot">*</span></label>
                                <input type="text" name="igst" value={formData.igst} onChange={handleChange} />
                            </div>
                        ) : (
                            <>
                                <div className="cdnr-form-group">
                                    <label>Central Tax (₹) <span className="red-dot">*</span></label>
                                    <input type="text" name="cgst" value={formData.cgst} onChange={handleChange} />
                                </div>
                                <div className="cdnr-form-group">
                                    <label>State/UT Tax (₹) <span className="red-dot">*</span></label>
                                    <input type="text" name="sgst" value={formData.sgst} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        <div className="cdnr-form-group">
                            <label>Cess (₹)</label>
                            <input type="text" name="cess" value={formData.cess} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Checkbox Section */}
                    <div style={{ marginTop: '25px', padding: '0 5px' }}>
                        <label className="cdnr-checkbox-item" style={{ alignItems: 'flex-start', gap: '10px' }}>
                            <input
                                type="checkbox"
                                name="differentialRate"
                                checked={formData.differentialRate}
                                onChange={handleChange}
                                style={{ marginTop: '3px' }}
                            />
                            <span style={{ fontSize: '13.5px', color: '#333' }}>
                                Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                            </span>
                        </label>
                    </div>

                    <div className="cdnr-add-actions" style={{ marginTop: '40px' }}>
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1/adjadvances')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default GSTR1AdjAdvancesAddDetails;
