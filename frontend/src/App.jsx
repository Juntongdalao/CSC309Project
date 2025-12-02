import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import useAuthStore from "./store/authStore";

import LoginPage from "./pages/LoginPage.jsx";
import MyPointsPage from "./pages/MyPointsPage.jsx";
import MyTransactionsPage from "./pages/MyTransactionsPage.jsx";
import CashierCreateTxPage from "./pages/CashierCreateTxPage.jsx";
import ManagerUsersPage from "./pages/ManagerUsersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UserQrPage from "./pages/UserQrPage.jsx";
import UserPromotionsPage from "./pages/UserPromotionsPage.jsx";
import UserTransferPage from "./pages/UserTransferPage.jsx";
import UserRedeemPage from "./pages/UserRedeemPage";
import UserRedemptionQrPage from "./pages/UserRedemptionQrPage";
import CashierProcessRedemptionPage from "./pages/CashierProcessRedemptionPage.jsx";
import ManagerTransactionsPage from "./pages/ManagerTransactionsPage.jsx";
import ManagerTransactionDetailPage from "./pages/ManagerTransactionDetailPage.jsx";

const ROLE_ORDER = { regular: 0, cashier: 1, manager: 2, superuser: 3 };

function ProtectedRoute({ children, minRole = "regular" }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (ROLE_ORDER[user.role] < ROLE_ORDER[minRole]) {
    return <div>Forbidden: insufficient permissions.</div>;
  }
  return children;
}

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Regular user views */}
        <Route
            path="/me/profile"
            element={
              <ProtectedRoute minRole="regular">
                <ProfilePage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/me/qr"
            element={
              <ProtectedRoute minRole="regular">
                <UserQrPage />
              </ProtectedRoute>
            }
        />
        <Route 
          path="/me/points"
          element={
            <ProtectedRoute minRole="regular">
              <MyPointsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/transactions"
          element={
            <ProtectedRoute minRole="regular">
              <MyTransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/transfer"
          element={
            <ProtectedRoute minRole="regular">
              <UserTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/promotions"
          element={
            <ProtectedRoute minRole="regular">
              <UserPromotionsPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/me/redeem" 
          element={
            <ProtectedRoute minRole="regular">
              <UserRedeemPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/me/redemptions/:transactionId" 
          element={
            <ProtectedRoute minRole="regular">
              <UserRedemptionQrPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Cashier */}
        <Route
            path="/cashier/transactions/new"
            element={
              <ProtectedRoute minRole="cashier">
                <CashierCreateTxPage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/cashier/redemptions/process"
            element={
              <ProtectedRoute minRole="cashier">
                <CashierProcessRedemptionPage />
              </ProtectedRoute>
            }
        />

        {/* Manager */}
        <Route
            path="/manager/users"
            element={
              <ProtectedRoute minRole="manager">
                <ManagerUsersPage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/manager/transactions"
            element={
              <ProtectedRoute minRole="manager">
                <ManagerTransactionsPage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/manager/transactions/:transactionId"
            element={
              <ProtectedRoute minRole="manager">
                <ManagerTransactionDetailPage />
              </ProtectedRoute>
            }
        />
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}