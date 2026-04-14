import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();
            const response = await api.post('/auth/login', { username: trimmedUsername, password: trimmedPassword });
            const { token, user } = response.data;
            const actualTrn = user?.trn || trimmedUsername;

            // Store token and user details in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('gst_trn', actualTrn);
            localStorage.setItem('trn', actualTrn);
            localStorage.setItem('username', user?.username || trimmedUsername);
            localStorage.setItem('gst_legal_name', user?.legal_name || '');
            localStorage.setItem('gst_pan', user?.pan || '');
            localStorage.setItem('gst_state', user?.state || '');
            
            // Redirect to dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link> &gt; Login
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h2>Login</h2>
                    <span className="mandatory-label">
                        <span className="red-dot">●</span> indicates mandatory fields
                    </span>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username <span className="red-dot">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password <span className="red-dot">*</span></label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>



                    <button type="submit" className="btn-login-submit" disabled={loading}>
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>


                    <div className="login-footer-links">
                        <Link to="/forgot-username" className="link-blue">Forgot Username</Link>
                        <Link to="/forgot-password" className="link-blue">Forgot Password</Link>
                    </div>

                    <div className="first-time-login">
                        <p>
                            <span className="info-icon-dark">ⓘ</span> <strong>First time login:</strong> If you are logging in for the first time, click <Link to="/new-login" className="link-blue">here</Link> to log in.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
