import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState(null);
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

            {/* Navigation Bar */}
            <nav className="navbar">
                {!isDashboard ? (
                    <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '/logout' ? 'active' : ''}`} onClick={() => setActiveMenu(null)}>Home</Link>
                ) : (
                    <Link to="/dashboard" className="nav-link active" onClick={() => setActiveMenu(null)}>Dashboard</Link>
                )}
                <button
                    className={`nav-link-btn ${activeMenu === 'services' ? 'active-link' : ''}`}
                    onClick={() => toggleMenu('services')}
                >
                    Services ▾
                </button>
                <a href="#" className="nav-link" onClick={() => setActiveMenu(null)}>GST Law</a>
                <button
                    className={`nav-link-btn ${activeMenu === 'downloads' ? 'active-link' : ''}`}
                    onClick={() => toggleMenu('downloads')}
                >
                    Downloads ▾
                </button>
                <button
                    className={`nav-link-btn ${activeMenu === 'search' ? 'active-link' : ''}`}
                    onClick={() => toggleMenu('search')}
                >
                    Search Taxpayer ▾
                </button>
                <a href="#" className="nav-link" onClick={() => setActiveMenu(null)}>Help and Taxpayer Facilities</a>
                <a href="#" className="nav-link" onClick={() => setActiveMenu(null)}>e-Invoice</a>
                <a href="#" className="nav-link" onClick={() => setActiveMenu(null)}>News and Updates</a>
            </nav>

            {/* Sub-navbars */}
            {activeMenu === 'services' && (
                <div className="sub-navbar">
                    <Link to="/registration" className="sub-nav-link" onClick={() => setActiveMenu(null)}>Registration</Link>
                    <a href="#" className="sub-nav-link">Payments</a>
                    <a href="#" className="sub-nav-link">User Services</a>
                    <a href="#" className="sub-nav-link">Refunds</a>
                    <a href="#" className="sub-nav-link">e-Way Bill System</a>
                    <a href="#" className="sub-nav-link">Track Application Status</a>
                </div>
            )}

            {activeMenu === 'downloads' && (
                <div className="sub-navbar">
                    <a href="#" className="sub-nav-link">Offline Tools</a>
                    <a href="#" className="sub-nav-link">GST Statistics</a>
                </div>
            )}

            {activeMenu === 'search' && (
                <div className="sub-navbar">
                    <a href="#" className="sub-nav-link">Search by GSTIN/UIN</a>
                    <a href="#" className="sub-nav-link">Search by PAN</a>
                    <a href="#" className="sub-nav-link">Search Temporary ID</a>
                    <a href="#" className="sub-nav-link">Search Composition Taxpayer</a>
                </div>
            )}

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
