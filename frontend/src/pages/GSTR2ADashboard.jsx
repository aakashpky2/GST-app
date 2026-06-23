import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2ADashboard.css';

const GSTR2ADashboard = () => {
    const navigate = useNavigate();
    const [taxpayerInfo, setTaxpayerInfo] = useState({
        gstin: '...',
        legalName: '...',
        tradeName: '...',
        financialYear: '2025-26', // Mock or passed from previous screen
        returnPeriod: 'March'
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get('/auth/me');
                if (data?.success && data?.data) {
                    const user = data.data;
                    setTaxpayerInfo(prev => ({
                        ...prev,
                        gstin: user.gstin || localStorage.getItem('gst_trn') || '32AAICD8127A1Z4',
                        legalName: user.legal_name || 'GST USER',
                        tradeName: user.trade_name || 'GST USER TRADE'
                    }));
                }
            } catch (err) {
                console.warn('Failed to fetch user data', err);
            }
        };
        fetchUserData();
    }, []);

    const cards = {
        partA: [
            { title: 'B2B Invoices', route: '/returns/gstr2a/b2b-invoices' },
            { title: 'Credit/Debit Notes', route: '/returns/gstr2a/credit-debit-notes' },
            { title: 'Amendments to B2B Invoices', route: '/returns/gstr2a/amendments-b2b' },
            { title: 'Amendments to Credit/Debit Notes', route: '/returns/gstr2a/amendments-credit-debit' },
            { title: 'ECO Documents', route: '/returns/gstr2a/eco-documents' },
            { title: 'Amendments to ECO Documents', route: '/returns/gstr2a/amendments-eco-documents' },
        ],
        partB: [
            { title: 'ISD Credits', route: '/returns/gstr2a/isd-credits' },
            { title: 'Amendments to ISD Credits', route: '/returns/gstr2a/amendments-isd-credits' },
        ],
        partC: [
            { title: 'TDS Credits', route: '/returns/gstr2a/tds-credits' },
            { title: 'Amendments to TDS Credits', route: '/returns/gstr2a/amendments-tds-credits' },
            { title: 'TCS Credits', route: '/returns/gstr2a/tcs-credits' },
        ],
        partD: [
            { title: 'Import of goods from overseas on bill of entry', route: '/returns/gstr2a/import-goods-overseas' },
            { title: 'Import of goods from SEZ units / developers on bill of entry', route: '/returns/gstr2a/import-sez' },
        ]
    };

    return (
        <div className="gstr2a-container">
            {/* Breadcrumb Bar */}
            <div className="gstr2a-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <span>GSTR2A</span>
            </div>

            <div className="gstr2a-card">
                <h2 className="gstr2a-title">GSTR2A - AUTO DRAFTED DETAILS</h2>

                {/* Taxpayer Details Header */}
                <div className="gstr2a-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Legal Name:</strong> {taxpayerInfo.legalName}</div>
                        <div className="tp-item"><strong>Trade Name:</strong> {taxpayerInfo.tradeName}</div>
                    </div>
                    <div className="tp-row">
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                        <div className="tp-item"><strong>Return Period:</strong> {taxpayerInfo.returnPeriod}</div>
                    </div>
                </div>

                {/* Information Alerts */}
                <div className="gstr2a-alerts">
                    <div className="alert-blue">
                        <span className="info-icon">ℹ</span>
                        <span>You can only view details of inward supplies in GSTR-2A.</span>
                    </div>
                    <div className="alert-note">
                        <strong>Note:</strong> In case supplier is regular taxpayer, the filing status and date will be based on data saved or filed in GSTR1A otherwise based on GSTR1.
                    </div>
                </div>

                {/* PART-A */}
                <div className="gstr2a-part-section">
                    <h3 className="part-title">PART-A</h3>
                    <div className="gstr2a-cards-grid">
                        {cards.partA.map((card, idx) => (
                            <div key={idx} className="gstr2a-nav-card" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART-B */}
                <div className="gstr2a-part-section">
                    <h3 className="part-title">PART-B</h3>
                    <div className="gstr2a-cards-grid">
                        {cards.partB.map((card, idx) => (
                            <div key={idx} className="gstr2a-nav-card" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART-C */}
                <div className="gstr2a-part-section">
                    <h3 className="part-title">PART-C</h3>
                    <div className="gstr2a-cards-grid">
                        {cards.partC.map((card, idx) => (
                            <div key={idx} className="gstr2a-nav-card" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART-D */}
                <div className="gstr2a-part-section">
                    <h3 className="part-title">PART-D</h3>
                    <div className="gstr2a-cards-grid">
                        {cards.partD.map((card, idx) => (
                            <div key={idx} className="gstr2a-nav-card" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="gstr2a-actions">
                    <button className="gstr2a-btn-back" onClick={() => navigate('/returns-dashboard')}>BACK</button>
                    <button className="gstr2a-btn-download" onClick={() => navigate('/returns/gstr2a/offline-download')}>DOWNLOAD</button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2ADashboard;
