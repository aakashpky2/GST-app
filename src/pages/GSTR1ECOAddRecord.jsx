import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1ECOSupplies.css';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1ECOAddRecord = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'TCS'; // TCS or PAY

    const [formData, setFormData] = useState({
        gstin: '',
        tradeName: '',
        netValue: '',
        integratedTax: '',
        centralTax: '',
        stateTax: '',
        cess: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.gstin || !formData.netValue) {
            toast.error('Please fill mandatory fields');
            return;
        }

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const tabName = type === 'TCS' ? 'GSTR1_ECO_TCS' : 'GSTR1_ECO_PAY';

            // Get existing records
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
                toast.success('Record saved successfully!');
                navigate(`/returns/gstr1/eco?type=${type}`);
            }
        } catch (err) {
            toast.error('Error saving record');
        }
    };

    const title = type === 'TCS'
        ? "14 - Supplies made through E-Commerce Operators - u/s 52 (TCS) - Add Details"
        : "14 - Supplies made through E-Commerce Operators - u/s 9(5) - Add Details";

    const breadcrumbType = type === 'TCS' ? "u/s 52 (TCS)" : "u/s 9(5)";

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
                    <Link to="/returns/gstr1/eco" style={{ textDecoration: 'none', color: '#167dc2' }}>Supplies through ECO</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>{breadcrumbType}</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="eco-main-content">
                <div className="eco-header-banner">
                    <div className="eco-header-flex">
                        <h2 className="eco-title">{title}</h2>
                    </div>
                </div>

                <div className="eco-body">
                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates Mandatory Fields</span>
                    </div>

                    <div className="eco-form-grid">
                        <div className="eco-form-group">
                            <label>GSTIN of e-commerce operator <span className="red-dot">*</span></label>
                            <input type="text" name="gstin" placeholder="Enter GSTIN" value={formData.gstin} onChange={handleChange} />
                        </div>
                        <div className="eco-form-group">
                            <label>Trade/Legal Name <span className="red-dot">*</span></label>
                            <input type="text" name="tradeName" className="disabled-input" value={formData.tradeName} onChange={handleChange} />
                        </div>
                        <div className="eco-form-group">
                            <label>Net value of supplies (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="netValue" value={formData.netValue} onChange={handleChange} />
                        </div>

                        <div className="eco-form-group">
                            <label>Integrated tax (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="integratedTax" value={formData.integratedTax} onChange={handleChange} />
                        </div>
                        <div className="eco-form-group">
                            <label>Central tax (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="centralTax" value={formData.centralTax} onChange={handleChange} />
                        </div>
                        <div className="eco-form-group">
                            <label>State/UT tax (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="stateTax" value={formData.stateTax} onChange={handleChange} />
                        </div>

                        <div className="eco-form-group">
                            <label>Cess (₹)</label>
                            <input type="text" name="cess" value={formData.cess} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="eco-action-row" style={{ justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
                        <button className="eco-btn-outline" style={{ padding: '8px 40px' }} onClick={() => navigate(`/returns/gstr1/eco?type=${type}`)}>BACK</button>
                        <button className="eco-btn-primary" style={{ padding: '8px 40px', backgroundColor: '#2b4b7c' }} onClick={handleSave}>SAVE</button>
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

export default GSTR1ECOAddRecord;
