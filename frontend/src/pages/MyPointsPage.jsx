import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../lib/apiClient';

export default function MyPointsPage() {
    const token = useAuthStore((s) => s.token);

    const { data, isLoading, error } = useQuery({
        queryKey: ['me'],
        queryFn: () => apiFetch('/users/me', { token }),
        enabled: !!token, // don't run if not logged in
    });

    if (!token) {
        // ProtectedRoute should already stop this, but just in case
        return <div>Not authenticated.</div>;
    }

    if (isLoading) return <div>Loading your info…</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error.message}</div>;

    const me = data || {};
    const role = String(me.role || '').toLowerCase();

    return (
        <div style={{ padding: '1.5rem' }}>
            <h1>My Points</h1>
            <p>
                <strong>UTORid:</strong> {me.utorid}
            </p>
            <p>
                <strong>Role:</strong> {role}
            </p>
            <p>
                <strong>Current Points</strong> {me.points}
            </p>
            <p>
                <strong>Verified:</strong> {me.verified ? 'Yes' : 'No'}
            </p>
            {me.lastLogin && (
                <p>
                    <strong>Last Login:</strong> {new Date(me.lastLogin).toLocaleString()}
                </p>
            )}
        </div>
    );
}