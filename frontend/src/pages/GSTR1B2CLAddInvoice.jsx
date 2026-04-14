import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1B2CLAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1B2CLAddInvoice = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        isDifferential: false,
        pos: 'Select',
        invoiceNo: '',
        invoiceDate: '',
        supplyType: 'Inter-State',
        totalInvoiceValue: '',
        itemDetails: [
            { rate: '0%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '0.1%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '0.25%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '1%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '1.5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '3%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '6%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '7.5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '12%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '18%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '28%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '40%', taxableValue: '', integratedTax: '', cess: '' },
        ]
    });

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItemDetails = [...formData.itemDetails];
        newItemDetails[index][field] = value;
        setFormData(prev => ({ ...prev, itemDetails: newItemDetails }));
    };

    const handleSave = async () => {
        if (formData.pos === 'Select' || !formData.invoiceNo || !formData.invoiceDate || !formData.totalInvoiceValue) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            // Fetch existing B2CL invoices
            const res = await api.get(`/forms/tab/${trn}/GSTR1_B2CL_Invoices`);
            let existingInvoices = [];
            if (res.data.success && res.data.data) {
                existingInvoices = res.data.data.invoices || (Array.isArray(res.data.data) ? res.data.data : []);
            }

            const newInvoice = { ...formData, id: Date.now() };
            existingInvoices.push(newInvoice);

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: 'GSTR1_B2CL_Invoices',
                data: { invoices: existingInvoices }
            });

            if (saveRes.data.success) {
                toast.success('B2CL Invoice saved successfully!');
                navigate('/returns/gstr1/b2cl');
            } else {
                toast.error('Failed to save invoice');
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
                    <span style={{ color: '#4b5563' }}>B2CL</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="b2cl-add-main-content">

                {/* Header Banner */}
                <div className="b2cl-add-header-banner">
                    <h2 className="b2cl-add-title">B2C(Large) Invoices- Details</h2>
                </div>

                <div className="b2cl-add-content-body">
                    <div className="b2cl-add-top-bar">
                        <button className="b2cl-add-back-arrow" onClick={() => navigate('/returns/gstr1/b2cl')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="b2cl-add-mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Checkbox Section */}
                    <div className="b2cl-add-section">
                        <label className="b2cl-add-checkbox-label">
                            <input
                                type="checkbox"
                                name="isDifferential"
                                checked={formData.isDifferential}
                                onChange={handleChange}
                            />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    {/* Form Fields Section */}
                    <div className="b2cl-add-form-grid">
                        <div className="b2cl-add-form-group">
                            <label>POS <span className="info-circle" title="Place of Supply">i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option>Select</option>
                                <option>01-Jammu & Kashmir</option>
                                <option>02-Himachal Pradesh</option>
                                <option>03-Punjab</option>
                                <option>04-Chandigarh</option>
                                <option>32-Kerala</option>
                            </select>
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Invoice no. <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="invoiceNo"
                                value={formData.invoiceNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Invoice date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.invoiceDate} 
                                onChange={(val) => setFormData(prev => ({...prev, invoiceDate: val}))} 
                            />
                        </div>

                        <div className="b2cl-add-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="b2cl-add-disabled-input" />
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Total invoice value (₹) <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="totalInvoiceValue"
                                value={formData.totalInvoiceValue}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Item Details Table Section */}
                    <div className="b2cl-add-item-details-section">
                        <h3 className="b2cl-add-section-title">Item details</h3>
                        <div className="b2cl-add-table-container">
                            <table className="b2cl-add-item-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Rate (%)</th>
                                        <th style={{ width: '30%' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                        <th colSpan="2" style={{ textAlign: 'center' }}>Amount of Tax</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th style={{ width: '25%' }}>Integrated tax (₹) <span className="red-dot">*</span></th>
                                        <th style={{ width: '25%' }}>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.itemDetails.map((item, index) => (
                                        <tr key={index}>
                                            <td className="rate-cell">{item.rate}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.taxableValue}
                                                    onChange={(e) => handleItemChange(index, 'taxableValue', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.integratedTax}
                                                    onChange={(e) => handleItemChange(index, 'integratedTax', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.cess}
                                                    onChange={(e) => handleItemChange(index, 'cess', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="b2cl-add-actions">
                        <button className="b2cl-add-btn-outline" onClick={() => navigate('/returns/gstr1/b2cl')}>BACK</button>
                        <button className="b2cl-add-btn-primary" onClick={handleSave} disabled={isSaving}>
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

export default GSTR1B2CLAddInvoice;
