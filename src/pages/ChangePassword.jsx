import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New Password and Re-confirm Password do not match.');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('Password must be 8–15 characters, with at least one number, special character, uppercase and lowercase letter.');
            return;
        }

        const username = localStorage.getItem('gst_username') || localStorage.getItem('username');
        if (!username) {
            toast.error('Session expired. Please login again.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/change-password', {
                username,
                oldPassword,
                newPassword
            });

            if (res.data.success) {
                toast.success('Password changed successfully! Please login again.');
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/logout');
                }, 2000);
            } else {
                toast.error(res.data.message || 'Failed to change password.');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'An error occurred. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f3f6', minHeight: '80vh' }}>
            <Toaster position="top-right" />

            {/* Breadcrumb */}
            <div style={{ padding: '10px 130px', fontSize: '13px', color: '#1a237e', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid #ddd' }}>
                <Link to="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>Dashboard</Link>
            </div>

            {/* Form Card */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '700px', padding: '30px 40px', boxShadow: '0 1px 5px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '22px', color: '#333', fontWeight: '400', marginBottom: '20px' }}>Change Password</h2>

                    <div style={{ textAlign: 'right', fontSize: '13px', color: '#444', marginBottom: '20px' }}>
                        <span style={{ color: 'red' }}>•</span> indicates mandatory fields
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Old Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '6px', fontWeight: '500' }}>
                                Old Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter old Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* New Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '6px', fontWeight: '500' }}>
                                New Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Re-confirm Password */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '6px', fontWeight: '500' }}>
                                Re-confirm Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Re-enter New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Password hint */}
                        <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', padding: '12px 15px', fontSize: '12px', color: '#555', marginBottom: '25px', lineHeight: '1.6' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold', marginRight: '5px' }}>ℹ</span>
                            Password should be of 8 to 15 characters (where the <strong>minimum length</strong> is 8 characters and maximum length is 15 characters) which should comprise of at least <strong>one</strong> number, special character and letters( at least one <strong>upper</strong> and <strong>lower case</strong>)
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: loading ? '#9e9e9e' : '#2b4b7c', color: 'white', border: 'none', padding: '10px 30px', fontSize: '14px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px' }}
                        >
                            {loading ? 'PLEASE WAIT...' : 'CHANGE PASSWORD'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
