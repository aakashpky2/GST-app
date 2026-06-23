import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AB2BInvoices.css';

const GSTR2AB2BInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const [taxpayerInfo, setTaxpayerInfo] = useState({
        gstin: '...',
        legalName: '...',
        tradeName: '...',
        financialYear: '2025-26',
        returnPeriod: 'March'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Details
                const userRes = await api.get('/auth/me');
                if (userRes.data?.success && userRes.data?.data) {
                    const user = userRes.data.data;
                    setTaxpayerInfo(prev => ({
                        ...prev,
                        gstin: user.gstin || localStorage.getItem('gst_trn') || '32AAICD8127A1Z4',
                        legalName: user.legal_name || 'GST USER',
                        tradeName: user.trade_name || 'GST USER TRADE'
                    }));
                }

                // Mock Fetch Invoices (Replace with actual backend call when available)
                // e.g. const invRes = await api.get('/returns/gstr2a/b2b');
                // For now, we simulate an empty state or populated state.
                // To test populated state, uncomment the mock data below.
                
                const mockInvoices = [];
                /*
                const mockInvoices = [
                    { id: 1, supplierGstin: '07AAACA1234A1Z5', supplierName: 'ABC CORP', invoiceNum: 'INV-101', invoiceDate: '15/03/2026', invoiceValue: '50000.00', taxableValue: '40000.00', igst: '7200.00', cgst: '0.00', sgst: '0.00', cess: '0.00', filingStatus: 'Filed' },
                    { id: 2, supplierGstin: '09BBBCB2345B2Z6', supplierName: 'XYZ LTD', invoiceNum: 'INV-102', invoiceDate: '20/03/2026', invoiceValue: '25000.00', taxableValue: '21186.44', igst: '0.00', cgst: '1906.78', sgst: '1906.78', cess: '0.00', filingStatus: 'Filed' }
                ];
                */
                
                setInvoices(mockInvoices);
            } catch (err) {
                console.warn('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = invoices.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(invoices.length / recordsPerPage);

    const downloadCSV = () => {
        if (invoices.length === 0) return;
        
        const headers = ['Supplier GSTIN', 'Supplier Name', 'Invoice Number', 'Invoice Date', 'Invoice Value', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Cess', 'Filing Status'];
        
        const csvRows = invoices.map(inv => [
            inv.supplierGstin,
            inv.supplierName,
            inv.invoiceNum,
            inv.invoiceDate,
            inv.invoiceValue,
            inv.taxableValue,
            inv.igst,
            inv.cgst,
            inv.sgst,
            inv.cess,
            inv.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'B2B_Invoices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="b2b-container">
            {/* Breadcrumb Bar */}
            <div className="b2b-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>B2B Invoices</span>
            </div>

            <div className="b2b-card">
                <h2 className="b2b-title">B2B Invoices - Supplier Details</h2>

                {/* Taxpayer Details Header */}
                <div className="b2b-taxpayer-details">
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

                {!loading && invoices.length === 0 ? (
                    /* Empty State Alert */
                    <div className="b2b-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="b2b-table-wrapper">
                        <table className="b2b-table">
                            <thead>
                                <tr>
                                    <th>Supplier GSTIN</th>
                                    <th>Supplier Name</th>
                                    <th>Invoice Number</th>
                                    <th>Invoice Date</th>
                                    <th>Invoice Value</th>
                                    <th>Taxable Value</th>
                                    <th>IGST</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    <th>Cess</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((inv, index) => (
                                    <tr key={index}>
                                        <td>{inv.supplierGstin}</td>
                                        <td>{inv.supplierName}</td>
                                        <td>{inv.invoiceNum}</td>
                                        <td>{inv.invoiceDate}</td>
                                        <td>{inv.invoiceValue}</td>
                                        <td>{inv.taxableValue}</td>
                                        <td>{inv.igst}</td>
                                        <td>{inv.cgst}</td>
                                        <td>{inv.sgst}</td>
                                        <td>{inv.cess}</td>
                                        <td>{inv.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="b2b-pagination">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="b2b-actions">
                    <button className="b2b-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`b2b-btn-download ${invoices.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={invoices.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AB2BInvoices;
