import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR2BSummary = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fy = searchParams.get('fy') || '2025-26';
    const monthParam = searchParams.get('month') || 'March';

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState('SUMMARY');
    const [activeSubTab, setActiveSubTab] = useState('itc_available');
    const [expandedRows, setExpandedRows] = useState({});
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [profile, setProfile] = useState({
        gstin: '', legalName: '', tradeName: '', trn: ''
    });
    const [snapshots, setSnapshots] = useState([]);
    const [activeSnapshot, setActiveSnapshot] = useState(null);
    const [gstr2bRecords, setGstr2bRecords] = useState({ b2b: [], cdnr: [], amended: [] });
    const [gstr2aSums, setGstr2aSums] = useState({
        b2bRegular: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
        cdnrNotes: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
        amended: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    });

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            try {
                const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                if (profRes.data?.success && profRes.data?.data) {
                    setProfile({ ...profRes.data.data, trn });
                } else {
                    setProfile(p => ({ ...p, trn }));
                }
            } catch (_) {
                setProfile(p => ({ ...p, trn }));
            }

            // Fetch GSTR-2B data (snapshots + records)
            const gstr2bRes = await api.get(`/gstr2b/${trn}`);
            if (gstr2bRes.data?.success && gstr2bRes.data?.data) {
                const d = gstr2bRes.data.data;
                setSnapshots(d.snapshots || []);
                setActiveSnapshot(d.activeSnapshot || null);
                setGstr2bRecords({
                    b2b: d.b2bRecords || [],
                    cdnr: d.cdnrRecords || [],
                    amended: d.amendedRecords || [],
                });
            }

            // Fetch GSTR-2A live summary for ITC display
            const gstr2aRes = await api.get(`/gstr2a/summary/${trn}`);
            if (gstr2aRes.data?.success && gstr2aRes.data?.data) {
                const { rawRecords } = gstr2aRes.data.data;
                const sum = (records) => {
                    let taxable = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                    (records || []).forEach(r => {
                        taxable += parseFloat(r.taxable_value) || 0;
                        igst += parseFloat(r.igst) || 0;
                        cgst += parseFloat(r.cgst) || 0;
                        sgst += parseFloat(r.sgst) || 0;
                        cess += parseFloat(r.cess) || 0;
                    });
                    return { taxable, igst, cgst, sgst, cess };
                };
                setGstr2aSums({
                    b2bRegular: sum(rawRecords?.b2bRecords),
                    cdnrNotes: sum(rawRecords?.cdnrRecords),
                    amended: sum(rawRecords?.amendedRecords),
                });
            }
        } catch (err) {
            console.error('GSTR-2B load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateGSTR2B = async () => {
        if (!profile.trn) {
            toast.error('Could not determine TRN. Please try again.');
            return;
        }
        setGenerating(true);
        try {
            const res = await api.post('/gstr2b/generate', {
                trn: profile.trn,
                month: selectedMonth,
                year: selectedYear
            });
            if (res.data?.success) {
                toast.success(res.data.message || 'GSTR-2B generated successfully!');
                setShowGenerateModal(false);
                await loadAll();
            } else {
                toast.error(res.data?.message || 'Failed to generate GSTR-2B.');
            }
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setGenerating(false);
        }
    };

    const fmt = (val) => parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const addSums = (...objs) => objs.reduce((a, b) => ({
        taxable: (a.taxable||0) + (b.taxable||0),
        igst: (a.igst||0) + (b.igst||0),
        cgst: (a.cgst||0) + (b.cgst||0),
        sgst: (a.sgst||0) + (b.sgst||0),
        cess: (a.cess||0) + (b.cess||0)
    }), { taxable:0, igst:0, cgst:0, sgst:0, cess:0 });

    const toggleRow = (id) => setExpandedRows(p => ({ ...p, [id]: !p[id] }));
    const expandAll = () => setExpandedRows({ a1:true, a2:true, a3:true, a4:true, b1:true, na1:true, na2:true, na3:true, nb1:true });
    const todayDate = new Date().toLocaleDateString('en-GB');

    // Source data: prefer GSTR-2B snapshot if available, else GSTR-2A live data
    const displaySums = activeSnapshot ? {
        b2bRegular: {
            taxable: parseFloat(activeSnapshot.total_taxable_value || 0),
            igst: parseFloat(activeSnapshot.total_igst || 0),
            cgst: parseFloat(activeSnapshot.total_cgst || 0),
            sgst: parseFloat(activeSnapshot.total_sgst || 0),
            cess: parseFloat(activeSnapshot.total_cess || 0),
        },
        cdnrNotes: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
        amended: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    } : gstr2aSums;

    const partAI = addSums(displaySums.b2bRegular, displaySums.amended);
    const partBI = displaySums.cdnrNotes;

    const emptySum = { taxable:0, igst:0, cgst:0, sgst:0, cess:0 };

    const ChildRow = ({ title, sumData }) => (
        <tr style={{ backgroundColor: '#fcfcfc' }}>
            <td></td>
            <td style={{ paddingLeft: '35px', fontSize: '13px', color: '#555' }}>{title}</td>
            <td></td>
            <td style={{ textAlign: 'right' }}>{fmt(sumData?.igst)}</td>
            <td style={{ textAlign: 'right' }}>{fmt(sumData?.cgst)}</td>
            <td style={{ textAlign: 'right' }}>{fmt(sumData?.sgst)}</td>
            <td style={{ textAlign: 'right' }}>{fmt(sumData?.cess)}</td>
        </tr>
    );

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>Loading GSTR-2B Data...</div>;

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <Toaster position="top-right" />

            {/* Generate GSTR-2B Modal */}
            {showGenerateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', width: '480px', border: '1px solid #ccc', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ background: '#1a237e', color: 'white', padding: '12px 18px', fontSize: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Generate GSTR-2B Snapshot</span>
                            <button onClick={() => setShowGenerateModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer' }}>Close</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', padding: '10px', fontSize: '13px', marginBottom: '15px' }}>
                                <strong>Important:</strong> Once generated, GSTR-2B for the selected month is <strong>locked</strong>. Later changes to GSTR-1 by suppliers will NOT affect this snapshot.
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Month:</label>
                                <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontSize: '13px' }}>
                                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Year:</label>
                                <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', fontSize: '13px' }}>
                                    {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* Check if already exists */}
                            {snapshots.some(s => s.snapshot_month === selectedMonth && s.snapshot_year === selectedYear) && (
                                <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', padding: '10px', fontSize: '13px', color: '#c62828', marginBottom: '15px' }}>
                                    GSTR-2B for {MONTHS[selectedMonth-1]} {selectedYear} already exists. Cannot generate again.
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setShowGenerateModal(false)} style={{ padding: '8px 20px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button
                                    onClick={handleGenerateGSTR2B}
                                    disabled={generating || snapshots.some(s => s.snapshot_month === selectedMonth && s.snapshot_year === selectedYear)}
                                    style={{ padding: '8px 20px', background: '#1a73e8', color: 'white', border: 'none', cursor: 'pointer', opacity: generating ? 0.7 : 1 }}
                                >
                                    {generating ? 'Generating...' : 'Confirm & Generate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '20px', paddingBottom: '50px' }}>

                {/* Header */}
                <div style={{ background: '#00bcd4', color: 'white', padding: '8px 15px', fontSize: '16px', fontWeight: 'bold' }}>
                    GSTR-2B — AUTO-DRAFTED ITC STATEMENT
                </div>

                {/* Profile */}
                <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '15px', marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px', fontSize: '13px' }}>
                    <div><strong>GSTIN:</strong> {profile.gstin || profile.legalName || '...'}</div>
                    <div><strong>Financial Year:</strong> {fy}</div>
                    <div><strong>Legal Name:</strong> {profile.legalName || '...'}</div>
                    <div><strong>Return Period:</strong> {monthParam}</div>
                    <div><strong>Generation Date:</strong> {activeSnapshot ? new Date(activeSnapshot.generated_at).toLocaleDateString('en-GB') : todayDate}</div>
                    <div><strong>Snapshot Status:</strong>
                        {activeSnapshot
                            ? <span style={{ color: '#2e7d32', fontWeight: 'bold' }}> LOCKED ({MONTHS[activeSnapshot.snapshot_month - 1]} {activeSnapshot.snapshot_year})</span>
                            : <span style={{ color: '#e65100', fontWeight: 'bold' }}> LIVE (from GSTR-2A)</span>
                        }
                    </div>
                </div>

                {/* Snapshots List */}
                {snapshots.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #ddd', marginBottom: '15px' }}>
                        <div style={{ background: '#e8f5e9', borderBottom: '1px solid #ddd', padding: '8px 15px', fontSize: '13px', fontWeight: 'bold', color: '#2e7d32' }}>
                            Generated GSTR-2B Snapshots
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Month</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Year</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Generated On</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total ITC Available (₹)</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {snapshots.map((s, i) => (
                                    <tr key={i} style={{ background: activeSnapshot?.id === s.id ? '#e3f2fd' : 'white' }}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{MONTHS[s.snapshot_month - 1]}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.snapshot_year}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(s.generated_at).toLocaleString('en-IN')}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#1565c0' }}>
                                            ₹{fmt(s.total_itc_available)}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', fontSize: '11px', border: '1px solid #c8e6c9' }}>{s.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Main Card */}
                <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px' }}>

                    {/* Top Tabs + Generate Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', marginBottom: '20px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex' }}>
                            {['SUMMARY', 'ALL TABLES'].map(tab => (
                                <button key={tab} onClick={() => setActiveMainTab(tab)}
                                    style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', border: 'none', background: 'none',
                                        color: activeMainTab === tab ? '#333' : '#007bff',
                                        borderBottom: activeMainTab === tab ? '3px solid #007bff' : 'none',
                                        fontWeight: activeMainTab === tab ? 'bold' : 'normal' }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowGenerateModal(true)}
                            style={{ marginBottom: '5px', background: '#2e7d32', color: 'white', border: 'none', padding: '8px 18px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Generate GSTR-2B
                        </button>
                    </div>

                    {!activeSnapshot && (
                        <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', padding: '10px', fontSize: '13px', marginBottom: '15px' }}>
                            <strong>Showing Live GSTR-2A Data.</strong> No GSTR-2B snapshot has been generated yet. Click <em>"Generate GSTR-2B"</em> to create a locked monthly statement.
                        </div>
                    )}

                    {activeMainTab === 'SUMMARY' && (
                        <>
                            {/* ITC Available Sub-tabs */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ display: 'flex' }}>
                                    {[
                                        { key: 'itc_available', label: 'ITC available', activeColor: '#20b2aa' },
                                        { key: 'itc_not_available', label: 'ITC Not Available', activeColor: '#d9534f' },
                                        { key: 'itc_reversal', label: 'ITC Reversal', activeColor: '#d9534f' },
                                        { key: 'itc_rejected', label: 'ITC Rejected', activeColor: '#d9534f' },
                                    ].map(({ key, label, activeColor }) => (
                                        <button key={key} onClick={() => setActiveSubTab(key)}
                                            style={{ padding: '8px 15px', cursor: 'pointer', fontSize: '13px',
                                                border: '1px solid #007bff', borderRight: 'none', background: activeSubTab === key ? activeColor : 'white',
                                                color: activeSubTab === key ? 'white' : '#007bff' }}>
                                            {label}
                                        </button>
                                    ))}
                                    <button style={{ padding: '8px 15px', fontSize: '13px', border: '1px solid #007bff', background: 'white', color: '#007bff' }}>ITC Rejected</button>
                                </div>
                                <button style={{ background: '#337ab7', color: 'white', border: 'none', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', height: '30px', alignSelf: 'center' }}>HELP</button>
                            </div>

                            {activeSubTab === 'itc_available' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #ddd' }}>
                                    <thead>
                                        <tr>
                                            {['S.NO.','Heading  ' + `[Expand All]`,'GSTR-3B table','Integrated Tax (₹)','Central Tax (₹)','State/UT Tax (₹)','Cess (₹)'].map((h, i) => (
                                                <th key={i} onClick={i === 1 ? expandAll : undefined}
                                                    style={{ border: '1px solid #ddd', padding: '8px', textAlign: i > 2 ? 'right' : 'center', background: '#e6f2eb', color: '#2e7d32', cursor: i===1 ? 'pointer' : 'default', fontSize: '12px' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>Part A</td><td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px' }}>ITC Available - Credit may be claimed in relevant headings in GSTR-3B</td></tr>

                                        {/* Section I */}
                                        <tr style={{ fontWeight: '500' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>I</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => toggleRow('a1')}>
                                                All other ITC - Supplies from registered persons
                                            </td>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>4(A)(5)</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partAI.igst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partAI.cgst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partAI.sgst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partAI.cess)}</td>
                                        </tr>
                                        {expandedRows['a1'] && <>
                                            <ChildRow title="B2B - Invoices - IMS" sumData={displaySums.b2bRegular} />
                                            <ChildRow title="B2B - Invoices (Amendment) - IMS" sumData={displaySums.amended} />
                                            <ChildRow title="ECO - Documents - IMS" sumData={emptySum} />
                                        </>}

                                        {/* Section II */}
                                        <tr style={{ fontWeight: '500' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>II</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => toggleRow('a2')}>
                                                Inward Supplies from ISD
                                            </td>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>4(A)(4)</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                        </tr>
                                        {expandedRows['a2'] && <><ChildRow title="ISD - Invoices" sumData={emptySum} /><ChildRow title="ISD - Invoices (Amendment)" sumData={emptySum} /></>}

                                        {/* Section III */}
                                        <tr style={{ fontWeight: '500' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>III</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => toggleRow('a3')}>
                                                Inward Supplies liable for reverse charge
                                            </td>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>3.1(d)<br/>4(A)(3)</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                        </tr>

                                        {/* Section IV */}
                                        <tr style={{ fontWeight: '500' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>IV</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Import of Goods</td>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>4(A)(1)</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>0.00</td>
                                        </tr>

                                        <tr><td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>Part B</td><td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px' }}>ITC Available - Credit notes should be net off against relevant ITC available headings in GSTR-3B</td></tr>

                                        {/* Part B I */}
                                        <tr style={{ fontWeight: '500' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>I</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }} onClick={() => toggleRow('b1')}>
                                                Others
                                            </td>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>4(A)</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partBI.igst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partBI.cgst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partBI.sgst)}</td>
                                            <td style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}>{fmt(partBI.cess)}</td>
                                        </tr>
                                        {expandedRows['b1'] && <>
                                            <ChildRow title="B2B - Credit notes - IMS" sumData={displaySums.cdnrNotes} />
                                            <ChildRow title="ISD - Credit notes" sumData={emptySum} />
                                        </>}
                                    </tbody>
                                </table>
                            )}

                            {(activeSubTab === 'itc_not_available' || activeSubTab === 'itc_reversal' || activeSubTab === 'itc_rejected') && (
                                <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '20px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
                                    No {activeSubTab.replace(/_/g, ' ').toUpperCase()} records found.
                                </div>
                            )}
                        </>
                    )}

                    {activeMainTab === 'ALL TABLES' && (
                        <div>
                            {gstr2bRecords.b2b.length === 0 && gstr2bRecords.cdnr.length === 0 ? (
                                <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '20px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
                                    No GSTR-2B snapshot records found. Generate a GSTR-2B snapshot to view locked records here.
                                </div>
                            ) : (
                                <>
                                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>B2B Invoices ({gstr2bRecords.b2b.length})</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                                        <thead>
                                            <tr style={{ background: '#d9edf7' }}>
                                                {['Supplier GSTIN','Supplier Name','Invoice No','Invoice Date','Taxable Value','IGST','CGST','SGST','ITC Status'].map(h => (
                                                    <th key={h} style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'center' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gstr2bRecords.b2b.map((r, i) => (
                                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px' }}>{r.supplier_gstin}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px' }}>{r.supplier_name}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', color: '#1a73e8' }}>{r.invoice_number}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px' }}>{r.invoice_date}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'right' }}>{fmt(r.taxable_value)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'right' }}>{fmt(r.igst)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'right' }}>{fmt(r.cgst)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'right' }}>{fmt(r.sgst)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '7px', textAlign: 'center' }}>
                                                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', fontSize: '10px', border: '1px solid #c8e6c9' }}>{r.itc_status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                    <button onClick={() => navigate('/returns/gstr2a')} style={{ background: 'white', color: '#333', border: '1px solid #ccc', padding: '8px 15px', fontSize: '13px', cursor: 'pointer' }}>Back to GSTR-2A</button>
                    <button onClick={() => navigate('/returns-dashboard')} style={{ background: '#284b7a', color: 'white', border: 'none', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>BACK TO DASHBOARD</button>
                </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#123456', color: 'white', padding: '20px 10%', display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '20px' }}>
                <span>© 2025-26 Goods and Services Tax Network</span>
                <span>Designed &amp; Developed by GSTN</span>
            </div>
        </div>
    );
};

export default GSTR2BSummary;
