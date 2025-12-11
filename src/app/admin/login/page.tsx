'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (e) {
            setError('Connection error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">🍕</div>
                    <h1>Admin Panel</h1>
                    <p>Sign in to manage your restaurant</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? (
                            <span className="loading-spinner">⏳</span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Protected area for authorized personnel only</p>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
                    padding: 1rem;
                }

                .login-card {
                    background: white;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .login-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2.5rem 2rem;
                    text-align: center;
                }

                .logo {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .login-header h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 700;
                }

                .login-header p {
                    margin: 0.5rem 0 0;
                    opacity: 0.9;
                    font-size: 0.95rem;
                }

                .login-form {
                    padding: 2rem;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 0.875rem 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-group input::placeholder {
                    color: #9ca3af;
                }

                .login-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    margin-top: 0.5rem;
                }

                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .login-footer {
                    padding: 1.5rem 2rem;
                    background: #f9fafb;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }

                .login-footer p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}
