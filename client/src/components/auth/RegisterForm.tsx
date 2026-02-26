import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const strength = getPasswordStrength(form.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.username.trim().length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(form.password)) {
            toast.error('Password must contain at least one uppercase letter');
            return;
        }
        if (!/[a-z]/.test(form.password)) {
            toast.error('Password must contain at least one lowercase letter');
            return;
        }
        if (!/[0-9]/.test(form.password)) {
            toast.error('Password must contain at least one number');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.register(form);
            login(res.data.user, res.data.accessToken);
            toast.success('Account created! Welcome to WecnDraw 🎨');
            navigate('/dashboard');
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors?.length) {
                data.errors.forEach((e: { message: string }) => toast.error(e.message));
            } else {
                toast.error(data?.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            try {
                const res = await authService.googleLogin(tokenResponse.access_token);
                login(res.data.user, res.data.accessToken);
                toast.success('Account created! Welcome to WecnDraw 🎨');
                navigate('/dashboard');
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Google sign-up failed');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            toast.error('Google sign-up was cancelled');
        },
    });

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

            {/* Google Sign-Up Button */}
            <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isGoogleLoading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                    if (!isGoogleLoading) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {isGoogleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
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
