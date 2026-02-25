import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { label: '', color: 'transparent' },
        { label: 'Weak', color: '#ef4444' },
        { label: 'Fair', color: '#f59e0b' },
        { label: 'Good', color: '#06b6d4' },
        { label: 'Strong', color: '#10b981' },
    ];
    return { score, ...levels[Math.min(score, 4)] };
};

const RegisterForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const strength = getPasswordStrength(form.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.register(form);
            login(res.data.user, res.data.accessToken);
            toast.success('Account created! Welcome to WecnDraw 🎨');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
        >
            <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Create account
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start your creative journey today</p>
            </div>

            {[
                { key: 'username', label: 'Username', type: 'text', icon: <User size={16} />, placeholder: 'YourName' },
                { key: 'email', label: 'Email', type: 'email', icon: <Mail size={16} />, placeholder: 'you@example.com' },
            ].map(({ key, label, type, icon, placeholder }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</div>
                        <input
                            type={type}
                            className="input-field"
                            placeholder={placeholder}
                            value={form[key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            style={{ paddingLeft: '2.5rem' }}
                            required
                        />
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type={showPass ? 'text' : 'password'}
                        className="input-field"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                        required minLength={8}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {form.password && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.3s' }} />
                        ))}
                        <span style={{ fontSize: '0.75rem', color: strength.color, marginLeft: 4, minWidth: 40 }}>{strength.label}</span>
                    </div>
                )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {isLoading ? <Loader2 size={18} /> : 'Create account'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-purple)', fontWeight: 600 }}>
                    Sign in
                </button>
            </p>
        </motion.form>
    );
};

export default RegisterForm;
