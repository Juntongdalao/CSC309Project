import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const role = user ? String(user.role || '').toLowerCase() : null;

    function handleLogout() {
        clearAuth();
        navigate('/login', { replace: true });
    }

    const linkStyle = ({ isActive }) => ({
        marginRight: '1rem',
        textDecoration: isActive ? 'underline' : 'none',
    });

    return (
        <nav
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                borderBottom: '1px solid #ddd',
                marginBottom: '1.5rem',
            }}
        >
            {/* Left: Website Name */}
            <div>
                <h3>StellarPoints</h3>
            </div>

            {/* Middle: role-based links */}
            <div>
                {user && (
                    <>
                        {/* Regular user links */}
                        <NavLink to="/me/profile" style={linkStyle}>
                            Profile
                        </NavLink>
                        <NavLink to="/me/qr" style={linkStyle}>
                            My QR
                        </NavLink>
                        <NavLink to="/me/points" style={linkStyle}>
                            My Points
                        </NavLink>
                        <NavLink to="/me/transactions" style={linkStyle}>
                            My Transaction
                        </NavLink>
                        <NavLink to="/me/transfer" style={linkStyle}>
                            Transfer Points
                        </NavLink>
                        <NavLink to="/me/redeem" style={linkStyle}>
                            Redeem Points
                        </NavLink>
                        <NavLink to="/me/promotions" style={linkStyle}>
                            Promotions
                        </NavLink>

                        {/* Cashier links */}
                        {(role === 'cashier' || role === 'manager' || role === 'superuser') && (
                            <>
                                <NavLink to="/cashier/transactions/new" style={linkStyle}>
                                    Cashier: New Transaction
                                </NavLink>
                                <NavLink to="/cashier/redemptions/process" style={linkStyle}>
                                    Cashier: Process Redemption
                                </NavLink>
                            </>
                        )}

                        {/* Manager links */}
                        {(role === 'manager' || role === 'superuser') && (
                            <>
                                <NavLink to="/manager/users" style={linkStyle}>
                                    Manager: Users
                                </NavLink>
                                <NavLink to="/manager/transactions" style={linkStyle}>
                                    Manager: Transactions
                                </NavLink>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Right: login/logout + User Summary */}
            <div>
                {user ? (
                    <>
                        <span style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
                            {user.utorid} ({role})
                        </span>
                        <button type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" style={linkStyle}>
                        Login
                    </NavLink>
                )}
            </div>
        </nav>
    );
}