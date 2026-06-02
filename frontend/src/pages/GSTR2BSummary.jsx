import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GSTR2BSummary = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pdfRef = useRef(null);

    const fy = searchParams.get('fy') || '2025-26';
    const month = searchParams.get('month') || 'March';

    // Tabs State
    const [activeMainTab, setActiveMainTab] = useState('SUMMARY');
    const [activeSubTab, setActiveSubTab] = useState('itc_available');

    // Expanded Row Headings State
    const [expandedRows, setExpandedRows] = useState({});

    const [profile, setProfile] = useState({
        gstin: '32AAICD8127A1Z4',
        legalName: 'D MIX MEDIA PRIVATE LIMITED',
        tradeName: '',
        arn: 'AA3203261234567',
        arnDate: '15/03/2026',
        stateName: 'Kerala'
    });
    const [loading, setLoading] = useState(true);

    // Sum Aggregators for Dropdown Rows
    const emptySum = { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    const [sums, setSums] = useState({
        b2bRegular: { ...emptySum },
        b2bDebit: { ...emptySum },
        ecoDocs: { ...emptySum },
        b2bReverse: { ...emptySum },
        b2bReverseDebit: { ...emptySum },
        importGoods: { ...emptySum },
        b2bCredit: { ...emptySum },
        b2bCreditReverse: { ...emptySum }
    });

    useEffect(() => {
        const loadGstr1Data = async () => {
            setLoading(true);
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                
                try {
                    const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                    if (profRes.data.success && profRes.data.data) {
                        setProfile(profRes.data.data);
                    }
                } catch (e) {
                    console.warn("Could not load registration profile.");
                }

                const gstr1Res = await api.get(`/forms/gstr1-summary/${trn}`);
                if (gstr1Res.data.success && gstr1Res.data.data) {
                    const raw = gstr1Res.data.data.rawRecords || {};

                    const allB2b = raw.GSTR1_B2B_Invoices?.invoices || [];
                    const regular = allB2b.filter(inv => !inv.isReverseCharge && !inv.reverseCharge);
                    const reverse = allB2b.filter(inv => inv.isReverseCharge || inv.reverseCharge);

                    const cdnrList = raw.GSTR1_CDNR_Invoices?.invoices || [];
                    const cdnurList = raw.GSTR1_CDNUR_Invoices?.invoices || [];
                    const allNotes = [...cdnrList, ...cdnurList];

                    // Separate Debit and Credit Notes
                    const debitNotes = allNotes.filter(n => n.noteType && n.noteType.toLowerCase() === 'debit');
                    const creditNotes = allNotes.filter(n => !n.noteType || n.noteType.toLowerCase() !== 'debit');

                    const regularDebit = debitNotes.filter(n => !n.isReverseCharge);
                    const reverseDebit = debitNotes.filter(n => n.isReverseCharge);
                    const regularCredit = creditNotes.filter(n => !n.isReverseCharge);
                    const reverseCredit = creditNotes.filter(n => n.isReverseCharge);

                    const ecoList = raw.GSTR1_ECO_Documents?.invoices || [];
                    const imports = raw.GSTR1_Exports_Invoices?.invoices || []; // Mapped for demonstration

                    setSums({
                        b2bRegular: sumInvoices(regular),
                        b2bDebit: sumInvoices(regularDebit),
                        ecoDocs: sumInvoices(ecoList),
                        b2bReverse: sumInvoices(reverse),
                        b2bReverseDebit: sumInvoices(reverseDebit),
                        importGoods: sumInvoices(imports),
                        b2bCredit: sumInvoices(regularCredit),
                        b2bCreditReverse: sumInvoices(reverseCredit)
                    });
                }
            } catch (err) {
                console.error("GSTR-2B compilation failed:", err);
                toast.error("Failed to compile auto-drafted GSTR-2B summary.");
            } finally {
                setLoading(false);
            }
        };
        loadGstr1Data();
    }, []);

    const sumInvoices = (list) => {
        let taxable = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
        list.forEach(inv => {
            let val = parseFloat(inv.taxableValue || inv.totalInvoiceValue || inv.netValue || inv.value || inv.noteValue) || 0;
            let iTax = parseFloat(inv.integratedTax) || 0;
            let cTax = parseFloat(inv.centralTax) || 0;
            let sTax = parseFloat(inv.stateTax) || 0;
            let ces = parseFloat(inv.cess) || 0;

            if (Array.isArray(inv.itemDetails) && inv.itemDetails.length > 0) {
                let hasDetails = false;
                let itemVal = 0, itemIgst = 0, itemCgst = 0, itemSgst = 0, itemCess = 0;
                inv.itemDetails.forEach(item => {
                    if (item.taxableValue) {
                        hasDetails = true;
                        itemVal += parseFloat(item.taxableValue) || 0;
                        itemIgst += parseFloat(item.integratedTax) || 0;
                        itemCgst += parseFloat(item.centralTax) || 0;
                        itemSgst += parseFloat(item.stateTax) || 0;
                        itemCess += parseFloat(item.cess) || 0;
                    }
                });
                if (hasDetails) {
                    val = itemVal;
                    iTax = itemIgst;
                    cTax = itemCgst;
                    sTax = itemSgst;
                    ces = itemCess;
                }
            }
            taxable += val;
            igst += iTax;
            cgst += cTax;
            sgst += sTax;
            cess += ces;
        });
        return { taxable, igst, cgst, sgst, cess };
    };

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const addSums = (...sumObjects) => {
        return sumObjects.reduce((acc, curr) => ({
            taxable: acc.taxable + (curr.taxable || 0),
            igst: acc.igst + (curr.igst || 0),
            cgst: acc.cgst + (curr.cgst || 0),
            sgst: acc.sgst + (curr.sgst || 0),
            cess: acc.cess + (curr.cess || 0)
        }), { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });
    };

    const toggleRow = (rowId) => {
        setExpandedRows(prev => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
    };

    const expandAll = () => {
        setExpandedRows({
            a1: true, a2: true, a3: true, a4: true, b1: true,
            na1: true, na2: true, na3: true, nb1: true,
            rev1: true,
            rej1: true, rej2: true, rej3: true
        });
    };

    const handleDownloadExcel = () => {
        toast.success("Excel/CSV Statement downloaded!");
    };

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;
        if (!element) return;
        const toastId = toast.loading("Generating PDF...");
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`GSTR2B_SUMMARY.pdf`);
            toast.success("PDF downloaded successfully!", { id: toastId });
        } catch (err) {
            toast.error("Could not generate PDF.", { id: toastId });
        }
    };

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading GSTR-2B Data...</div>;
    }

    const todayDate = new Date().toLocaleDateString('en-GB');

    // Calculated Parent Sums
    const partAa1Sum = addSums(sums.b2bRegular, sums.b2bDebit, sums.ecoDocs);
    const partAa2Sum = emptySum;
    const partAa3Sum = addSums(sums.b2bReverse, sums.b2bReverseDebit);
    const partAa4Sum = addSums(sums.importGoods);
    const partBb1Sum = addSums(sums.b2bCredit, sums.b2bCreditReverse);

    // Reusable Child Row Component
    const ChildRow = ({ title, path, sumData }) => (
        <tr style={{ backgroundColor: '#fcfcfc' }}>
            <td></td>
            <td style={{ paddingLeft: '35px' }}>
                <span 
                    style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'none' }} 
                    onClick={() => navigate(path)}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    {title}
                </span>
            </td>
            <td></td>
            <td className="right-align">{formatCurr(sumData?.igst)}</td>
            <td className="right-align">{formatCurr(sumData?.cgst)}</td>
            <td className="right-align">{formatCurr(sumData?.sgst)}</td>
            <td className="right-align">{formatCurr(sumData?.cess)}</td>
        </tr>
    );

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <Toaster position="top-right" />
            
            <style>{`
                .portal-wrapper { max-width: 1100px; margin: 0 auto; padding-top: 20px; padding-bottom: 50px; }
                .turquoise-header { background-color: #00bcd4; color: white; padding: 8px 15px; font-size: 16px; font-weight: bold; margin-bottom: 0; }
                .profile-section { background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; display: grid; grid-template-columns: 1fr 1fr; row-gap: 10px; font-size: 13px; }
                .profile-section strong { color: #333; }
                .portal-card { background: white; border: 1px solid #ddd; padding: 20px; }
                
                .top-tabs-container { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
                .top-tabs { display: flex; }
                .top-tab { padding: 10px 20px; cursor: pointer; font-size: 14px; color: #007bff; background: none; border: none; }
                .top-tab.active { color: #333; border-bottom: 3px solid #007bff; font-weight: bold; }
                .advisory-link { color: #007bff; font-size: 13px; text-decoration: none; align-self: center; padding-right: 10px; }
                .advisory-link:hover { text-decoration: underline; }

                .sub-tabs-container { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .sub-tabs { display: flex; }
                .sub-tab { padding: 8px 15px; cursor: pointer; font-size: 13px; border: 1px solid #007bff; color: #007bff; background: white; border-right: none; }
                .sub-tab:last-child { border-right: 1px solid #007bff; }
                .sub-tab.active-green { background-color: #20b2aa; color: white; border-color: #20b2aa; }
                .sub-tab.active-red { background-color: #d9534f; color: white; border-color: #d9534f; }
                .help-btn { background-color: #337ab7; color: white; border: none; padding: 4px 10px; font-size: 11px; border-radius: 3px; cursor: pointer; height: 24px; align-self: center; }

                .gst-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; border: 1px solid #ddd; }
                .gst-table th { border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; color: #333; }
                .gst-table th.header-light-green { background-color: #e6f2eb; color: #2e7d32; }
                .gst-table th.header-light-pink { background-color: #fce4d6; color: #c65911; }
                .gst-table td { border: 1px solid #ddd; padding: 8px; color: #333; }
                .gst-table .right-align { text-align: right; }
                .gst-table .center-align { text-align: center; }
                
                .parent-row td { font-weight: 500; }
                .row-expand-icon { cursor: pointer; font-size: 12px; margin-left: 5px; color: #333; display: inline-block; width: 15px; text-align: center; user-select: none; }
                .info-icon { display: inline-block; background: #333; color: white; border-radius: 50%; width: 14px; height: 14px; text-align: center; line-height: 14px; font-size: 10px; margin-left: 5px; }
                .expand-all-link { color: #007bff; cursor: pointer; font-weight: normal; font-size: 12px; }

                .btn-row { display: flex; justify-content: center; gap: 10px; margin-bottom: 15px; }
                .btn-default { background-color: white; color: #333; border: 1px solid #ccc; padding: 8px 15px; font-size: 13px; cursor: pointer; }
                .btn-primary-dark { background-color: #284b7a; color: white; border: 1px solid #284b7a; padding: 8px 15px; font-size: 13px; cursor: pointer; }

                .gst-footer { background-color: #123456; color: white; padding: 30px 10%; display: flex; justify-content: space-between; font-size: 12px; margin-top: 40px; }
                .gst-footer-col { display: flex; flex-direction: column; gap: 5px; }
                .gst-footer-title { color: #00bcd4; font-weight: bold; margin-bottom: 10px; font-size: 14px; }
                .gst-footer-link { color: #cbd5e1; text-decoration: none; }
                .gst-footer-link:hover { text-decoration: underline; color: white; }
            `}</style>

            <div className="portal-wrapper">
                
                <div className="turquoise-header">GSTR-2B- AUTO-DRAFTED ITC STATEMENT</div>
                <div className="profile-section">
                    <div><strong>GSTIN - </strong> {profile.gstin}</div>
                    <div><strong>Financial Year - </strong> {fy}</div>
                    <div><strong>Legal Name - </strong> {profile.legalName}</div>
                    <div><strong>Return Period - </strong> {month}</div>
                    <div><strong>Trade Name - </strong> {profile.tradeName || '-'}</div>
                    <div><strong>Generation date - </strong> {todayDate}</div>
                </div>

                <div className="portal-card" ref={pdfRef}>
                    <div className="top-tabs-container">
                        <div className="top-tabs">
                            <button className={`top-tab ${activeMainTab === 'SUMMARY' ? 'active' : ''}`} onClick={() => setActiveMainTab('SUMMARY')}>SUMMARY</button>
                            <button className={`top-tab ${activeMainTab === 'ALL TABLES' ? 'active' : ''}`} onClick={() => setActiveMainTab('ALL TABLES')}>ALL TABLES</button>
                        </div>
                        <a href="#" className="advisory-link">View Advisory</a>
                    </div>

                    {activeMainTab === 'SUMMARY' && (
                        <>
                            <div className="sub-tabs-container">
                                <div className="sub-tabs">
                                    <button className={`sub-tab ${activeSubTab === 'itc_available' ? 'active-green' : ''}`} onClick={() => setActiveSubTab('itc_available')}>ITC available</button>
                                    <button className={`sub-tab ${activeSubTab === 'itc_not_available' ? 'active-red' : ''}`} onClick={() => setActiveSubTab('itc_not_available')}>ITC Not Available</button>
                                    <button className={`sub-tab ${activeSubTab === 'itc_reversal' ? 'active-red' : ''}`} onClick={() => setActiveSubTab('itc_reversal')}>ITC Reversal</button>
                                    <button className={`sub-tab ${activeSubTab === 'itc_rejected' ? 'active-red' : ''}`} onClick={() => setActiveSubTab('itc_rejected')}>ITC Rejected</button>
                                </div>
                                <button className="help-btn">HELP ?</button>
                            </div>

                            {activeSubTab === 'itc_available' && (
                                <table className="gst-table">
                                    <thead>
                                        <tr>
                                            <th className="header-light-green" style={{ width: '5%' }}>S.NO.</th>
                                            <th className="header-light-green" style={{ width: '40%', textAlign: 'left' }}>
                                                Heading <span className="expand-all-link" onClick={expandAll}>[Expand All ˅]</span>
                                            </th>
                                            <th className="header-light-green" style={{ width: '15%' }}>GSTR-3B table</th>
                                            <th className="header-light-green">Integrated Tax (₹)</th>
                                            <th className="header-light-green">Central Tax (₹)</th>
                                            <th className="header-light-green">State/UT Tax (₹)</th>
                                            <th className="header-light-green">Cess (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="center-align">Part A</td><td colSpan="6">ITC Available - Credit may be claimed in relevant headings in GSTR-3B</td></tr>
                                        
                                        {/* A I */}
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td>
                                                <span style={{ cursor: 'pointer' }} onClick={() => toggleRow('a1')}>
                                                    All other ITC - Supplies from registered persons <span className="row-expand-icon">{expandedRows['a1'] ? '⌃' : '⌄'}</span>
                                                </span>
                                            </td>
                                            <td className="center-align">4(A)(5) <span className="info-icon">i</span></td>
                                            <td className="right-align">{formatCurr(partAa1Sum.igst)}</td>
                                            <td className="right-align">{formatCurr(partAa1Sum.cgst)}</td>
                                            <td className="right-align">{formatCurr(partAa1Sum.sgst)}</td>
                                            <td className="right-align">{formatCurr(partAa1Sum.cess)}</td>
                                        </tr>
                                        {expandedRows['a1'] && (
                                            <>
                                                <ChildRow title="B2B - Invoices - IMS" path={`/returns/gstr2b/section/b2b?fy=${fy}&month=${month}&type=invoices`} sumData={sums.b2bRegular} />
                                                <ChildRow title="B2B - Debit notes - IMS" path={`/returns/gstr2b/section/debit-notes?fy=${fy}&month=${month}`} sumData={sums.b2bDebit} />
                                                <ChildRow title="ECO - Documents - IMS" path={`/returns/gstr2b/section/eco-documents?fy=${fy}&month=${month}`} sumData={sums.ecoDocs} />
                                                <ChildRow title="B2B - Invoices (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="ECO - Documents (Amendment) - IMS" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        {/* A II */}
                                        <tr className="parent-row">
                                            <td className="center-align">II</td>
                                            <td>
                                                <span style={{ cursor: 'pointer' }} onClick={() => toggleRow('a2')}>
                                                    Inward Supplies from ISD <span className="row-expand-icon">{expandedRows['a2'] ? '⌃' : '⌄'}</span>
                                                </span>
                                            </td>
                                            <td className="center-align">4(A)(4) <span className="info-icon">i</span></td>
                                            <td className="right-align">{formatCurr(partAa2Sum.igst)}</td>
                                            <td className="right-align">{formatCurr(partAa2Sum.cgst)}</td>
                                            <td className="right-align">{formatCurr(partAa2Sum.sgst)}</td>
                                            <td className="right-align">{formatCurr(partAa2Sum.cess)}</td>
                                        </tr>
                                        {expandedRows['a2'] && (
                                            <>
                                                <ChildRow title="ISD - Invoices" path={`/returns/gstr2b/section/isd?fy=${fy}&month=${month}`} sumData={emptySum} />
                                                <ChildRow title="ISD - Invoices (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        {/* A III */}
                                        <tr className="parent-row">
                                            <td className="center-align">III</td>
                                            <td>
                                                <span style={{ cursor: 'pointer' }} onClick={() => toggleRow('a3')}>
                                                    Inward Supplies liable for reverse charge <span className="row-expand-icon">{expandedRows['a3'] ? '⌃' : '⌄'}</span>
                                                </span>
                                            </td>
                                            <td className="center-align">3.1(d)<br/>4(A)(3) <span className="info-icon">i</span></td>
                                            <td className="right-align">{formatCurr(partAa3Sum.igst)}</td>
                                            <td className="right-align">{formatCurr(partAa3Sum.cgst)}</td>
                                            <td className="right-align">{formatCurr(partAa3Sum.sgst)}</td>
                                            <td className="right-align">{formatCurr(partAa3Sum.cess)}</td>
                                        </tr>
                                        {expandedRows['a3'] && (
                                            <>
                                                <ChildRow title="B2B - Invoices" path={`/returns/gstr2b/section/b2b?fy=${fy}&month=${month}&type=invoices`} sumData={sums.b2bReverse} />
                                                <ChildRow title="B2B - Debit notes" path={`/returns/gstr2b/section/debit-notes?fy=${fy}&month=${month}`} sumData={sums.b2bReverseDebit} />
                                                <ChildRow title="B2B - Invoices (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        {/* A IV */}
                                        <tr className="parent-row">
                                            <td className="center-align">IV</td>
                                            <td>
                                                <span style={{ cursor: 'pointer' }} onClick={() => toggleRow('a4')}>
                                                    Import of Goods <span className="row-expand-icon">{expandedRows['a4'] ? '⌃' : '⌄'}</span>
                                                </span>
                                            </td>
                                            <td className="center-align">4(A)(1) <span className="info-icon">i</span></td>
                                            <td className="right-align">{formatCurr(partAa4Sum.igst)}</td>
                                            <td className="right-align">{formatCurr(partAa4Sum.cgst)}</td>
                                            <td className="right-align">{formatCurr(partAa4Sum.sgst)}</td>
                                            <td className="right-align">{formatCurr(partAa4Sum.cess)}</td>
                                        </tr>
                                        {expandedRows['a4'] && (
                                            <>
                                                <ChildRow title="IMPG - Import of goods from overseas" path={`/returns/gstr2b/section/import-goods?fy=${fy}&month=${month}`} sumData={sums.importGoods} />
                                                <ChildRow title="IMPG (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="IMPGSEZ - Import of goods from SEZ" path="#" sumData={emptySum} />
                                                <ChildRow title="IMPGSEZ (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr><td className="center-align">Part B</td><td colSpan="6">ITC Available - Credit notes should be net off against relevant ITC available headings in GSTR-3B</td></tr>
                                        
                                        {/* B I */}
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td>
                                                <span style={{ cursor: 'pointer' }} onClick={() => toggleRow('b1')}>
                                                    Others <span className="row-expand-icon">{expandedRows['b1'] ? '⌃' : '⌄'}</span>
                                                </span>
                                            </td>
                                            <td className="center-align">4(A) <span className="info-icon">i</span></td>
                                            <td className="right-align">{formatCurr(partBb1Sum.igst)}</td>
                                            <td className="right-align">{formatCurr(partBb1Sum.cgst)}</td>
                                            <td className="right-align">{formatCurr(partBb1Sum.sgst)}</td>
                                            <td className="right-align">{formatCurr(partBb1Sum.cess)}</td>
                                        </tr>
                                        {expandedRows['b1'] && (
                                            <>
                                                <ChildRow title="B2B - Credit notes - IMS" path={`/returns/gstr2b/section/credit-notes?fy=${fy}&month=${month}`} sumData={sums.b2bCredit} />
                                                <ChildRow title="B2B - Credit notes (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Credit notes (Reverse charge)" path={`/returns/gstr2b/section/credit-notes?fy=${fy}&month=${month}`} sumData={sums.b2bCreditReverse} />
                                                <ChildRow title="B2B - Credit notes (Reverse charge) (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeSubTab === 'itc_not_available' && (
                                <table className="gst-table">
                                    <thead>
                                        <tr>
                                            <th className="header-light-pink" style={{ width: '5%' }}>S.NO.</th>
                                            <th className="header-light-pink" style={{ width: '40%', textAlign: 'left' }}>Heading <span className="expand-all-link" onClick={expandAll}>[Expand All ˅]</span></th>
                                            <th className="header-light-pink" style={{ width: '15%' }}>GSTR-3B table</th>
                                            <th className="header-light-pink">Integrated Tax (₹)</th>
                                            <th className="header-light-pink">Central Tax (₹)</th>
                                            <th className="header-light-pink">State/UT Tax (₹)</th>
                                            <th className="header-light-pink">Cess (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="center-align">Part A</td><td colSpan="6">ITC Not Available</td></tr>
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('na1')}>All other ITC - Supplies from registered persons <span className="row-expand-icon">{expandedRows['na1'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">4(D)(2)</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['na1'] && (
                                            <>
                                                <ChildRow title="B2B - Invoices" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="ECO - Documents" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Invoices (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="ECO - Documents (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr className="parent-row">
                                            <td className="center-align">II</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('na2')}>Inward Supplies from ISD <span className="row-expand-icon">{expandedRows['na2'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">4(D)(2)</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['na2'] && (
                                            <>
                                                <ChildRow title="ISD - Invoices" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Invoices (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr className="parent-row">
                                            <td className="center-align">III</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('na3')}>Inward Supplies liable for reverse charge <span className="row-expand-icon">{expandedRows['na3'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">3.1(d)<br/>4(D)(2)</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['na3'] && (
                                            <>
                                                <ChildRow title="B2B - Invoices" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Invoices (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr><td className="center-align">Part B</td><td colSpan="6">ITC Not Available - Credit notes should be net off against relevant ITC available headings in GSTR-3B</td></tr>
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('nb1')}>Others <span className="row-expand-icon">{expandedRows['nb1'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">4(A)</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['nb1'] && (
                                            <>
                                                <ChildRow title="B2B - Credit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Credit notes (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Credit notes (Reverse charge)" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Credit notes (Reverse charge) (Amendment)" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeSubTab === 'itc_reversal' && (
                                <div>
                                    <div style={{ background: '#e8f4fd', border: '1px solid #bce8f1', color: '#31708f', padding: '10px', marginBottom: '15px', fontSize: '13px' }}>
                                        Data will be available in GSTR-2B of September month.
                                    </div>
                                    <table className="gst-table">
                                        <thead>
                                            <tr>
                                                <th className="header-light-pink" style={{ width: '5%' }}>S.NO.</th>
                                                <th className="header-light-pink" style={{ width: '40%', textAlign: 'left' }}>Heading <span className="expand-all-link" onClick={expandAll}>[Expand All ˅]</span></th>
                                                <th className="header-light-pink" style={{ width: '15%' }}>GSTR-3B table</th>
                                                <th className="header-light-pink">Integrated Tax (₹)</th>
                                                <th className="header-light-pink">Central Tax (₹)</th>
                                                <th className="header-light-pink">State/UT Tax (₹)</th>
                                                <th className="header-light-pink">Cess (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td className="center-align">Part A</td><td colSpan="6">ITC Reversed - Others</td></tr>
                                            <tr className="parent-row">
                                                <td className="center-align">I</td>
                                                <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('rev1')}>ITC Reversal on account of Rule 37A <span className="row-expand-icon">{expandedRows['rev1'] ? '⌃' : '⌄'}</span></span></td>
                                                <td className="center-align">4(B)(2)</td>
                                                <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                            </tr>
                                            {expandedRows['rev1'] && (
                                                <>
                                                    <ChildRow title="B2B - Invoices" path="#" sumData={emptySum} />
                                                    <ChildRow title="B2B - Debit notes" path="#" sumData={emptySum} />
                                                    <ChildRow title="B2B - Invoices (Amendment)" path="#" sumData={emptySum} />
                                                    <ChildRow title="B2B - Debit notes (Amendment)" path="#" sumData={emptySum} />
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeSubTab === 'itc_rejected' && (
                                <table className="gst-table">
                                    <thead>
                                        <tr>
                                            <th className="header-light-pink" style={{ width: '5%' }}>S.NO.</th>
                                            <th className="header-light-pink" style={{ width: '40%', textAlign: 'left' }}>Heading <span className="expand-all-link" onClick={expandAll}>[Expand All ˅]</span></th>
                                            <th className="header-light-pink" style={{ width: '15%' }}>GSTR-3B table</th>
                                            <th className="header-light-pink">Integrated Tax (₹)</th>
                                            <th className="header-light-pink">Central Tax (₹)</th>
                                            <th className="header-light-pink">State/UT Tax (₹)</th>
                                            <th className="header-light-pink">Cess (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="center-align">Part A</td><td colSpan="6">ITC Rejected</td></tr>
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('rej1')}>All other ITC - Supplies from registered persons (IMS) <span className="row-expand-icon">{expandedRows['rej1'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">NA</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['rej1'] && (
                                            <>
                                                <ChildRow title="B2B - Invoices - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="ECO - Documents - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Invoices (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Debit notes (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="ECO - Documents (Amendment) - IMS" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr className="parent-row">
                                            <td className="center-align">II</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('rej2')}>Inward Supplies from ISD <span className="row-expand-icon">{expandedRows['rej2'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">NA</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['rej2'] && (
                                            <>
                                                <ChildRow title="ISD - Invoices" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Invoices (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}

                                        <tr><td className="center-align">Part B</td><td colSpan="6">Rejected Records - Credit Notes rejected on IMS Dashboard</td></tr>
                                        <tr className="parent-row">
                                            <td className="center-align">I</td>
                                            <td><span style={{ cursor: 'pointer' }} onClick={() => toggleRow('rej3')}>Others (IMS) <span className="row-expand-icon">{expandedRows['rej3'] ? '⌃' : '⌄'}</span></span></td>
                                            <td className="center-align">NA</td>
                                            <td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td><td className="right-align">0.00</td>
                                        </tr>
                                        {expandedRows['rej3'] && (
                                            <>
                                                <ChildRow title="B2B - Credit notes - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="B2B - Credit notes (Amendment) - IMS" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes" path="#" sumData={emptySum} />
                                                <ChildRow title="ISD - Credit notes (Amendment)" path="#" sumData={emptySum} />
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                    
                    {activeMainTab === 'ALL TABLES' && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            All Tables data view is currently under maintenance.
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <div className="btn-row">
                        <button className="btn-default" onClick={() => navigate('/returns-dashboard')}>BACK TO DASHBOARD</button>
                        <button className="btn-primary-dark" onClick={handleDownloadPDF}>DOWNLOAD GSTR-2B SUMMARY (PDF)</button>
                        <button className="btn-primary-dark" onClick={handleDownloadExcel}>DOWNLOAD GSTR-2B DETAILS (EXCEL)</button>
                    </div>
                    <div className="btn-row">
                        <button className="btn-primary-dark" onClick={() => navigate('/returns/gstr3b')}>OPEN GSTR-3B</button>
                        <button className="btn-primary-dark" onClick={() => navigate('/returns/ims')}>OPEN IMS DASHBOARD</button>
                    </div>
                </div>

            </div>

            <div className="gst-footer">
                <div className="gst-footer-col">
                    <div className="gst-footer-title">About GST</div>
                    <a href="#" className="gst-footer-link">GST Council Structure</a>
                    <a href="#" className="gst-footer-link">GST History</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Website Policies</div>
                    <a href="#" className="gst-footer-link">Website Policy</a>
                    <a href="#" className="gst-footer-link">Terms and Conditions</a>
                    <a href="#" className="gst-footer-link">Hyperlink Policy</a>
                    <a href="#" className="gst-footer-link">Disclaimer</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Related Sites</div>
                    <a href="#" className="gst-footer-link">Central Board of Indirect Taxes and Customs</a>
                    <a href="#" className="gst-footer-link">State Tax Websites</a>
                    <a href="#" className="gst-footer-link">National Portal</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Help</div>
                    <a href="#" className="gst-footer-link">System Requirements</a>
                    <a href="#" className="gst-footer-link">User Manuals, Videos</a>
                    <a href="#" className="gst-footer-link">CBT</a>
                    <a href="#" className="gst-footer-link">Site Map</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Important Links</div>
                    <a href="#" className="gst-footer-link">Laws, Rules & Rates</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Contact Us</div>
                    <a href="#" className="gst-footer-link">Help Desk Number:</a>
                    <span style={{ color: '#cbd5e1' }}>0120-1888999</span>
                </div>
            </div>
        </div>
    );
};

export default GSTR2BSummary;
