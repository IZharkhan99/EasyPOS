import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UnifiedDashboardPage from './pages/UnifiedDashboardPage';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import ProductsInventoryPage from './pages/ProductsInventoryPage';
import CustomersPage from './pages/CustomersPage';
import ShiftPage from './pages/ShiftPage';
import StaffPage from './pages/StaffPage';
import ReturnsPage from './pages/ReturnsPage';
import ExpensesPage from './pages/ExpensesPage';
import PaymentsPage from './pages/PaymentsPage';
import AlertsPage from './pages/AlertsPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import ReportsPage from './pages/ReportsPage';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<UnifiedDashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsInventoryPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="shift" element={<ShiftPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="audit-logs" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
