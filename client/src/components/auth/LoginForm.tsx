import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const LoginForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authService.login(form);
            login(res.data.user, res.data.accessToken);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
            <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Welcome back
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Sign in to continue creating
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Don't have an account?{' '}
                <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-purple)', fontWeight: 600 }}>
                    Register
                </button>
            </p>
        </motion.form>
    );
};

export default LoginForm;
