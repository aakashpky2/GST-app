import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; 
import './GSTR1Dashboard.css';
import './GSTR1Summary.css';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GSTR1Summary = () => {
    const navigate = useNavigate();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/gstr1-summary/${trn}`);
                if (res.data.success) {
                    setSummaryData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch summary", error);
                toast.error("Failed to load summary data");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Summary...</div>;
    }

    const s = summaryData || {};

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>Summary</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                    <button className="gstr1-btn-icon" style={{ marginLeft: '10px' }}>↻</button>
                </div>
            </div>

            <div className="gstr1-summary-content">
                {/* Header Banner - Cyan */}
                <div className="gstr1-header-banner" style={{ background: '#fff', borderBottom: '2px solid #26a69a' }}>
                    <h2 className="gstr1-summary-title" style={{ color: '#333' }}>GSTR-1/IFF Summary</h2>
                </div>

                {/* Info Block */}
                <div className="gstr1-info-block" style={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div className="info-column">
                        <p><span>GSTIN</span> - 32AAICD8127A1Z4</p>
                        <p><span>FY</span> - 2025-26</p>
                    </div>
                    <div className="info-column">
                        <p><span>Legal Name</span> - D MIX MEDIA PRIVATE LIMITED</p>
                        <p><span>Tax Period</span> - September</p>
                    </div>
                    <div className="info-column">
                        <p><span>Trade Name</span> -</p>
                        <p><span>Status</span> - Filed</p>
                    </div>
                </div>

                <div className="consolidated-summary-header">
                    <h3>CONSOLIDATED SUMMARY</h3>
                    <span>▲</span>
                </div>

                <div className="summary-table-container">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Description <span className="blue-subtext">[Expand All <span style={{ fontSize: '10px' }}>▼</span>]</span></th>
                                <th>No. of records</th>
                                <th>Document Type</th>
                                <th>Value (₹)</th>
                                <th>Integrated tax (₹)</th>
                                <th>Central tax (₹)</th>
                                <th>State/UT tax (₹)</th>
                                <th>Cess (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* B2B Section */}
                            <tr className="section-row-main">
                                <td colSpan="8">4A - Taxable outward supplies made to registered persons (other than reverse charge supplies) including supplies made through e-commerce operator attracting TCS - B2B Regular</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.b2b?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.b2b?.value)}</td>
                                <td>{formatCurr(s.b2b?.igst)}</td>
                                <td>{formatCurr(s.b2b?.cgst)}</td>
                                <td>{formatCurr(s.b2b?.sgst)}</td>
                                <td>{formatCurr(s.b2b?.cess)}</td>
                            </tr>
                            <tr>
                                <td colSpan="8" style={{ paddingLeft: '30px' }}>Recipient wise summary <span style={{ fontSize: '10px' }}>▼</span></td>
                            </tr>

                            {/* B2B Reverse Charge */}
                            <tr className="section-row-main">
                                <td colSpan="8">4B - Taxable outward supplies made to registered persons attracting tax on reverse charge - B2B Reverse charge</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.b2bReverse?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.b2bReverse?.value)}</td>
                                <td>{formatCurr(s.b2bReverse?.igst)}</td>
                                <td>{formatCurr(s.b2bReverse?.cgst)}</td>
                                <td>{formatCurr(s.b2bReverse?.sgst)}</td>
                                <td>{formatCurr(s.b2bReverse?.cess)}</td>
                            </tr>

                            {/* B2CL */}
                            <tr className="section-row-main">
                                <td colSpan="8">5 - Taxable outward inter-state supplies made to unregistered persons (where invoice value is more than Rs. 1 lakh) including supplies made through e-commerce operator, rate wise - B2CL (Large)</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.b2cl?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.b2cl?.value)}</td>
                                <td>{formatCurr(s.b2cl?.igst)}</td>
                                <td className="gray-cell">0.00</td>
                                <td className="gray-cell">0.00</td>
                                <td>{formatCurr(s.b2cl?.cess)}</td>
                            </tr>

                            {/* Exports */}
                            <tr className="section-row-main">
                                <td colSpan="8">6A - Exports</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.exports?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.exports?.value)}</td>
                                <td>{formatCurr(s.exports?.igst)}</td>
                                <td className="gray-cell">0.00</td>
                                <td className="gray-cell">0.00</td>
                                <td>{formatCurr(s.exports?.cess)}</td>
                            </tr>

                            {/* SEZ */}
                            <tr className="section-row-main">
                                <td colSpan="8">6B - Supplies made to SEZ unit or SEZ developer - SEZWP/SEZWOP</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.sez?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.sez?.value)}</td>
                                <td>{formatCurr(s.sez?.igst)}</td>
                                <td className="gray-cell">0.00</td>
                                <td className="gray-cell">0.00</td>
                                <td>{formatCurr(s.sez?.cess)}</td>
                            </tr>

                            {/* Deemed Exports */}
                            <tr className="section-row-main">
                                <td colSpan="8">6C - Deemed Exports - DE</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.deemedExports?.records || 0}</td>
                                <td>Invoice</td>
                                <td>{formatCurr(s.deemedExports?.value)}</td>
                                <td>{formatCurr(s.deemedExports?.igst)}</td>
                                <td>{formatCurr(s.deemedExports?.cgst)}</td>
                                <td>{formatCurr(s.deemedExports?.sgst)}</td>
                                <td>{formatCurr(s.deemedExports?.cess)}</td>
                            </tr>

                            {/* B2CS */}
                            <tr className="section-row-main">
                                <td colSpan="8">7 - Taxable supplies (Net of debit and credit notes) to unregistered persons (other than the supplies covered in Table 5) including supplies made through e-commerce operator attracting TCS - B2CS (Others)</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.b2cs?.records || 0}</td>
                                <td>Net Value</td>
                                <td>{formatCurr(s.b2cs?.value)}</td>
                                <td>{formatCurr(s.b2cs?.igst)}</td>
                                <td>{formatCurr(s.b2cs?.cgst)}</td>
                                <td>{formatCurr(s.b2cs?.sgst)}</td>
                                <td>{formatCurr(s.b2cs?.cess)}</td>
                            </tr>

                            {/* Nil Rated */}
                            <tr className="section-row-main">
                                <td colSpan="8">8 - Nil rated, exempted and non GST outward supplies</td>
                            </tr>
                            <tr>
                                <td colSpan="3">Total</td>
                                <td>{formatCurr(s.nilRated?.value + s.nilRated?.exempted + s.nilRated?.nonGst)}</td>
                                <td className="gray-cell"></td>
                                <td className="gray-cell"></td>
                                <td className="gray-cell"></td>
                                <td className="gray-cell"></td>
                            </tr>

                            {/* 15A Section 9(5) based on image */}
                            <tr className="section-row-main">
                                <td colSpan="8">15A (I) - Amended Supplies U/s 9(5) - For Registered Recipients</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{s.sup95?.records || 0}</td>
                                <td>Document</td>
                                <td>{formatCurr(s.sup95?.value)}</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                            </tr>

                            {/* Grand Total */}
                            <tr className="total-row">
                                <td colSpan="3">Total Liability (Outward supplies other than Reverse charge)</td>
                                <td>{formatCurr((s.b2b?.value || 0) + (s.b2cl?.value || 0) + (s.exports?.value || 0) + (s.sez?.value || 0) + (s.deemedExports?.value || 0) + (s.b2cs?.value || 0) + (s.sup95?.value || 0))}</td>
                                <td>{formatCurr((s.b2b?.igst || 0) + (s.b2cl?.igst || 0) + (s.exports?.igst || 0) + (s.sez?.igst || 0) + (s.deemedExports?.igst || 0) + (s.b2cs?.igst || 0))}</td>
                                <td>{formatCurr((s.b2b?.cgst || 0) + (s.deemedExports?.cgst || 0) + (s.b2cs?.cgst || 0))}</td>
                                <td>{formatCurr((s.b2b?.sgst || 0) + (s.deemedExports?.sgst || 0) + (s.b2cs?.sgst || 0))}</td>
                                <td>{formatCurr((s.b2b?.cess || 0) + (s.b2cl?.cess || 0) + (s.exports?.cess || 0) + (s.sez?.cess || 0) + (s.deemedExports?.cess || 0) + (s.b2cs?.cess || 0))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="summary-actions-bottom">
                    <button className="btn-summary btn-summary-back" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button className="btn-summary btn-summary-pdf">DOWNLOAD (PDF)</button>
                    <button className="btn-summary btn-summary-file">FILE STATEMENT</button>
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

export default GSTR1Summary;
