import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './ReasonForChallan.css';

const ReasonForChallan = () => {
    const navigate = useNavigate();
    const [reason, setReason] = useState(''); // 'monthly' or 'any'
    const [finYear, setFinYear] = useState('2025-26');
    const [period, setPeriod] = useState('February');
    const [challanType, setChallanType] = useState(''); // '35' or 'self'
    const [showLedger, setShowLedger] = useState(false);

    const handleReasonChange = (e) => {
        setReason(e.target.value);
        if (e.target.value === 'any') {
            setChallanType('');
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#167dc2' }}>Payment</span>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>Reason for challan</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="challan-main-content">
                <div className="challan-header-flex">
                    <h2 className="challan-title">Reason For Challan</h2>
                    <div className="challan-header-actions">
                        <button className="challan-btn-help">HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 3px', marginLeft: '3px' }}>?</span></button>
                        <button className="challan-refresh-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="challan-body-card">
                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates mandatory fields</span>
                    </div>

                    <div className="challan-form-section">
                        <div className="form-row">
                            <label className="main-label">Reason For Challan <span className="red-dot">*</span> :</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value="monthly"
                                        checked={reason === 'monthly'}
                                        onChange={handleReasonChange}
                                    />
                                    Monthly payment for quarterly return
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value="any"
                                        checked={reason === 'any'}
                                        onChange={handleReasonChange}
                                    />
                                    Any other payment
                                </label>
                            </div>
                        </div>

                        {reason === 'monthly' && (
                            <>
                                <div className="form-row dropdown-row">
                                    <div className="dropdown-group">
                                        <label>Financial Year <span className="red-dot">*</span></label>
                                        <select value={finYear} onChange={(e) => setFinYear(e.target.value)}>
                                            <option value="2025-26">2025-26</option>
                                        </select>
                                    </div>
                                    <div className="dropdown-group">
                                        <label>Period <span className="red-dot">*</span></label>
                                        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                            <option value="February">February</option>
                                            <option value="January">January</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <label className="main-label">Challan Type <span className="red-dot">*</span> :</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="challanType"
                                                value="35"
                                                checked={challanType === '35'}
                                                onChange={(e) => setChallanType(e.target.value)}
                                            />
                                            35 % Challan
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="challanType"
                                                value="self"
                                                checked={challanType === 'self'}
                                                onChange={(e) => setChallanType(e.target.value)}
                                            />
                                            Challan on self-assessment basis
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {reason === 'monthly' && challanType && (
                            <div className="info-banner-blue">
                                <span className="info-icon">ℹ️</span>
                                {challanType === '35'
                                    ? "As per Law, no interest shall be levied for the selected month if payment is made by 25th of the next month or the extended date, if any"
                                    : "Interest will be levied, as per Law, in case of payment made through other than 35% challan."
                                }
                            </div>
                        )}

                        <div className="challan-action-row">
                            <button className="btn-ledger" onClick={() => setShowLedger(!showLedger)}>
                                VIEW LEDGER BALANCE <span className={`arrow ${showLedger ? 'up' : 'down'}`}>▼</span>
                            </button>
                            <button className={`btn-proceed ${(!reason || (reason === 'monthly' && !challanType)) ? 'disabled' : ''}`}>
                                PROCEED
                            </button>
                        </div>

                        {showLedger && (
                            <div className="ledger-table-container">
                                <div className="ledger-date">Ledger Balance as on date : 11-03-2026</div>
                                <table className="ledger-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2">Type of Ledger</th>
                                            <th colSpan="5">Available Balance (₹)</th>
                                        </tr>
                                        <tr>
                                            <th>Integrated Tax (₹)</th>
                                            <th>Central Tax (₹)</th>
                                            <th>State Tax (₹)</th>
                                            <th>CESS (₹)</th>
                                            <th>Total (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Electronic Cash Ledger</td>
                                            <td>0.00</td>
                                            <td>0.00</td>
                                            <td>0.00</td>
                                            <td>0.00</td>
                                            <td style={{ color: '#167dc2', fontWeight: 'bold' }}>0.00</td>
                                        </tr>
                                        <tr>
                                            <td>Electronic Credit Ledger</td>
                                            <td>0.00</td>
                                            <td>1,58,671.00</td>
                                            <td>1,58,670.00</td>
                                            <td>0.00</td>
                                            <td style={{ color: '#167dc2', fontWeight: 'bold' }}>3,17,341.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="challan-notes">
                            <p><strong>Note: For taxpayer filing GSTR-3B on quarterly basis:</strong></p>
                            <ol>
                                <li>To make payment for the first (M1) and second (M2) months of the quarter, please select reason as 'Monthly Payment for Quarterly Return' and the relevant period (financial year, month) and choose whether to pay through 35% challan or self-assessment challan.</li>
                                <li>To make payment for the third month of the Quarter (M3), please use 'Create Challan' option in payment Table-6 of Form GSTR-3B Quarterly. An auto-populated challan amounting to liabilities for the quarter net off credit utilization and existing cash balance can be generated and used to offset liabilities.</li>
                            </ol>
                            <p>
                                <Link to="#" style={{ color: '#167dc2', textDecoration: 'none' }}>Click here</Link> for navigation to 'Return Dashboard' and prepare GSTR-3B Quarterly. Filing of GSTR-3B Quarterly available in the third month of the quarter is mandatory.<br />
                                *For adding cash to Electronic Cash Ledger, already established procedure may be followed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 22-11-2025</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default ReasonForChallan;
