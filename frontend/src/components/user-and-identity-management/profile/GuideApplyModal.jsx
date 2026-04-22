import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, CheckCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const LANGUAGES = ["English", "Sinhala", "Tamil", "French", "German", "Chinese", "Japanese"];

const GuideApplyModal = ({ isOpen, onClose, user, onApplied }) => {
    const [form, setForm] = useState({
        experience: '',
        fullName: user?.name || '',
        nic: '',
        age: '',
        description: '',
        languages: [],
    });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLanguageToggle = (lang) => {
        const next = form.languages.includes(lang)
            ? form.languages.filter(l => l !== lang)
            : [...form.languages, lang];
        setForm({ ...form, languages: next });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!form.experience || !form.nic || !form.age) {
            setError('Please fill in all required fields.');
            return;
        }

        // NIC Validation (Sri Lanka format)
        // Old: 9 digits + V/X, New: 12 digits
        const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        if (!nicRegex.test(form.nic)) {
            setError('Please enter a valid NIC number (e.g., 123456789V or 199012345678).');
            return;
        }

        setLoading(true);
        try {
            let cvUrl = '';
            if (cvFile) {
                const formData = new FormData();
                formData.append('cv', cvFile);
                const uploadRes = await axios.post(`${API_URL}/api/guides/upload-cv`, formData);
                cvUrl = uploadRes.data.urlPath;
            }

            const payload = {
                role: 'guide',
                guideStatus: 'pending',
                guideApplication: {
                    experience: Number(form.experience),
                    fullName: form.fullName,
                    nic: form.nic,
                    age: Number(form.age),
                    description: form.description,
                    languages: form.languages,
                    cv: cvUrl
                }
            };

            const token = user.token || localStorage.getItem('token');
            await axios.put(`${API_URL}/api/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(true);
            setTimeout(() => {
                onApplied();
                onClose();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Apply to be a Guide</h2>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                {success ? (
                    <div style={styles.successContent}>
                        <div style={styles.successIcon}><CheckCircle size={48} color="#10a110" /></div>
                        <h3 style={styles.successTitle}>Application Submitted!</h3>
                        <p style={styles.successText}>Your application is now being reviewed by our team. We'll notify you once it's approved.</p>
                        <div style={styles.pendingBadge}>
                            <Clock size={16} /> Status: Pending Approval
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name (for Guide Profile)</label>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={form.fullName} 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                        </div>

                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Experience (Years)</label>
                                <input 
                                    type="number" 
                                    name="experience" 
                                    value={form.experience} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                    placeholder="e.g. 5"
                                    required 
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Age</label>
                                <input 
                                    type="number" 
                                    name="age" 
                                    value={form.age} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                    placeholder="Min 18"
                                    required 
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>NIC Number</label>
                            <input 
                                type="text" 
                                name="nic" 
                                value={form.nic} 
                                onChange={handleChange} 
                                style={styles.input} 
                                placeholder="National ID Card Number"
                                required 
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Languages Spoken</label>
                            <div style={styles.langGrid}>
                                {LANGUAGES.map(lang => (
                                    <label key={lang} style={styles.langItem}>
                                        <input 
                                            type="checkbox" 
                                            checked={form.languages.includes(lang)}
                                            onChange={() => handleLanguageToggle(lang)}
                                        />
                                        <span style={styles.langText}>{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Upload CV (Optional)</label>
                            <div style={styles.fileInputWrapper}>
                                <Upload size={16} />
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setCvFile(e.target.files[0])}
                                    style={styles.fileInput}
                                />
                                <span style={styles.fileText}>
                                    {cvFile ? cvFile.name : 'Choose PDF or DOC file'}
                                </span>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description & Skills</label>
                            <textarea 
                                name="description" 
                                value={form.description} 
                                onChange={handleChange} 
                                style={styles.textarea} 
                                placeholder="Tell us about your guiding style, locations you know well, and special skills..."
                                rows="3"
                            />
                        </div>

                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', zIndex: 2000, padding: '20px'
    },
    modal: {
        background: '#fff', borderRadius: '24px', width: '100%', 
        maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    },
    header: {
        padding: '24px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: '#fff', zIndex: 10
    },
    title: { margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' },
    closeBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' },
    form: { padding: '24px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' },
    input: {
        width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '14px', transition: 'all 0.2s', outline: 'none', ':focus': { borderColor: '#10a110', boxShadow: '0 0 0 3px rgba(16,161,16,0.1)' }
    },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    langGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' },
    langItem: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    langText: { fontSize: '13px', color: '#475569' },
    textarea: {
        width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '14px', transition: 'all 0.2s', outline: 'none', resize: 'none'
    },
    fileInputWrapper: {
        border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '12px',
        display: 'flex', alignItems: 'center', gap: '12px', position: 'relative',
        cursor: 'pointer', color: '#64748b', fontSize: '13px'
    },
    fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
    fileText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    submitBtn: {
        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
        background: '#10a110', color: '#fff', fontSize: '15px', fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 161, 16, 0.2)'
    },
    error: { padding: '12px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', fontSize: '13px', marginBottom: '20px', border: '1px solid #fee2e2' },
    successContent: { padding: '48px 24px', textAlign: 'center' },
    successIcon: { marginBottom: '24px' },
    successTitle: { fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' },
    successText: { fontSize: '15px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' },
    pendingBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
        borderRadius: '99px', background: '#fffbeb', color: '#d97706', fontSize: '13px', fontWeight: 700
    }
};

export default GuideApplyModal;
