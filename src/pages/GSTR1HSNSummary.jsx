import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1HSNSummary.css';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1HSNSummary = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('B2B');
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        hsn: '',
        description: '',
        productNameMaster: '',
        descriptionAsPerHSN: '',
        uqc: '',
        totalQuantity: '',
        totalTaxableValue: '',
        rate: '',
        integratedTax: '',
        centralTax: '',
        stateTax: '',
        cess: ''
    });

    const rates = ["0%", "0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"];
    const uqcOptions = ["BAG-BAGS", "BAL-BALE", "BDL-BUNDLES", "BKL-BUCKLES", "BOU-BILLIONS OF UNITS", "BOX-BOX", "BTL-BOTTLES", "BUN-BUNCHES", "CAN-CANS", "CBM-CUBIC METERS", "CCM-CUBIC CENTIMETERS", "CMS-CENTIMETERS", "CTN-CARTONS", "DOZ-DOZENS", "DRM-DRUMS", "GMS-GRAMMES", "GGR-GREAT GROSS", "GRS-GROSS", "GYD-GROSS YARDS", "KGS-KILOGRAMS", "KLR-KILOLITRE", "KME-KILOMETRE", "MLT-MILILITRE", "MTR-METERS", "MTS-METRIC TON", "NOS-NUMBERS", "PAC-PACKS", "PCS-PIECES", "PRS-PAIRS", "QTL-QUINTAL", "ROL-ROLLS", "SET-SETS", "SQF-SQUARE FEET", "SQM-SQUARE METERS", "SQY-SQUARE YARDS", "TBS-TABLETS", "TGM-TEN GROSS", "THD-THOUSANDS", "TON-TONNES", "TUB-TUBES", "UGS-US GALLONS", "UNT-UNITS", "YDS-YARDS", "OTH-OTHERS"];

    useEffect(() => {
        fetchRecords();
    }, [activeTab]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const tabName = activeTab === 'B2B' ? 'GSTR1_HSN_B2B' : 'GSTR1_HSN_B2C';
            const res = await api.get(`/forms/tab/${trn}/${tabName}`);

            if (res.data.success && res.data.data) {
                const data = res.data.data.records || (Array.isArray(res.data.data) ? res.data.data : []);
                setRecords(data);
            } else {
                setRecords([]);
            }
        } catch (error) {
            console.error("Failed to fetch HSN records");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        if (!formData.hsn || !formData.uqc || !formData.totalQuantity || !formData.totalTaxableValue || !formData.rate) {
            toast.error('Please fill all mandatory fields');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const tabName = activeTab === 'B2B' ? 'GSTR1_HSN_B2B' : 'GSTR1_HSN_B2C';

            const newRecord = { ...formData, id: Date.now() };
            const updatedRecords = [...records, newRecord];

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName,
                data: { records: updatedRecords }
            });

            if (saveRes.data.success) {
                toast.success('HSN Record added successfully!');
                setRecords(updatedRecords);
                handleReset();
            }
        } catch (err) {
            toast.error('Error adding record');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({
            hsn: '',
            description: '',
            productNameMaster: '',
            descriptionAsPerHSN: '',
            uqc: '',
            totalQuantity: '',
            totalTaxableValue: '',
            rate: '',
            integratedTax: '',
            centralTax: '',
            stateTax: '',
            cess: ''
        });
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>HSN</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="hsn-main-content">
                {/* Cyan Header Banner */}
                <div className="hsn-header-banner">
                    <div className="hsn-header-flex">
                        <h2 className="hsn-title">12 - HSN - wise summary of outward supplies</h2>
                        <div className="hsn-header-actions">
                            <button className="hsn-btn-secondary">HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 3px', marginLeft: '3px' }}>?</span></button>
                            <button className="hsn-refresh-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="hsn-tabs">
                        <div
                            className={`hsn-tab ${activeTab === 'B2B' ? 'active' : ''}`}
                            onClick={() => setActiveTab('B2B')}
                        >
                            B2B Supplies
                        </div>
                        <div
                            className={`hsn-tab ${activeTab === 'B2C' ? 'active' : ''}`}
                            onClick={() => setActiveTab('B2C')}
                        >
                            B2C Supplies
                        </div>
                    </div>
                </div>

                <div className="hsn-body">
                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates Mandatory Fields</span>
                    </div>

                    {/* Note Box */}
                    <div className="hsn-instructions">
                        <p>Note:</p>
                        <ol>
                            <li>Please select HSN from the search results in dropdown only. Manual entry of HSN will not be available.</li>
                            <li>Description cannot be entered manually under "Description as per HSN Code" field but can be entered manually under "Description" field.</li>
                            <li>Kindly click on save button after any modification( add, edit) to save the changes</li>
                        </ol>
                    </div>

                    {/* Saved Records Alert */}
                    {records.length === 0 ? (
                        <div className="hsn-empty-alert">
                            <span>There are no saved records to be displayed.</span>
                        </div>
                    ) : (
                        <div className="hsn-table-wrapper" style={{ border: '1px solid #ddd', marginBottom: '30px', overflowX: 'auto' }}>
                            <table className="hsn-records-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: '#f1f3f6' }}>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>HSN</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>UQC</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Taxable Value</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((rec, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.hsn}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.description || rec.descriptionAsPerHSN}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.uqc}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.totalQuantity}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.totalTaxableValue}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.rate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Add/Edit Details Section */}
                    <div className="hsn-form-section">
                        <div className="hsn-form-header">
                            <h3>Add/Edit Details</h3>
                            <div className="hsn-form-actions">
                                <button className="hsn-btn-download">DOWNLOAD HSN CODES LIST</button>
                                <button className="hsn-btn-download">DOWNLOAD HSN SUMMARY FROM E-INVOICES</button>
                            </div>
                        </div>

                        <div className="hsn-form-grid">
                            <div className="hsn-form-group">
                                <label>HSN <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="hsn"
                                    placeholder="Enter Product Name as in Master/HSN Code,"
                                    value={formData.hsn}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="hsn-form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="disabled-input"
                                />
                            </div>
                            <div className="hsn-form-group">
                                <label>Product Name as in My Master</label>
                                <input
                                    type="text"
                                    name="productNameMaster"
                                    value={formData.productNameMaster}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="hsn-form-group">
                                <label>Description as per HSN Code</label>
                                <input
                                    type="text"
                                    name="descriptionAsPerHSN"
                                    value={formData.descriptionAsPerHSN}
                                    onChange={handleChange}
                                    className="disabled-input"
                                />
                            </div>
                            <div style={{ visibility: 'hidden' }}></div>
                            <div style={{ visibility: 'hidden' }}></div>

                            <div className="hsn-form-group">
                                <label>UQC <span className="red-dot">*</span></label>
                                <select name="uqc" value={formData.uqc} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {uqcOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="hsn-form-group">
                                <label>Total Quantity <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="totalQuantity"
                                    value={formData.totalQuantity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="hsn-form-group">
                                <label>Total taxable value (₹) <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="totalTaxableValue"
                                    value={formData.totalTaxableValue}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="hsn-form-group">
                                <label>Rate (%) <span className="red-dot">*</span></label>
                                <select name="rate" value={formData.rate} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {rates.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="hsn-form-group">
                                <label>Integrated tax (₹) <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="integratedTax"
                                    value={formData.integratedTax}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="hsn-form-group">
                                <label>Central tax (₹) <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="centralTax"
                                    value={formData.centralTax}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="hsn-form-group">
                                <label>State/UT tax (₹) <span className="red-dot">*</span></label>
                                <input
                                    type="text"
                                    name="stateTax"
                                    value={formData.stateTax}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="hsn-form-group">
                                <label>Cess (₹)</label>
                                <input
                                    type="text"
                                    name="cess"
                                    value={formData.cess}
                                    onChange={handleChange}
                                />
                            </div>
                            <div></div>
                        </div>

                        <div className="hsn-action-row">
                            <div className="hsn-action-left">
                                <button className="hsn-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                                <button className="hsn-btn-outline" onClick={handleReset}>RESET</button>
                                <button
                                    className={(isSaving || !formData.hsn || !formData.uqc || !formData.totalQuantity || !formData.totalTaxableValue || !formData.rate) ? "hsn-btn-disabled" : "hsn-btn-secondary"}
                                    onClick={handleAdd}
                                    disabled={isSaving || !formData.hsn || !formData.uqc || !formData.totalQuantity || !formData.totalTaxableValue || !formData.rate}
                                >
                                    ADD
                                </button>
                            </div>
                            <div className="hsn-action-right">
                                <button className="hsn-btn-primary-large">IMPORT HSN DATA FROM E-INVOICES</button>
                            </div>
                        </div>
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
        </div>
    );
};

export default GSTR1HSNSummary;
