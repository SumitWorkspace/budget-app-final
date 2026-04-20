import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";
import Charts from "./components/Charts";
import Insights from "./components/Insights";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import Budgets from "./pages/Budgets";
import MonthlySummary from "./pages/MonthlySummary";
import Subscriptions from "./pages/Subscriptions";
import Layout from "./components/Layout";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } 
        }} 
      />
      <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* PROTECTED ROUTES */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/add" element={<AddTransaction />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/summary" element={<MonthlySummary />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>

    </Routes>
    </>
  );
}