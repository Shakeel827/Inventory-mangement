import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { db, auth } from "./firebaseClient";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { StickersPage } from "./pages/StickersPage";
import { UsersPage } from "./pages/UsersPage";
import { FieldsPage } from "./pages/FieldsPage";
import { QRScannerPage } from "./pages/QRScannerPage";
import { DeviceDetailsPage } from "./pages/DeviceDetailsPage";
import { DEVICE_STATUS } from "./constants";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 text-sm">
        Loading...
      </div>
    );
  }
  if (!firebaseUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function DeviceScanPage() {
  const { orgSlug, deviceId } = useParams();
  const [device, setDevice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!deviceId) return;
      const ref = doc(db, "devices", deviceId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError("Device not found");
      } else {
        setDevice({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }
    load();
  }, [deviceId]);

  const handleCheck = async (type: "check_out" | "check_in") => {
    if (!deviceId) return;
    setActionLoading(true);
    setError(null);
    try {
      const ref = doc(db, "devices", deviceId);
      const nextStatus = type === "check_out" ? DEVICE_STATUS.CHECKED_OUT : DEVICE_STATUS.AVAILABLE;

      await updateDoc(ref, {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "deviceActivity"), {
        orgId: device?.orgId || (orgSlug || "demo-org"),
        deviceId,
        action: type,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        timestamp: serverTimestamp()
      });

      setDevice((prev: any) => ({ ...prev, status: nextStatus }));
    } catch (e: any) {
      setError(e.message || "Failed to update device");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <p className="p-4 text-sm text-slate-200 bg-slate-950">
        Loading device...
      </p>
    );
  if (error)
    return (
      <p className="p-4 text-sm text-rose-400 bg-rose-950/60 border border-rose-900">
        {error}
      </p>
    );
  if (!device) return <p className="p-4 text-sm">No device data</p>;

  const isAvailable = device.status === DEVICE_STATUS.AVAILABLE;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl"
      >
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">
          Device
        </p>
        <h2 className="text-xl font-semibold text-slate-50">
          {device.name || device.id}
        </h2>
        <p className="mt-1 text-xs text-slate-400 break-all">
          ID: {device.id}
        </p>

        <div className="mt-4">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
              isAvailable
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
            }`}
          >
            {device.status}
          </span>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            disabled={!isAvailable || actionLoading}
            onClick={() => handleCheck("check_out")}
            className="flex-1 h-10 rounded-lg bg-primary-600 text-sm font-medium text-white shadow-md shadow-primary-600/40 hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition"
          >
            Check Out
          </button>
          <button
            disabled={isAvailable || actionLoading}
            onClick={() => handleCheck("check_in")}
            className="flex-1 h-10 rounded-lg border border-slate-700 bg-slate-900 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50 transition"
          >
            Check In
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          <Link to="/" className="underline underline-offset-2">
            Go to dashboard
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/scan" element={<QRScannerPage />} />
      <Route path="/d/:orgSlug/:deviceId" element={<DeviceScanPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/devices/:deviceId" element={<DeviceDetailsPage />} />
                <Route path="/stickers" element={<StickersPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/audit" element={<AuditLogsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* Catch-all route - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

