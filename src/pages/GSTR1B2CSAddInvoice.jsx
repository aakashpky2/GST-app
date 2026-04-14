import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1B2CSAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1B2CSAddInvoice = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        pos: '',
        taxableValue: '',
        supplyType: 'Intra-State',
        isDifferentialRate: false,
        rate: ''
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

    const rateOptions = ["0%", "0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"];

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Basic logic for supply type logic (simplified)
        // Usually B2CS is Intra-State unless POS is different from user's state
        // For simplicity in this learning app, we allow it to be Intra-State by default
    };

    const handleSave = async () => {
        if (!formData.pos || !formData.taxableValue || !formData.rate) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            // Fetch existing B2CS invoices
            const res = await api.get(`/forms/tab/${trn}/GSTR1_B2CS_Invoices`);
            let existingInvoices = [];
            if (res.data.success && res.data.data) {
                existingInvoices = res.data.data.invoices || (Array.isArray(res.data.data) ? res.data.data : []);
            }

            const newInvoice = { ...formData, id: Date.now() };
            existingInvoices.push(newInvoice);

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: 'GSTR1_B2CS_Invoices',
                data: { invoices: existingInvoices }
            });

            if (saveRes.data.success) {
                toast.success('B2CS Record saved successfully!');
                navigate('/returns/gstr1/b2cs');
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
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>B2CS</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="b2cs-add-main-content">

                {/* Header Banner */}
                <div className="b2cs-add-header-banner">
                    <h2 className="b2cs-add-title">B2CS- Add Details</h2>
                </div>

                <div className="b2cs-add-content-body">
                    <div className="b2cs-add-top-bar">
                        <button className="b2cs-add-back-arrow" onClick={() => navigate('/returns/gstr1/b2cs')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="b2cs-add-mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="b2cs-add-form-grid">
                        <div className="b2cs-add-form-group">
                            <label>POS <span style={{ fontSize: '11px', display: 'inline-block', marginLeft: '4px', border: '1px solid #111', borderRadius: '50%', width: '14px', height: '14px', textAlign: 'center', lineHeight: '14px' }}>i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="b2cs-add-form-group">
                            <label>Taxable value (₹) <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="taxableValue"
                                value={formData.taxableValue}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="b2cs-add-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="b2cs-add-disabled-input" />
                        </div>
                    </div>

                    <div className="b2cs-add-checkbox-section">
                        <label className="b2cs-add-checkbox-label">
                            <input
                                type="checkbox"
                                name="isDifferentialRate"
                                checked={formData.isDifferentialRate}
                                onChange={handleChange}
                            />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    <div className="b2cs-add-form-grid" style={{ paddingTop: '10px' }}>
                        <div className="b2cs-add-form-group">
                            <label>Rate <span className="red-dot">*</span></label>
                            <select name="rate" value={formData.rate} onChange={handleChange}>
                                <option value="">Select</option>
                                {rateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="b2cs-add-actions">
                        <button className="b2cs-add-btn-outline" onClick={() => navigate('/returns/gstr1/b2cs')}>BACK</button>
                        <button className="b2cs-add-btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
    );
};

export default GSTR1B2CSAddInvoice;
