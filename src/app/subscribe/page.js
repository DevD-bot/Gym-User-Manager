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

    const generateWhatsAppReceipt = () => {
        const { name, phone, durationMonths, paymentDate } = formData;
        // Calculate Expiry Date roughly based on months
        const start = new Date(paymentDate);
        const expiry = new Date(start.setMonth(start.getMonth() + parseInt(durationMonths, 10)));
        const formattedExpiry = expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const formattedStart = new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        const message = `*DFITNESS PLANET RECEIPT*\n\nHi ${name},\nWelcome to the planet! Your subscription is confirmed.\n\n*Plan:* ${durationMonths} Month(s)\n*Start Date:* ${formattedStart}\n*Valid Until:* ${formattedExpiry}\n\nLet's crush those goals!`;

        // WhatsApp Click to Chat URL format: https://wa.me/PHONENUMBER?text=URLENCODED_MESSAGE
        // Make sure phone number only has digits and country code
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        const finalPhone = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : `91${cleanPhone}`;

        return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a
                                    href={generateWhatsAppReceipt()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp"
                                    style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                                    onClick={() => router.push('/')}
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                    </svg>
                                    Send Digital Receipt
                                </a>

                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%' }}
                                    onClick={() => router.push('/')}
                                >
                                    No Thanks, Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
