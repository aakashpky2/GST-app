import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CreateChallan = () => {
    const [gstin, setGstin] = useState('');
    const [error, setError] = useState('');

    const handleProceed = (e) => {
        e.preventDefault();
        if (!gstin.trim()) {
            setError('This field is required');
        } else {
            setError('');
            // Logic to proceed
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Payment</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Create Challan</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                
                {/* Language Selector */}
                <div style={{ position: 'absolute', top: '15px', right: '30px', display: 'flex', alignItems: 'center', fontSize: '14px', color: '#333' }}>
                    <span style={{ marginRight: '5px' }}>🌐</span>
                    <select style={{ border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', color: '#0056b3', fontWeight: '500' }}>
                        <option value="english">English</option>
                    </select>
                </div>

                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: 0 }}>
                        Create Challan
                    </h2>
                </div>

                <div style={{ textAlign: 'right', marginBottom: '30px', fontSize: '13px', color: '#d32f2f' }}>
                    <span style={{ fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <form onSubmit={handleProceed} style={{ width: '400px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                GSTIN/Other Id <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={gstin}
                                onChange={(e) => {
                                    setGstin(e.target.value);
                                    if (e.target.value.trim()) setError('');
                                }}
                                placeholder="Enter GSTIN/Other Id"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    fontSize: '14px', 
                                    border: `1px solid ${error ? '#d32f2f' : '#ccc'}`, 
                                    borderRadius: '4px',
                                    outline: 'none',
                                    textTransform: 'uppercase'
                                }}
                            />
                            {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button 
                                type="submit" 
                                style={{ 
                                    backgroundColor: '#0f4c81', 
                                    color: '#fff', 
                                    border: 'none', 
                                    padding: '10px 30px', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                PROCEED
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateChallan;
