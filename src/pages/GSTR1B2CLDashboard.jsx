import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1B2CLDashboard.css'; // Specific styles for this page
import api from '../api/axios';

const GSTR1B2CLDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/GSTR1_B2CL_Invoices`);

                if (res.data.success && res.data.data) {
                    if (Array.isArray(res.data.data.invoices)) {
                        setInvoices(res.data.data.invoices);
                    } else if (Array.isArray(res.data.data)) {
                        setInvoices(res.data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch B2CL invoices");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    return (
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
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
            <div className="gstr1-main-content b2cl-main-content">
                {/* Cyan Header Banner */}
                <div className="b2cl-header-banner">
                    <div className="b2cl-header-top">
                        <h2 className="b2cl-title">5 - B2C (Large) Invoices</h2>
                        <div className="gstr1-header-actions">
                            <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                            <button className="gstr1-btn-icon">↻</button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Records Box */}
                {isLoading ? (
                    <div className="b2cl-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                ) : invoices.length === 0 ? (
                    <div className="b2cl-empty-records">
                        There are no records to be displayed.
                    </div>
                ) : (
                    <div className="b2cl-records-table-container">
                        <table className="b2cl-records-table">
                            <thead>
                                <tr>
                                    <th>POS</th>
                                    <th>Invoice No.</th>
                                    <th>Invoice Date</th>
                                    <th>Total Invoice Value (₹)</th>
                                    <th>Taxable Value (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, idx) => (
                                    <tr key={inv.id || idx}>
                                        <td>{inv.pos}</td>
                                        <td>{inv.invoiceNo}</td>
                                        <td>{inv.invoiceDate}</td>
                                        <td>{inv.totalInvoiceValue}</td>
                                        <td>{inv.taxableValue || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="b2cl-actions-row">
                    <button className="b2cl-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button className="b2cl-btn-primary" onClick={() => navigate('/returns/gstr1/b2cl/add')}>ADD RECORD</button>
                    <button className="b2cl-btn-primary">IMPORT EWB DATA</button>
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

export default GSTR1B2CLDashboard;
