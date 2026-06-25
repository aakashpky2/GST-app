import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1B2CLDashboard.css'; // B2CL specific styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import PageLoader from '../components/PageLoader';

const GSTR1B2CLDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_b2cl_invoices', trn);

                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    setInvoices([]);
                }
            } catch (error) {
                console.error("Failed to fetch B2CL invoices");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f5f5f5' }}>
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
            <div className="gstr1-main-content b2cl-main-content" style={{ width: '90%', margin: '15px auto 0 auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Cyan Header Banner */}
                    <div className="b2cl-header-banner" style={{ marginTop: 0 }}>
                        <div className="b2cl-header-top">
                            <h2 className="b2cl-title">5 - B2C (Large) Invoices</h2>
                            <div className="gstr1-header-actions">
                                <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                                <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        {/* Dynamic Records Box */}
                        {loading ? (
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
                                        {invoices.map((inv, idx) => {
                                            const items = inv.itemDetails || [];
                                            const totalTaxable = items.reduce((sum, item) => sum + (parseFloat(item.taxableValue) || 0), 0).toFixed(2);
                                            
                                            return (
                                                <tr key={inv.id || idx}>
                                                    <td>{inv.pos}</td>
                                                    <td>{inv.invoiceNo}</td>
                                                    <td>{inv.invoiceDate}</td>
                                                    <td>{inv.totalInvoiceValue}</td>
                                                    <td>{totalTaxable}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="b2cl-actions-row">
                            <button className="b2cl-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                            <button className="b2cl-btn-primary" onClick={() => navigate('/returns/auth/gstr1/b2cl/add')}>ADD RECORD</button>
                            <button className="b2cl-btn-primary">IMPORT EWB DATA</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar" style={{ marginTop: 0 }}>
                <div className="footer-left">© 2026-27 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 03-05-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
            
            {/* Scroll to top button */}
            <button 
                onClick={scrollToTop}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#1b2e4b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    zIndex: 1000
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </div>
        </>
    );
};

export default GSTR1B2CLDashboard;
