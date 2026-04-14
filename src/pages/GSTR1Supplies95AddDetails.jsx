import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1Supplies95Dashboard.css';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';

const GSTR1Supplies95AddDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'R2R'; // R2R, R2NR, NR2R, NR2NR

    // Is B2B if tab is R2R or NR2R. B2C if tab is R2NR or NR2NR
    const getVariantInfo = () => {
        switch (tab) {
            case 'R2R': return { suffix: 'B2B', title: 'B2B', isB2B: true, hasSupplierGstin: true };
            case 'NR2R': return { suffix: 'URP2B', title: 'URP2B', isB2B: true, hasSupplierGstin: false };
            case 'R2NR': return { suffix: 'B2C', title: 'B2C', isB2B: false, hasSupplierGstin: true };
            case 'NR2NR': return { suffix: 'URP2C', title: 'URP2C', isB2B: false, hasSupplierGstin: false };
            default: return { suffix: 'B2B', title: 'B2B', isB2B: true, hasSupplierGstin: true };
        }
    };

    const variant = getVariantInfo();
    const isB2B = variant.isB2B;

    const [formData, setFormData] = useState({
        // Generic Fields
        supplierGstin: '',
        supplierName: '',
        pos: '',
        supplyType: '',
        taxableValue: '',
        rate: '',

        // B2B specific
        recipientGstin: '',
        recipientName: '',
        documentNumber: '',
        documentDate: '',
        totalValue: '',
        deemedExports: false,
        sezWithPayment: false,
        sezWithoutPayment: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        // Validation logic
        if (isB2B) {
            if ((variant.hasSupplierGstin && !formData.supplierGstin) || !formData.recipientGstin || !formData.documentNumber || !formData.documentDate || !formData.totalValue || !formData.pos) {
                toast.error('Please fill mandatory fields');
                return;
            }
        } else {
            if ((variant.hasSupplierGstin && !formData.supplierGstin) || !formData.pos || !formData.taxableValue || !formData.rate) {
                toast.error('Please fill mandatory fields');
                return;
            }
        }

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const tabName = `GSTR1_SUP95_${tab}`;

            // Fetch current records
            const getRes = await api.get(`/forms/tab/${trn}/${tabName}`);
            let records = [];
            if (getRes.data.success && getRes.data.data) {
                records = getRes.data.data.records || (Array.isArray(getRes.data.data) ? getRes.data.data : []);
            }

            const newRecord = { ...formData, id: Date.now() };
            const updatedRecords = [...records, newRecord];

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName,
                data: { records: updatedRecords }
            });

            if (saveRes.data.success) {
                toast.success('Supplies record saved successfully!');
                navigate(`/returns/gstr1/sup95?tab=${tab}`);
            }
        } catch (error) {
            toast.error('Failed to save record');
        }
    };

    const rates = ["0%", "0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"];

    const headerTitle = `15 - Supplies U/s 9(5) - ${variant.title} - Add Details`;

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns-dashboard" className="breadcrumb-link">Returns</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns/gstr1" className="breadcrumb-link">GSTR-1/IFF</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns/gstr1/sup95" className="breadcrumb-link">Supplies U/s 9(5)</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <span className="breadcrumb-current">{variant.suffix}</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="sup95-main-content">
                <div className="sup95-header-banner">
                    <div className="sup95-header-flex">
                        <h2 className="sup95-title">{headerTitle}</h2>
                    </div>
                </div>

                <div className="sup95-body">
                    <div className="sup95-back-nav" onClick={() => navigate(`/returns/gstr1/sup95?tab=${tab}`)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white" style={{ background: '#1eb3a6', borderRadius: '50%', padding: '4px' }}>
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                    </div>

                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates Mandatory Fields</span>
                    </div>

                    {isB2B && (
                        <div className="sup95-checkbox-row">
                            <label><input type="checkbox" name="deemedExports" checked={formData.deemedExports} onChange={handleChange} /> Deemed Exports</label>
                            <label><input type="checkbox" name="sezWithPayment" checked={formData.sezWithPayment} onChange={handleChange} /> SEZ Supplies with payment</label>
                            <label><input type="checkbox" name="sezWithoutPayment" checked={formData.sezWithoutPayment} onChange={handleChange} /> SEZ Supplies without payment</label>
                        </div>
                    )}

                    <div className="sup95-form-grid">
                        {variant.hasSupplierGstin && (
                            <>
                                <div className="sup95-form-group">
                                    <label>Supplier GSTIN/UIN <span className="red-dot">*</span></label>
                                    <input type="text" name="supplierGstin" placeholder="Enter Supplier GSTIN/UIN" value={formData.supplierGstin} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Supplier Name <span className="red-dot">*</span></label>
                                    <input type="text" name="supplierName" className="disabled-input" value={formData.supplierName} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {isB2B ? (
                            <>
                                <div className="sup95-form-group">
                                    <label>Recipient GSTIN/UIN <span className="red-dot">*</span></label>
                                    <input type="text" name="recipientGstin" placeholder="Enter Recipient GSTIN/UIN" value={formData.recipientGstin} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Recipient name <span className="red-dot">*</span></label>
                                    <input type="text" name="recipientName" className="disabled-input" value={formData.recipientName} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Document number <span className="red-dot">*</span></label>
                                    <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Document date <span className="red-dot">*</span></label>
                                    <div className="date-input-wrapper">
                                        <CustomDatePicker 
                                            value={formData.documentDate} 
                                            onChange={(val) => setFormData(prev => ({...prev, documentDate: val}))} 
                                        />
                                    </div>
                                </div>
                                <div className="sup95-form-group">
                                    <label>Total value of supplies made (₹) <span className="red-dot">*</span></label>
                                    <input type="text" name="totalValue" value={formData.totalValue} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>POS <span style={{ fontSize: '12px', background: '#ccc', borderRadius: '50%', padding: '0 3px', marginLeft: '5px' }}>i</span> <span className="red-dot">*</span></label>
                                    <select name="pos" value={formData.pos} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="04-Chandigarh">04-Chandigarh</option>
                                        <option value="09-Uttar Pradesh">09-Uttar Pradesh</option>
                                        {/* More states... */}
                                    </select>
                                </div>
                                <div className="sup95-form-group" style={{ gridColumn: 'span 3' }}>
                                    <label>Supply type</label>
                                    <input type="text" name="supplyType" className="disabled-input" value={formData.supplyType} onChange={handleChange} style={{ width: '31.5%' }} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="sup95-form-group">
                                    <label>POS <span style={{ fontSize: '12px', background: '#ccc', borderRadius: '50%', padding: '0 3px', marginLeft: '5px' }}>i</span> <span className="red-dot">*</span></label>
                                    <select name="pos" value={formData.pos} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="04-Chandigarh">04-Chandigarh</option>
                                        <option value="09-Uttar Pradesh">09-Uttar Pradesh</option>
                                    </select>
                                </div>
                                <div className="sup95-form-group">
                                    <label>Taxable value (₹) <span className="red-dot">*</span></label>
                                    <input type="text" name="taxableValue" value={formData.taxableValue} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Supply type</label>
                                    <input type="text" name="supplyType" className="disabled-input" value={formData.supplyType} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Rate <span className="red-dot">*</span></label>
                                    <select name="rate" value={formData.rate} onChange={handleChange}>
                                        <option value="">Select</option>
                                        {rates.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="sup95-footer-actions" style={{ justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
                        <button className="sup95-btn-back" style={{ padding: '8px 40px' }} onClick={() => navigate(`/returns/gstr1/sup95?tab=${tab}`)}>BACK</button>
                        <button className="sup95-btn-add" style={{ padding: '8px 40px', backgroundColor: '#2b4b7c' }} onClick={handleSave}>SAVE</button>
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

export default GSTR1Supplies95AddDetails;
