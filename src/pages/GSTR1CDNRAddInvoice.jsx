import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRAddInvoice.css';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1CDNRAddInvoice = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        deemedExports: false,
        sezWithPayment: false,
        sezWithoutPayment: false,
        reverseCharge: false,
        intraStateIgst: false,
        differentialRate: false,
        recipientGstin: '',
        recipientName: '',
        nameInMaster: '',
        noteNumber: '',
        noteDate: '',
        noteType: '',
        noteValue: '',
        pos: '',
        supplyType: '',
        source: '',
        irn: '',
        irnDate: ''
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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        if (!formData.recipientGstin || !formData.noteNumber || !formData.noteDate || !formData.noteType || !formData.noteValue || !formData.pos) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            // Fetch existing CDNR invoices
            const res = await api.get(`/forms/tab/${trn}/GSTR1_CDNR_Invoices`);
            let existingInvoices = [];
            if (res.data.success && res.data.data) {
                existingInvoices = res.data.data.invoices || (Array.isArray(res.data.data) ? res.data.data : []);
            }

            const newInvoice = { ...formData, id: Date.now() };
            existingInvoices.push(newInvoice);

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: 'GSTR1_CDNR_Invoices',
                data: { invoices: existingInvoices }
            });

            if (saveRes.data.success) {
                toast.success('CDNR Record saved successfully!');
                navigate('/returns/gstr1/cdnr');
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
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1/cdnr" style={{ textDecoration: 'none', color: '#167dc2' }}>CDNR</Link>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="cdnr-add-main-content">
                {/* Header Banner - Cyan */}
                <div className="cdnr-add-header-banner">
                    <h2 className="cdnr-add-title">Credit/Debit Notes (Registered)- Add Note</h2>
                </div>

                <div className="cdnr-add-body">
                    <div className="cdnr-add-top-bar">
                        <button className="cdnr-add-back-arrow" onClick={() => navigate('/returns/gstr1/cdnr')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Checkboxes Area */}
                    <div className="cdnr-checkbox-grid">
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="deemedExports" checked={formData.deemedExports} onChange={handleChange} />
                            Deemed Exports
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="sezWithPayment" checked={formData.sezWithPayment} onChange={handleChange} />
                            SEZ Supplies with payment
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="sezWithoutPayment" checked={formData.sezWithoutPayment} onChange={handleChange} />
                            SEZ Supplies without payment
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="reverseCharge" checked={formData.reverseCharge} onChange={handleChange} />
                            Supply attract reverse charge
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="intraStateIgst" checked={formData.intraStateIgst} onChange={handleChange} />
                            Intra-State Supplies attracting IGST
                        </label>
                    </div>

                    <div className="cdnr-differential-section">
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="differentialRate" checked={formData.differentialRate} onChange={handleChange} />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    {/* Form Grid */}
                    <div className="cdnr-add-form-grid">
                        <div className="cdnr-form-group">
                            <label>Recipient GSTIN/UIN <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="recipientGstin"
                                value={formData.recipientGstin}
                                onChange={handleChange}
                                placeholder="Search by recipient name as in master or er"
                            />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Recipient Name</label>
                            <input type="text" value={formData.recipientName} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Name as in Master</label>
                            <input type="text" value={formData.nameInMaster} disabled className="disabled-input" />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note No. <span className="red-dot">*</span></label>
                            <input type="text" name="noteNumber" value={formData.noteNumber} onChange={handleChange} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note Date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.noteDate} 
                                onChange={(val) => setFormData(prev => ({...prev, noteDate: val}))} 
                            />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Note Type <span className="red-dot">*</span></label>
                            <select name="noteType" value={formData.noteType} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                            </select>
                        </div>

                        <div className="cdnr-form-group">
                            <label>Note value (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="noteValue" value={formData.noteValue} onChange={handleChange} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>POS <span style={{ fontSize: '11px', border: '1px solid #111', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-block', textAlign: 'center', lineHeight: '13px', marginLeft: '4px' }}>i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="disabled-input" />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Source</label>
                            <input type="text" value={formData.source} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>IRN</label>
                            <input type="text" value={formData.irn} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>IRN date</label>
                            <input type="text" value={formData.irnDate} disabled className="disabled-input" />
                        </div>
                    </div>

                    <div className="cdnr-add-actions">
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1/cdnr')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={handleSave} disabled={isSaving}>
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
        </div>
    );
};

export default GSTR1CDNRAddInvoice;
