"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    // Renew Modal State
    const [renewModal, setRenewModal] = useState({ isOpen: false, memberId: null, duration: '1' });

    // Edit Modal State
    const [editModal, setEditModal] = useState({ isOpen: false, member: null });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null, memberName: '' });

    // Fetch members
    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/members');
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const openRenewModal = (id) => {
        setRenewModal({ isOpen: true, memberId: id, duration: '1' });
    };

    const handleRenewSubmit = async (e) => {
        e.preventDefault();
        const { memberId, duration } = renewModal;
        if (!memberId || !duration) return;

        try {
            const res = await fetch(`/api/members/${memberId}/renew`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationMonths: parseInt(duration, 10) })
            });

            if (res.ok) {
                // Ignore the JSON body just in case it's empty, we only care about the 200 OK status
                fetchMembers();
                setRenewModal({ isOpen: false, memberId: null, duration: '1' });
            } else {
                try {
                    const errorData = await res.json();
                    alert(`Failed to renew: ${errorData.error || 'Server error'}`);
                } catch (e) {
                    alert("Failed to renew due to a server error.");
                }
            }
        } catch (e) {
            console.error("Renewal Error:", e);
            alert("Network error during renewal.");
        }
    };

    const openEditModal = (member) => {
        setEditModal({ isOpen: true, member: { ...member, trainer: member.trainer || 'None' } });
    };

    const closeEditModal = () => {
        setEditModal({ isOpen: false, member: null });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const { id, name, phone, trainer } = editModal.member;

        const payload = {
            name,
            phone,
            trainer: trainer === 'None' ? null : trainer
        };

        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchMembers();
                closeEditModal();
            } else {
                alert("Failed to update user details.");
            }
        } catch (e) {
            console.error("Edit Error:", e);
            alert("Network error during update.");
        }
    };

    const openDeleteModal = (id, name) => {
        setDeleteModal({ isOpen: true, memberId: id, memberName: name });
    };

    const confirmDelete = async () => {
        const { memberId } = deleteModal;
        if (!memberId) return;

        try {
            const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMembers();
                setDeleteModal({ isOpen: false, memberId: null, memberName: '' });
            } else {
                alert("Failed to delete user.");
            }
        } catch (e) {
            console.error("Delete Error:", e);
            alert("Network error during deletion.");
        }
    };

    const getStatus = (paymentDate, durationMonths) => {
        const start = new Date(paymentDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + durationMonths);
        const now = new Date();

        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Expired', color: 'danger', days: diffDays };
        if (diffDays <= 3) return { label: 'Expiring Soon', color: 'warning', days: diffDays };
        return { label: 'Active', color: 'active', days: diffDays };
    };

    const filteredMembers = useMemo(() => {
        return members.filter(m =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.phone.includes(search)
        ).map(m => ({ ...m, status: getStatus(m.paymentDate, m.durationMonths) }));
    }, [members, search]);

    const stats = useMemo(() => {
        let active = 0, expiring = 0, expired = 0;
        filteredMembers.forEach(m => {
            if (m.status.color === 'active') active++;
            else if (m.status.color === 'warning') expiring++;
            else expired++;
        });
        return { active, expiring, expired, total: filteredMembers.length };
    }, [filteredMembers]);

    useEffect(() => {
        if (stats.expired > 0) {
            setShowPopup(true);
        }
    }, [stats.expired]);

    return (
        <div className="page-wrapper" style={{ backgroundColor: 'var(--darker-bg)' }}>
            <nav className="navbar">
                <div className="logo-container">
                    <Link href="/" className="logo-text">D<span>FITNESS</span> ADMIN</Link>
                </div>
                <div>
                    <Link href="/" className="btn-secondary">Back to Home</Link>
                </div>
            </nav>

            {!isAuthenticated ? (
                <main className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
                            border: '2px solid var(--primary-gold)'
                        }}>
                            <span style={{ fontSize: '2.5rem' }}>🔒</span>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary-gold)', fontSize: '1.8rem' }}>Admin Access</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please enter the master password to unlock the dashboard.</p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (passwordInput === 'Dfitnessadmin') {
                                setIsAuthenticated(true);
                                setAuthError('');
                            } else {
                                setAuthError('Incorrect password. Access denied.');
                                setPasswordInput('');
                            }
                        }}>
                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter Password..."
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    autoFocus
                                    style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px' }}
                                />
                                {authError && <p style={{ color: 'var(--danger)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{authError}</p>}
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                Unlock Dashboard
                            </button>
                        </form>
                    </div>
                </main>
            ) : (
                <>
                    {/* Expired Users Popup */}
                    {showPopup && (
                        <div style={{
                            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                            background: 'var(--danger)', color: 'white', padding: '1rem 1.5rem',
                            borderRadius: '8px', boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.2rem' }}>⚠️ Action Required</strong>
                                <span>You have {stats.expired} expired subscription(s)!</span>
                            </div>
                            <button onClick={() => setShowPopup(false)} style={{
                                background: 'transparent', border: 'none', color: 'white',
                                fontSize: '1.2rem', cursor: 'pointer', marginLeft: '0.5rem'
                            }}>✕</button>
                        </div>
                    )}

                    {/* Renew Modal */}
                    {renewModal.isOpen && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                        }}>
                            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-gold)' }}>Renew Subscription</h2>
                                <form onSubmit={handleRenewSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Duration</label>
                                        <select
                                            className="form-select"
                                            value={renewModal.duration}
                                            onChange={(e) => setRenewModal({ ...renewModal, duration: e.target.value })}
                                        >
                                            <option value="1">1 Month</option>
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">1 Year</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button type="button" className="btn-secondary" style={{ flex: 1 }}
                                            onClick={() => setRenewModal({ isOpen: false, memberId: null, duration: '1' })}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                                            Confirm
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editModal.isOpen && editModal.member && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                        }}>
                            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-gold)' }}>Edit User Details</h2>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editModal.member.name}
                                            onChange={(e) => setEditModal({ ...editModal, member: { ...editModal.member, name: e.target.value } })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={editModal.member.phone}
                                            onChange={(e) => setEditModal({ ...editModal, member: { ...editModal.member, phone: e.target.value } })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Assigned PT Trainer</label>
                                        <select
                                            className="form-select"
                                            value={editModal.member.trainer}
                                            onChange={(e) => setEditModal({ ...editModal, member: { ...editModal.member, trainer: e.target.value } })}
                                        >
                                            <option value="None">None</option>
                                            <option value="Deepu">Deepu</option>
                                            <option value="Owais">Owais</option>
                                            <option value="Nandan">Nandan</option>
                                            <option value="Vaishak">Vaishak</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button type="button" className="btn-secondary" style={{ flex: 1 }}
                                            onClick={closeEditModal}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {deleteModal.isOpen && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                        }}>
                            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 71, 87, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                                }}>
                                    <span style={{ fontSize: '2rem', color: 'var(--danger)' }}>⚠️</span>
                                </div>
                                <h2 style={{ marginBottom: '1rem', color: 'white' }}>Delete Member</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                    Are you sure you want to delete <strong>{deleteModal.memberName}</strong>? This action cannot be undone.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn-secondary" style={{ flex: 1 }}
                                        onClick={() => setDeleteModal({ isOpen: false, memberId: null, memberName: '' })}>
                                        Cancel
                                    </button>
                                    <button className="btn-primary" style={{ flex: 1, padding: '0.8rem', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                                        onClick={confirmDelete}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <main className="container" style={{ padding: '2rem 1rem' }}>
                        <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Admin Dashboard</h1>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h3 style={{ color: 'var(--text-muted)' }}>Total Members</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total}</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(46, 213, 115, 0.3)' }}>
                                <h3 style={{ color: 'var(--success)' }}>Active</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.active}</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(255, 165, 2, 0.3)' }}>
                                <h3 style={{ color: 'var(--warning)' }}>Expiring Soon</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.expiring}</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
                                <h3 style={{ color: 'var(--danger)' }}>Expired</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.expired}</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                className="form-input"
                                style={{ width: '100%', maxWidth: '400px' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Table */}
                        <div className="card table-responsive" style={{ padding: '0' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--dark-bg)', borderBottom: '1px solid var(--card-border)' }}>
                                            <th style={{ padding: '1rem' }}>Name</th>
                                            <th style={{ padding: '1rem' }}>Phone</th>
                                            <th style={{ padding: '1rem' }}>Status</th>
                                            <th style={{ padding: '1rem' }}>Trainer</th>
                                            <th style={{ padding: '1rem' }}>Days Left</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((m) => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{m.name}</td>
                                                <td style={{ padding: '1rem' }}>{m.phone}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`badge badge-${m.status.color}`}>{m.status.label}</span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--primary-gold)' }}>
                                                    {m.trainer || '--'}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {m.status.days > 0 ? `${m.status.days} days` : 'Expired'}
                                                </td>
                                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    {(m.status.color === 'warning' || m.status.color === 'danger') && (
                                                        <a
                                                            href={`tel:${m.phone.replace(/[^0-9+]/g, '')}`}
                                                            className="btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        >
                                                            Call
                                                        </a>
                                                    )}
                                                    <button onClick={() => openRenewModal(m.id)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                        Renew
                                                    </button>
                                                    <button onClick={() => openEditModal(m)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.2)' }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => openDeleteModal(m.id, m.name)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredMembers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No members found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </>
            )}
        </div>
    );
}
