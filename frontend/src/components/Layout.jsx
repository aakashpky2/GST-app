import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState('registration');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // All paths that use the GST portal's own nav (bd-navbar) instead of the Layout navbar
    const isDashboard = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/returns') ||
        location.pathname.startsWith('/payment') ||
        location.pathname.startsWith('/business-details') ||
        location.pathname.startsWith('/promoter-partners') ||
        location.pathname.startsWith('/authorized-signatory') ||
        location.pathname.startsWith('/authorized-representative') ||
        location.pathname.startsWith('/principal-place-of-business') ||
        location.pathname.startsWith('/additional-places-of-business') ||
        location.pathname.startsWith('/goods-and-services') ||
        location.pathname.startsWith('/state-specific-information') ||
        location.pathname.startsWith('/aadhaar-authentication') ||
        location.pathname.startsWith('/verification');

    const toggleMenu = (menu) => {
        if (activeMenu === menu) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menu);
        }
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/logout');
    };

    return (
        <div className="app-container" onClick={handleBackdropClick}>
            {/* Top Accessibility Bar — hidden on dashboard/business-details */}
            {!isDashboard && (
                <div className="top-bar">
                    <span className="top-bar-item">Skip to Main Content</span>
                    <span className="top-bar-item">A-</span>
                    <span className="top-bar-item">A</span>
                    <span className="top-bar-item">A+</span>
                    <span className="top-bar-item">English</span>
                </div>
            )}

            {/* Main Header */}
            <header className="main-header">
                <div className="header-left">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            src="/logo.png"
                            alt="Ashoka Emblem"
                            className="ashoka-logo-main"
                            style={{ height: '65px', filter: 'brightness(0) invert(1)' }}
                        />
                        <div className="brand-titles" style={{ marginLeft: '15px' }}>
                            <h1 style={{ color: 'white', fontSize: '24px', margin: 0, fontWeight: '500' }}>Goods and Services Tax</h1>
                            <p style={{ color: '#cbd5e0', fontSize: '14px', margin: 0 }}>Government of India, States and Union Territories</p>
                        </div>
                    </Link>
                </div>
                <div className="header-right">
                    {isDashboard ? (
                        <div className="header-dashboard-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'white' }}>
                            {/* User Profile Dropdown */}
                            <div
                                className="user-profile-dropdown"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
                                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(prev => !prev); }}
                            >
                                <span className="user-icon">👤</span>
                                <span className="user-name" style={{ fontWeight: '500', fontSize: '14px' }}>{localStorage.getItem('gst_legal_name') || 'GST USER'} ▾</span>

                                {showProfileMenu && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            backgroundColor: 'white',
                                            color: '#333',
                                            minWidth: '240px',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                            zIndex: 9999,
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Last Logged In */}
                                        <div style={{ backgroundColor: '#f1f3f6', padding: '10px 15px', borderBottom: '1px solid #ddd', fontSize: '12px', color: '#444' }}>
                                            <p style={{ margin: 0 }}>Last Logged In at</p>
                                            <p style={{ margin: '2px 0 0 0', fontWeight: 'bold' }}>{new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</p>
                                        </div>
                                        {/* Options */}
                                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    <span>👤</span> My Profile
                                                </button>
                                            </li>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); navigate('/change-password'); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    <span>🔒</span> Change Password
                                                </button>
                                            </li>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    <span>✅</span> Register / Update DSC
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    <span>🚪</span> Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="notifications-icon" style={{ position: 'relative', cursor: 'pointer' }}>
                                <span style={{ fontSize: '18px' }}>🔔</span>
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-8px',
                                    backgroundColor: '#00bcd4',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}>0</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button className="btn-register" onClick={() => navigate('/registration')}>Register</button>
                            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                        </>
                    )}
                </div>
            </header>

            <style>{`
                .navbar-wrapper {
                    position: relative;
                }
                .nav-item {
                    display: flex;
                }
                .dropdown-panel {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: #fff;
                    z-index: 9999;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
                }
                .dropdown-main-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: #f5f8fa;
                }
                .dropdown-main-item {
                    padding: 14px 22px;
                    color: #001b5c;
                    font-size: 15px;
                    cursor: pointer;
                }
                .dropdown-main-item.active {
                    border-bottom: 2px solid #001b5c;
                    background: #fff;
                }
                .dropdown-sub-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    padding: 12px 22px;
                    gap: 14px 80px;
                }
                .dropdown-sub-row a {
                    color: #001b5c;
                    font-size: 15px;
                    text-decoration: none;
                }
                .dropdown-sub-row a:hover {
                    color: #0070c9;
                }
                .services-active-teal {
                    background-color: #00a2b0 !important;
                }
                .services-active-btn {
                    color: #ffffff !important;
                    background-color: #00a2b0 !important;
                }
            `}</style>
            
            {/* Navigation Bar */}
            <nav className="navbar navbar-wrapper" style={{ overflow: 'visible' }}>
                {!isDashboard ? (
                    <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '/logout' ? 'active' : ''}`} onClick={() => setActiveDropdown(null)}>Home</Link>
                ) : (
                    <Link to="/dashboard" className="nav-link active" onClick={() => setActiveDropdown(null)}>Dashboard</Link>
                )}
                
                <div 
                    className={`nav-item ${location.pathname === '/forgot-password' || location.pathname === '/services/forgotpassword' ? 'services-active-teal' : ''}`}
                    onMouseEnter={() => setActiveDropdown('services')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'services' ? 'active-link' : ''} ${location.pathname === '/forgot-password' || location.pathname === '/services/forgotpassword' ? 'services-active-btn' : ''}`}>
                        Services ▾
                    </button>
                </div>

                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>GST Law</a>
                
                <div 
                    className="nav-item"
                    onMouseEnter={() => setActiveDropdown('downloads')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'downloads' ? 'active-link' : ''}`}>
                        Downloads ▾
                    </button>
                </div>

                <div 
                    className="nav-item"
                    onMouseEnter={() => setActiveDropdown('searchTaxpayer')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'searchTaxpayer' ? 'active-link' : ''}`}>
                        Search Taxpayer ▾
                    </button>
                </div>

                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>Help and Taxpayer Facilities</a>
                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>e-Invoice</a>
                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>News and Updates</a>

                {/* Dropdowns */}
                {activeDropdown === 'services' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('services')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row">
                            <div className={`dropdown-main-item ${activeSubMenu === 'registration' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('registration')}>Registration</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'payments' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('payments')}>Payments</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'userServices' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('userServices')}>User Services</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'refunds' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('refunds')}>Refunds</div>
                            <div className="dropdown-main-item" onMouseEnter={() => setActiveSubMenu('eway')}>e-Way Bill System</div>
                            <div className="dropdown-main-item" onMouseEnter={() => setActiveSubMenu('track')}>Track Application Status</div>
                        </div>
                        {activeSubMenu === 'registration' && (
                            <div className="dropdown-sub-row">
                                <Link to="/registration" onClick={() => setActiveDropdown(null)}>New Registration</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Track Application Status</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Application for Filing Clarifications</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Home State GSK selection for Promoter/Director of specific COBs</Link>
                            </div>
                        )}
                        {activeSubMenu === 'payments' && (
                            <div className="dropdown-sub-row">
                                <Link to="/payments/create-challan" onClick={() => setActiveDropdown(null)}>Create Challan</Link>
                                <Link to="/payments/track-status" onClick={() => setActiveDropdown(null)}>Track Payment Status</Link>
                                <Link to="/payments/grievance" onClick={() => setActiveDropdown(null)}>Grievance against Payment (GST PMT-07)</Link>
                            </div>
                        )}
                        {activeSubMenu === 'userServices' && (
                            <div className="dropdown-sub-row">
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Search HSN Code</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Generate User ID for Unregistered Applicant</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Cause List</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Verify RFN</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Holiday List</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Locate GST Practitioner (GSTP)</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Search Advance Ruling</Link>
                            </div>
                        )}
                        {activeSubMenu === 'refunds' && (
                            <div className="dropdown-sub-row">
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Track Application Status</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeDropdown === 'downloads' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('downloads')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row">
                            <div className={`dropdown-main-item ${activeSubMenu === 'offlineTools' || activeSubMenu === 'registration' || activeSubMenu === 'payments' || activeSubMenu === 'userServices' || activeSubMenu === 'refunds' || activeSubMenu === 'eway' || activeSubMenu === 'track' ? 'active' : 'active'}`} onMouseEnter={() => setActiveSubMenu('offlineTools')}>Offline Tools</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'gstStatistics' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('gstStatistics')}>GST Statistics</div>
                        </div>
                        {activeSubMenu !== 'gstStatistics' && (
                            <div className="dropdown-sub-row" style={{ alignItems: 'start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>Returns Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>Tran-1 Offline Tools</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR3B Offline Utility</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>ITC03 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GST ARA 01 - Application for Advance Ruling</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR 6 Offline Tool With Amendments</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR7 Offline Utility</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>SRM-I Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR10 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR-9A Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR-4 Offline Tool (Annual)</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>IMS Offline Tool</Link>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>Matching Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>Tran-2 Offline Tools</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>ITC01 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>ITC04 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR-4 Offline Tool (Quarterly filing)</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR 11 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR8 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>SRM-II Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR-9 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR-9C Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GST DRC-22A - Application for Objection to Provisional Attachment Order</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>TDS & TCS Credit Received Offline Tool</Link>
                                </div>
                            </div>
                        )}
                        {activeSubMenu === 'gstStatistics' && (
                            <div className="dropdown-sub-row">
                                <Link to="#" onClick={() => setActiveDropdown(null)}>GST Statistics</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeDropdown === 'searchTaxpayer' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('searchTaxpayer')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row" style={{ background: '#fff', padding: '14px 22px', gap: '34px' }}>
                            <Link to="/search-taxpayer/gstin" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search by GSTIN/UIN</Link>
                            <Link to="/search-taxpayer/pan" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search by PAN</Link>
                            <Link to="/search-taxpayer/migrated" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search Migrated Taxpayer</Link>
                            <Link to="/search-taxpayer/composition" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search Composition Taxpayer</Link>
                            <Link to="/search-taxpayer/cancelled" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search Cancelled Provisional IDs</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main style={isDashboard ? { padding: 0, margin: 0 } : {}}>
                {children}
            </main>

            {/* Footer */}
            {!isDashboard && (
                <footer className="footer">
                    <div className="footer-top">
                        <div className="footer-grid">
                            <div className="footer-col">
                                <h3>About GST</h3>
                                <ul>
                                    <li><a href="#">GST Council Structure</a></li>
                                    <li><a href="#">GST History</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Website Policies</h3>
                                <ul>
                                    <li><a href="#">Website Policy</a></li>
                                    <li><a href="#">Terms and Conditions</a></li>
                                    <li><a href="#">Hyperlink Policy</a></li>
                                    <li><a href="#">Disclaimer</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Related Sites</h3>
                                <ul>
                                    <li><a href="#">Central Board of Indirect Taxes and Customs</a></li>
                                    <li><a href="#">State Tax Websites</a></li>
                                    <li><a href="#">National Portal</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Help and Taxpayer Facilities</h3>
                                <ul>
                                    <li><a href="#">System Requirements</a></li>
                                    <li><a href="#">GST Knowledge Portal</a></li>
                                    <li><a href="#">GST Media</a></li>
                                    <li><a href="#">Site Map</a></li>
                                    <li><a href="#">Grievance Redressal Portal</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Contact Us</h3>
                                <ul>
                                    <li><a href="#">Help Desk Number:</a></li>
                                    <li className="contact-bold">1800-103-4786</li>
                                    <li className="social-links">
                                        <a href="#" className="social-icon">f</a>
                                        <a href="#" className="social-icon">t</a>
                                        <a href="#" className="social-icon">yt</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Goods and Services Tax Network</p>
                        <p className="footer-design">Designed and Developed by GSTN</p>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
