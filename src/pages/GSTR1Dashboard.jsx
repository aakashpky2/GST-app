import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css';
import api from '../api/axios';
import toast from 'react-hot-toast';

const subMenus = {
    services: [
        { label: 'Registration', to: '/registration' },
        { label: 'Ledgers', to: '#' },
        { label: 'Returns', to: '#' },
        { label: 'Payments', to: '#' },
        { label: 'User Services', to: '#' },
        { label: 'Refunds', to: '#' },
        { label: 'e-Way Bill System', to: '#' },
        { label: 'Track Application Status', to: '#' },
    ],
    downloads: [
        { label: 'Offline Tools', to: '#' },
        { label: 'Accounting and Billing Software', to: '#' },
    ],
    search: [
        { label: 'Search by GSTIN/UIN', to: '#' },
        { label: 'Search by PAN', to: '#' },
        { label: 'Search Temporary ID', to: '#' },
        { label: 'Search Composition Taxpayer', to: '#' },
    ],
};

const GSTR1Dashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [b2bCount, setB2bCount] = useState(0);
    const [b2clCount, setB2clCount] = useState(0);
    const [exportsCount, setExportsCount] = useState(0);
    const [b2csCount, setB2csCount] = useState(0);
    const [nilRatedCount, setNilRatedCount] = useState(0);
    const [cdnrCount, setCdnrCount] = useState(0);
    const [cdnurCount, setCdnurCount] = useState(0);
    const [advTaxCount, setAdvTaxCount] = useState(0);
    const [adjAdvancesCount, setAdjAdvancesCount] = useState(0);
    const [hsnCount, setHsnCount] = useState(0);
    const [docsCount, setDocsCount] = useState(0);
    const [ecoCount, setEcoCount] = useState(0);
    const [sup95Count, setSup95Count] = useState(0);
    const [isNilFile, setIsNilFile] = useState(false);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

                // B2B count
                const resB2b = await api.get(`/forms/tab/${trn}/GSTR1_B2B_Invoices`);
                if (resB2b.data.success && resB2b.data.data) {
                    const invs = resB2b.data.data.invoices || resB2b.data.data;
                    setB2bCount(Array.isArray(invs) ? invs.length : 0);
                }

                // B2CL count
                const resB2cl = await api.get(`/forms/tab/${trn}/GSTR1_B2CL_Invoices`);
                if (resB2cl.data.success && resB2cl.data.data) {
                    const invs = resB2cl.data.data.invoices || resB2cl.data.data;
                    setB2clCount(Array.isArray(invs) ? invs.length : 0);
                }

                // Exports count
                const resExp = await api.get(`/forms/tab/${trn}/GSTR1_Exports_Invoices`);
                if (resExp.data.success && resExp.data.data) {
                    const invs = resExp.data.data.invoices || resExp.data.data;
                    setExportsCount(Array.isArray(invs) ? invs.length : 0);
                }

                // B2CS count
                const resB2cs = await api.get(`/forms/tab/${trn}/GSTR1_B2CS_Invoices`);
                if (resB2cs.data.success && resB2cs.data.data) {
                    const invs = resB2cs.data.data.invoices || resB2cs.data.data;
                    setB2csCount(Array.isArray(invs) ? invs.length : 0);
                }

                // Nil Rated count
                const resNil = await api.get(`/forms/tab/${trn}/GSTR1_NilRated_Supplies`);
                if (resNil.data.success && resNil.data.data) {
                    const invs = resNil.data.data.invoices || resNil.data.data;
                    setNilRatedCount(Array.isArray(invs) ? invs.length : 0);
                }

                // CDNR count
                const resCdnr = await api.get(`/forms/tab/${trn}/GSTR1_CDNR_Invoices`);
                if (resCdnr.data.success && resCdnr.data.data) {
                    const invs = resCdnr.data.data.invoices || resCdnr.data.data;
                    setCdnrCount(Array.isArray(invs) ? invs.length : 0);
                }

                // CDNUR count
                const resCdnur = await api.get(`/forms/tab/${trn}/GSTR1_CDNUR_Invoices`);
                if (resCdnur.data.success && resCdnur.data.data) {
                    const invs = resCdnur.data.data.invoices || resCdnur.data.data;
                    setCdnurCount(Array.isArray(invs) ? invs.length : 0);
                }

                // Adv Tax count
                const resAdvTax = await api.get(`/forms/tab/${trn}/GSTR1_AdvTax_Invoices`);
                if (resAdvTax.data.success && resAdvTax.data.data) {
                    const records = resAdvTax.data.data.records || resAdvTax.data.data;
                    setAdvTaxCount(Array.isArray(records) ? records.length : 0);
                }

                // Adj Advances count
                const resAdjAdvances = await api.get(`/forms/tab/${trn}/GSTR1_AdjAdvances_Invoices`);
                if (resAdjAdvances.data.success && resAdjAdvances.data.data) {
                    const records = resAdjAdvances.data.data.records || resAdjAdvances.data.data;
                    setAdjAdvancesCount(Array.isArray(records) ? records.length : 0);
                }

                // HSN count
                const resHsnB2B = await api.get(`/forms/tab/${trn}/GSTR1_HSN_B2B`);
                const resHsnB2C = await api.get(`/forms/tab/${trn}/GSTR1_HSN_B2C`);
                let hsnTotal = 0;
                if (resHsnB2B.data.success && resHsnB2B.data.data) {
                    const recs = resHsnB2B.data.data.records || (Array.isArray(resHsnB2B.data.data) ? resHsnB2B.data.data : []);
                    hsnTotal += recs.length;
                }
                if (resHsnB2C.data.success && resHsnB2C.data.data) {
                    const recs = resHsnB2C.data.data.records || (Array.isArray(resHsnB2C.data.data) ? resHsnB2C.data.data : []);
                    hsnTotal += recs.length;
                }
                setHsnCount(hsnTotal);

                // Documents count
                const resDocs = await api.get(`/forms/tab/${trn}/GSTR1_Docs_Issued`);
                if (resDocs.data.success && resDocs.data.data) {
                    const docs = resDocs.data.data.documents || [];
                    setDocsCount(Array.isArray(docs) ? docs.length : 0);
                }

                // ECO count
                const resEcoTcs = await api.get(`/forms/tab/${trn}/GSTR1_ECO_TCS`);
                const resEcoPay = await api.get(`/forms/tab/${trn}/GSTR1_ECO_PAY`);
                let ecoTotal = 0;
                if (resEcoTcs.data.success && resEcoTcs.data.data) {
                    const recs = resEcoTcs.data.data.records || (Array.isArray(resEcoTcs.data.data) ? resEcoTcs.data.data : []);
                    ecoTotal += recs.length;
                }
                if (resEcoPay.data.success && resEcoPay.data.data) {
                    const recs = resEcoPay.data.data.records || (Array.isArray(resEcoPay.data.data) ? resEcoPay.data.data : []);
                    ecoTotal += recs.length;
                }
                setEcoCount(ecoTotal);

                // Section 9(5) count
                const sup95Tabs = ['GSTR1_SUP95_R2R', 'GSTR1_SUP95_R2NR', 'GSTR1_SUP95_NR2R', 'GSTR1_SUP95_NR2NR'];
                let sup95Total = 0;
                await Promise.all(sup95Tabs.map(async (tab) => {
                    const res = await api.get(`/forms/tab/${trn}/${tab}`);
                    if (res.data.success && res.data.data) {
                        const recs = res.data.data.records || (Array.isArray(res.data.data) ? res.data.data : []);
                        sup95Total += recs.length;
                    }
                }));
                setSup95Count(sup95Total);
            } catch (error) {
                console.error("Failed to fetch invoice counts");
            }
        };
        fetchCounts();
    }, []);

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset all GSTR-1 data for this period? This will permanently delete all saved invoices, HSN summaries, and documents.")) return;

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await api.delete(`/forms/reset/${trn}`);
            if (res.data.success) {
                toast.success('GSTR-1 data reset successfully');

                // Immediately reset frontend counts
                setB2bCount(0);
                setB2clCount(0);
                setExportsCount(0);
                setB2csCount(0);
                setNilRatedCount(0);
                setCdnrCount(0);
                setCdnurCount(0);
                setAdvTaxCount(0);
                setAdjAdvancesCount(0);
                setHsnCount(0);
                setDocsCount(0);
                setEcoCount(0);
                setSup95Count(0);

                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            console.error("Reset failed", error);
            toast.error('Failed to reset GSTR-1 data');
        }
    };

    // Displaying count in the card:
    // {index === 0 ? b2bCount : (index === 1 ? b2clCount : (index === 2 ? exportsCount : (index === 3 ? b2csCount : (index === 4 ? nilRatedCount : (index === 5 ? cdnrCount : (index === 6 ? cdnurCount : (index === 7 ? advTaxCount : (index === 8 ? adjAdvancesCount : (index === 9 ? hsnCount : 0))))))))))}


    const toggleMenu = (menu) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const recordCards = [
        "4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices",
        "5 - B2C (Large) Invoices",
        "6A - Exports Invoices",
        "7 - B2C (Others)",
        "8A, 8B, 8C, 8D - Nil Rated Supplies",
        "9B - Credit / Debit Notes (Registered)",
        "9B - Credit / Debit Notes (Unregistered)",
        "11A(1), 11A(2) - Tax Liability (Advances Received)",
        "11B(1), 11B(2) - Adjustment of Advances",
        "12 - HSN-wise summary of outward supplies",
        "13 - Documents Issued",
        "14 - Supplies made through ECO",
        "15 - Supplies U/s 9(5)"
    ];

    return (
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>GSTR-1/IFF</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content">
                {/* Header Banner - Cyan */}
                <div className="gstr1-header-banner">
                    <h2 className="gstr1-title">GSTR-1 - Details of outward supplies of goods or services</h2>
                    <div className="gstr1-header-actions">
                        <button className="gstr1-btn-secondary">E-INVOICE ADVISORY</button>
                        <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                        <button className="gstr1-btn-icon">↻</button>
                    </div>
                </div>

                {/* Info Block */}
                <div className="gstr1-info-block">
                    <div className="info-column">
                        <p><span>GSTIN</span> - 32AAICD8127A1Z4</p>
                        <p><span>FY</span> - 2025-26</p>
                    </div>
                    <div className="info-column">
                        <p><span>Legal Name</span> - D MIX MEDIA PRIVATE LIMITED</p>
                        <p><span>Tax Period</span> - March</p>
                    </div>
                    <div className="info-column">
                        <p><span>Trade Name</span> -</p>
                        <p><span>Status</span> - Not Filed</p>
                    </div>
                    <div className="info-column text-right">
                        <p className="mandatory-note"><span className="red-dot">•</span> Indicates Mandatory Fields</p>
                        <p><span>Due Date</span> - 11/04/2026</p>
                    </div>
                </div>

                {/* Nil Checkbox */}
                <div className="gstr1-checkbox-strip">
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: '#333' }}>
                        <input 
                            type="checkbox" 
                            style={{ marginRight: '10px', width: '16px', height: '16px' }} 
                            checked={isNilFile}
                            onChange={(e) => setIsNilFile(e.target.checked)}
                        />
                        File Nil GSTR-1
                    </label>
                </div>

                {isNilFile && (
                    <div className="nil-note-box" style={{ backgroundColor: '#eef2ff', border: '1px solid #3b82f6', padding: '15px 20px', borderRadius: '4px', margin: '15px 0' }}>
                        <h4 style={{ color: '#1e40af', margin: '0 0 10px 0', fontSize: '15px' }}>Note: NIL Form GSTR-1 can be filed by you if you have:</h4>
                        <ol type="a" style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
                            <li>No Outward Supplies (including supplies on which tax is to be charged on reverse charge basis, zero rated supplies and deemed exports) during the month or quarter for which the form is being filed for</li>
                            <li>No Amendments to be made to any of the supplies declared in an earlier form</li>
                            <li>No Credit or Debit Notes to be declared / amended</li>
                            <li>No details of advances received for services is to be declared or adjusted</li>
                        </ol>
                    </div>
                )}

                {!isNilFile && (
                    <>
                        {/* Add Record Details Accordion */}
                        <div className="gstr1-accordion open">
                            <div className="accordion-header">
                                <h3>ADD RECORD DETAILS</h3>
                                <span className="accordion-icon">▲</span>
                            </div>
                            <div className="accordion-body">
                                <div className="record-cards-grid">
                                    {recordCards.map((title, index) => (
                                        <div
                                            className="record-card"
                                            key={index}
                                            onClick={() => {
                                                if (index === 0) navigate('/returns/gstr1/b2b');
                                                else if (index === 1) navigate('/returns/gstr1/b2cl');
                                                else if (index === 2) navigate('/returns/gstr1/exports');
                                                else if (index === 3) navigate('/returns/gstr1/b2cs');
                                                else if (index === 4) navigate('/returns/gstr1/nilrated/add');
                                                else if (index === 5) navigate('/returns/gstr1/cdnr');
                                                else if (index === 6) navigate('/returns/gstr1/cdnur');
                                                else if (index === 7) navigate('/returns/gstr1/advtax');
                                                else if (index === 8) navigate('/returns/gstr1/adjadvances');
                                                else if (index === 9) navigate('/returns/gstr1/hsn');
                                                else if (index === 10) navigate('/returns/gstr1/documents');
                                                else if (index === 11) navigate('/returns/gstr1/eco');
                                                else if (index === 12) navigate('/returns/gstr1/sup95');
                                            }}
                                            style={{ cursor: (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 6 || index === 7 || index === 8 || index === 9 || index === 10 || index === 11 || index === 12) ? 'pointer' : 'default' }}
                                        >
                                            <div className="record-card-top">
                                                <h4>{title}</h4>
                                            </div>
                                            <div className="record-card-bottom">
                                                <div className="record-status-badge">
                                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4caf50', marginRight: '6px' }}>
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                    <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '15px' }}>
                                                        {index === 0 ? b2bCount : (index === 1 ? b2clCount : (index === 2 ? exportsCount : (index === 3 ? b2csCount : (index === 4 ? nilRatedCount : (index === 5 ? cdnrCount : (index === 6 ? cdnurCount : (index === 7 ? advTaxCount : (index === 8 ? adjAdvancesCount : (index === 9 ? hsnCount : (index === 10 ? docsCount : (index === 11 ? ecoCount : (index === 12 ? sup95Count : 0))))))))))))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Amend Record Details Accordion */}
                        <div className="gstr1-accordion">
                            <div className="accordion-header">
                                <h3>AMEND RECORD DETAILS</h3>
                                <span className="accordion-icon">▼</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Info Alert */}
                <div className="gstr1-bottom-alert">
                    <span className="info-icon" style={{ marginRight: '10px' }}>i</span>
                    <p className="alert-text">
                        The taxpayers for whom e-invoicing is not applicable may ignore the sections/options related to e-invoice download. The downloaded file would be blank in case taxpayer is not e-invoicing or when e-invoices reported to IRP are yet to be processed by GST system
                    </p>
                </div>

                {!isNilFile && (
                    <div className="gstr1-accordion">
                        <div className="accordion-header">
                            <h3>E-INVOICE DOWNLOAD HISTORY</h3>
                            <span className="accordion-icon">▼</span>
                        </div>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="gstr1-bottom-actions">
                    <button className="gstr1-btn-outline" onClick={() => navigate('/returns-dashboard')}>BACK</button>
                    <button className="gstr1-btn-primary">DOWNLOAD DETAILS FROM E-INVOICES (EXCEL)</button>
                    <button className="gstr1-btn-primary" onClick={handleReset}>RESET</button>
                    <button className="gstr1-btn-primary" onClick={() => navigate('/returns/gstr1/summary')}>GENERATE SUMMARY</button>
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

export default GSTR1Dashboard;
