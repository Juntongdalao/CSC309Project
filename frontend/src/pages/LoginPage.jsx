// Login Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://localhost:3000'; // backend port

export default function LoginPage() {
    const [utorid, setUtorid] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Get Token
            const tokenRes = await fetch(`${API_BASE}/auth/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utorid, password }),
            });
            const tokenBody = await tokenRes.json().catch(() => ({}));
            if (!tokenRes.ok) {
                throw new Error(tokenBody.error || 'Login failed');
            }
            const { token } = tokenBody;
            if (!token) throw new Error('Server did not return a token');
            // Get Current User with the Token
            const meRes = await fetch(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const meBody = await meRes.json().catch(() => ({}));
            if (!meRes.ok) {
                throw new Error(meBody.error || 'Failed to load user profile');
            }
            const user = meBody; // contains what users/me returns
            // Save in store
            setAuth(token, user);
            // Redirect Based on Role
            const role = String(user.role || '').toLowerCase();
            if (role === 'manager' || role === 'superuser') {
                navigate('/manager/users', { replace: true });
            } else if (role === 'cashier') {
                navigate('/cashier/transactions/new', { replace: true });
            } else {
                navigate('/me/points', { replace: true });
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Login error');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor='utorid'>UTORid</label>
                    <input
                        id="utorid"
                        type="text"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        required
                        autoComplete='username'
                        style={{ display: 'block', width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ display: 'block', width: '100%' }}
                    />
                </div>
                {error && (
                    <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in…' : 'Login'}
                </button>
            </form>
        </div>
    );
}