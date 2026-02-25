"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Subscribe() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        paymentDate: new Date().toISOString().split('T')[0],
        durationMonths: '1'
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowSuccess(true);
            } else {
                alert('Failed to save subscription. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="logo-container">
                    <Link href="/" className="logo-text">D<span>FITNESS</span> PLANET</Link>
                </div>
            </nav>

            <main className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary-gold)' }}>
                        Join The Planet
                    </h2>

                    <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--darker-bg)', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '1rem' }}>SCAN TO PAY (UPI)</h3>
                        <div style={{
                            width: '200px', height: '200px', background: 'white', margin: '0 auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
                            border: '4px solid var(--primary-gold)'
                        }}>
                            <p style={{ color: '#000', fontWeight: 'bold' }}>[ UPI QR CODE HERE ]</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" required
                                value={formData.name} onChange={handleChange} placeholder="John Doe" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" name="phone" className="form-input" required
                                value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Payment</label>
                            <input type="date" name="paymentDate" className="form-input" required
                                value={formData.paymentDate} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Subscription Duration</label>
                            <select name="durationMonths" className="form-select" required
                                value={formData.durationMonths} onChange={handleChange}>
                                <option value="1">1 Month</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">1 Year</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Subscription'}
                        </button>
                    </form>
                </div>

                {/* Success Modal */}
                {showSuccess && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                    }}>
                        <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                            }}>
                                <span style={{ fontSize: '2rem', color: 'var(--success)' }}>✓</span>
                            </div>
                            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Subscription Successful!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Welcome to DFitness Planet. Your journey begins now.
                            </p>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => router.push('/')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
