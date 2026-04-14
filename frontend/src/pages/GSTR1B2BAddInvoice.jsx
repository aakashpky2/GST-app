import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1B2BAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1B2BAddInvoice = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [formData, setFormData] = useState({
        recipientGSTIN: '',
        recipientName: '',
        nameAsInMaster: '',
        invoiceNo: '',
        invoiceDate: '',
        totalInvoiceValue: '',
        pos: 'Select',
        isDeemedExport: false,
        isSEZWithPayment: false,
        isSEZWithoutPayment: false,
        isReverseCharge: false,
        isIntraStateIGST: false,
        isDifferentialPercentage: false,
        itemDetails: [
            { rate: '0%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '0.1%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '0.25%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1.5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '3%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '6%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '7.5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '12%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '18%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '28%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '40%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
        ]
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let updatedData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        if (name === 'pos' && value !== 'Select') {
            const homeState = localStorage.getItem('gst_state') || 'Kerala';
            // If POS starts with the same state name (roughly), it's Intra-State.
            // In a real app, we'd compare codes. Here we do a simple string check.
            const isLocal = value.includes(homeState) && homeState !== '';
            updatedData.supplyType = isLocal ? 'Intra-State' : 'Inter-State';
        }

        setFormData(updatedData);
    };

    const handleItemChange = (index, field, value) => {
        const newItemDetails = [...formData.itemDetails];
        newItemDetails[index][field] = value;
        setFormData(prev => ({ ...prev, itemDetails: newItemDetails }));
    };

    const handleSave = async () => {
        if (!formData.recipientGSTIN || !formData.recipientName || !formData.invoiceNo || !formData.invoiceDate || !formData.totalInvoiceValue || formData.pos === 'Select') {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            console.log('Saving to TRN:', trn);

            // Fetch existing
            const res = await api.get(`/forms/tab/${trn}/GSTR1_B2B_Invoices`);
            console.log('Existing data:', res.data);
            
            let existingInvoices = [];
            if (res.data.success && res.data.data && Array.isArray(res.data.data.invoices)) {
                existingInvoices = res.data.data.invoices;
            } else if (res.data.success && Array.isArray(res.data.data)) {
                existingInvoices = res.data.data;
            }

            // We send 'itemDetails' which the backend maps to 'tax_items'
            const newInvoice = { ...formData, id: Date.now() };
            existingInvoices.push(newInvoice);

            console.log('Sending payload:', { trn, tabName: 'GSTR1_B2B_Invoices', data: { invoices: existingInvoices } });

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: 'GSTR1_B2B_Invoices',
                data: { invoices: existingInvoices }
            });

            console.log('Save response:', saveRes.data);

            if (saveRes.data.success) {
                toast.success('Invoice added successfully!');
                navigate('/returns/gstr1/b2b');
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
                    <span style={{ color: '#4b5563' }}>B2B</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="invoice-add-main-content">

                {/* Header Banner */}
                <div className="invoice-header-banner">
                    <h2 className="invoice-title">B2B, SEZ, DE - Add Invoice</h2>
                </div>

                <div className="invoice-content-body">
                    <div className="invoice-top-bar">
                        <button className="invoice-back-arrow" onClick={() => navigate('/returns/gstr1/b2b')}>
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="invoice-mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Checkboxes Section */}
                    <div className="invoice-section">
                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input type="checkbox" name="isDeemedExport" checked={formData.isDeemedExport} onChange={handleChange} /> Deemed Exports
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" name="isSEZWithPayment" checked={formData.isSEZWithPayment} onChange={handleChange} /> SEZ Supplies with payment
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" name="isSEZWithoutPayment" checked={formData.isSEZWithoutPayment} onChange={handleChange} /> SEZ Supplies without payment
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" name="isReverseCharge" checked={formData.isReverseCharge} onChange={handleChange} /> Supply attract reverse charge
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" name="isIntraStateIGST" checked={formData.isIntraStateIGST} onChange={handleChange} /> Intra-State Supplies attracting IGST
                            </label>
                        </div>
                        <div className="checkbox-full-width">
                            <label className="checkbox-label">
                                <input type="checkbox" name="isDifferentialPercentage" checked={formData.isDifferentialPercentage} onChange={handleChange} /> Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                            </label>
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="invoice-form-section">
                        <div className="invoice-form-row">
                            <div className="invoice-form-group">
                                <label>Recipient GSTIN/UIN <span className="red-dot">*</span></label>
                                <input type="text" name="recipientGSTIN" value={formData.recipientGSTIN} onChange={handleChange} placeholder="Search by recipient name as in master or er" />
                            </div>
                            <div className="invoice-form-group">
                                <label>Recipient Name <span className="red-dot">*</span></label>
                                <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} />
                            </div>
                            <div className="invoice-form-group">
                                <label>Name as in Master</label>
                                <input type="text" disabled className="disabled-input" />
                            </div>
                        </div>

                        <div className="invoice-form-row">
                            <div className="invoice-form-group">
                                <label>Invoice no. <span className="red-dot">*</span></label>
                                <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} />
                            </div>
                            <div className="invoice-form-group">
                                <label>Invoice date <span className="red-dot">*</span></label>
                                <CustomDatePicker 
                                    value={formData.invoiceDate} 
                                    onChange={(val) => setFormData(prev => ({...prev, invoiceDate: val}))} 
                                />
                            </div>

                            <div className="invoice-form-group">
                                <label>Total invoice value (₹) <span className="red-dot">*</span></label>
                                <input type="text" name="totalInvoiceValue" value={formData.totalInvoiceValue} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="invoice-form-row col-2">
                            <div className="invoice-form-group">
                                <label>POS <span className="info-circle">i</span> <span className="red-dot">*</span></label>
                                <select name="pos" value={formData.pos} onChange={handleChange}>
                                    <option>Select</option>
                                    <option>01-Jammu & Kashmir</option>
                                    <option>02-Himachal Pradesh</option>
                                    <option>03-Punjab</option>
                                    <option>04-Chandigarh</option>
                                    <option>05-Uttarakhand</option>
                                    <option>06-Haryana</option>
                                    <option>07-Delhi</option>
                                    <option>08-Rajasthan</option>
                                    <option>09-Uttar Pradesh</option>
                                    <option>10-Bihar</option>
                                    <option>19-West Bengal</option>
                                    <option>24-Gujarat</option>
                                    <option>27-Maharashtra</option>
                                    <option>29-Karnataka</option>
                                    <option>32-Kerala</option>
                                    <option>33-Tamil Nadu</option>
                                    <option>36-Telangana</option>
                                    <option>37-Andhra Pradesh</option>
                                </select>
                            </div>
                            <div className="invoice-form-group">
                                <label>Supply Type</label>
                                <input type="text" value={formData.supplyType || ''} disabled className="disabled-input" />
                            </div>
                        </div>

                        <div className="invoice-form-row">
                            <div className="invoice-form-group">
                                <label>Source</label>
                                <input type="text" disabled className="disabled-input" />
                            </div>
                            <div className="invoice-form-group">
                                <label>IRN</label>
                                <input type="text" disabled className="disabled-input" />
                            </div>
                            <div className="invoice-form-group">
                                <label>IRN date</label>
                                <input type="text" disabled className="disabled-input" />
                            </div>
                        </div>
                    </div>
                    {/* Item Details Table Section */}
                    <div className="invoice-item-details-section">
                        <h3 className="section-title">Item details</h3>
                        <div className="invoice-table-container">
                            <table className="invoice-item-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2" style={{ width: '15%' }}>Rate (%)</th>
                                        <th rowSpan="2" style={{ width: '25%' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                        <th colSpan={formData.supplyType === 'Intra-State' ? 3 : (formData.supplyType === 'Inter-State' ? 2 : 4)} style={{ textAlign: 'center' }}>Amount of Tax</th>
                                    </tr>
                                    <tr>
                                        {formData.supplyType !== 'Intra-State' && <th style={{ width: '20%' }}>Integrated tax (₹) <span className="red-dot">*</span></th>}
                                        {formData.supplyType !== 'Inter-State' && <th style={{ width: '20%' }}>Central tax (₹) <span className="red-dot">*</span></th>}
                                        {formData.supplyType !== 'Inter-State' && <th style={{ width: '20%' }}>State/UT tax (₹) <span className="red-dot">*</span></th>}
                                        <th style={{ width: '20%' }}>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.itemDetails.map((item, index) => {
                                        const isZeroRate = item.rate === '0%';
                                        return (
                                        <tr key={index}>
                                            <td className="rate-cell">{item.rate}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.taxableValue}
                                                    onChange={(e) => handleItemChange(index, 'taxableValue', e.target.value)}
                                                />
                                            </td>
                                            {formData.supplyType !== 'Intra-State' && (
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.integratedTax}
                                                        onChange={(e) => handleItemChange(index, 'integratedTax', e.target.value)}
                                                        disabled={isZeroRate}
                                                        className={isZeroRate ? 'disabled-input' : ''}
                                                    />
                                                </td>
                                            )}
                                            {formData.supplyType !== 'Inter-State' && (
                                                <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.centralTax}
                                                        onChange={(e) => handleItemChange(index, 'centralTax', e.target.value)}
                                                        disabled={isZeroRate}
                                                        className={isZeroRate ? 'disabled-input' : ''}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.stateTax}
                                                        onChange={(e) => handleItemChange(index, 'stateTax', e.target.value)}
                                                        disabled={isZeroRate}
                                                        className={isZeroRate ? 'disabled-input' : ''}
                                                    />
                                                </td>
                                                </>
                                            )}
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.cess}
                                                    onChange={(e) => handleItemChange(index, 'cess', e.target.value)}
                                                    disabled={isZeroRate}
                                                    className={isZeroRate ? 'disabled-input' : ''}
                                                />
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="invoice-bottom-actions">
                        <button className="invoice-btn-outline" onClick={() => navigate('/returns/gstr1/b2b')}>BACK</button>
                        <button className="invoice-btn-primary" onClick={handleSave} disabled={isSaving}>
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

export default GSTR1B2BAddInvoice;
