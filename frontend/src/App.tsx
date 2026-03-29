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
import { QRScannerPage } from "./pages/QRScannerPage";
import { DeviceDetailsPage } from "./pages/DeviceDetailsPage";
import { DEVICE_STATUS } from "./constants";
import { TermsPage } from "./pages/TermsPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { PricingPage } from "./pages/PricingPage";
import { SecurityPage } from "./pages/SecurityPage";
import { AboutPage } from "./pages/AboutPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { VendorsPage } from "./pages/VendorsPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { firebaseUser, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // If loading takes more than 5s, show a retry option instead of spinning forever
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] gap-6">
        {/* Animated logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl font-black text-white shadow-2xl shadow-primary-600/40"
        >
          IQ
        </motion.div>

        {!timedOut ? (
          <>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-primary-500"
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">Loading your workspace…</p>
          </>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-400">Taking longer than expected…</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition"
            >
              Retry
            </button>
          </div>
        )}
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
  const [done, setDone] = useState<"check_in" | "check_out" | null>(null);

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

  /**
   * Send WhatsApp notification to admin after check-in/out.
   * Opens wa.me link with pre-filled message — works on mobile and desktop.
   * Admin WhatsApp number is read from Firestore org settings (or hardcoded fallback).
   */
  const sendWhatsAppNotification = (type: "check_out" | "check_in", deviceName: string) => {
    const action = type === "check_out" ? "checked OUT" : "checked IN";
    const user = auth.currentUser?.email || "Unknown user";
    const time = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const msg = encodeURIComponent(
      `📦 *InventoryQ Alert*\n\n` +
      `Device *${deviceName}* has been ${action}.\n\n` +
      `👤 User: ${user}\n` +
      `🕐 Time: ${time}\n\n` +
      `_Sent from InventoryQ_`
    );
    // Admin WhatsApp number — update this to your admin's number
    const adminPhone = "918074015276"; // +91 80740 15276
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, "_blank");
  };

  const handleCheck = async (type: "check_out" | "check_in") => {
    if (!deviceId) return;
    setActionLoading(true);
    setError(null);
    try {
      const ref = doc(db, "devices", deviceId);
      const nextStatus = type === "check_out" ? DEVICE_STATUS.CHECKED_OUT : DEVICE_STATUS.AVAILABLE;

      await updateDoc(ref, { status: nextStatus, updatedAt: serverTimestamp() });

      await addDoc(collection(db, "deviceActivity"), {
        orgId: device?.orgId || (orgSlug || "demo-org"),
        deviceId,
        action: type,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        timestamp: serverTimestamp()
      });

      setDevice((prev: any) => ({ ...prev, status: nextStatus }));
      setDone(type);

      // Send WhatsApp notification to admin
      sendWhatsAppNotification(type, device?.name || deviceId);
    } catch (e: any) {
      setError(e.message || "Failed to update device");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Loading device…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-rose-400 font-semibold mb-2">{error}</p>
        <Link to="/dashboard" className="text-sm text-primary-400 underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  if (!device) return null;

  const isAvailable = device.status === DEVICE_STATUS.AVAILABLE;

  // Collect custom fields (any field not in the standard set)
  const standardKeys = new Set(["orgId", "name", "status", "categoryId", "location", "model", "serialNumber", "imageUrl", "createdAt", "updatedAt"]);
  const customEntries = Object.entries(device).filter(([k]) => !standardKeys.has(k) && k !== "id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] px-4 py-8">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl ${isAvailable ? "bg-emerald-600/10" : "bg-amber-600/10"}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">IQ</div>
            <span className="font-bold text-white">InventoryQ</span>
          </Link>
        </div>

        {/* Device Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Status banner */}
          <div className={`px-5 py-3 text-center text-xs font-bold uppercase tracking-widest ${
            isAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
          }`}>
            {isAvailable ? "✓ Available for Check-Out" : "⏳ Currently Checked Out"}
          </div>

          <div className="p-6">
            {/* Device info */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Device</p>
              <h1 className="text-2xl font-black text-white">{device.name || device.id}</h1>
              {device.model && <p className="text-sm text-slate-400 mt-0.5">{device.model}</p>}
              {device.location && (
                <p className="text-xs text-slate-500 mt-1">📍 {device.location}</p>
              )}
              {device.serialNumber && (
                <p className="text-xs text-slate-500">🔢 {device.serialNumber}</p>
              )}
            </div>

            {/* Custom fields */}
            {customEntries.length > 0 && (
              <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/8 space-y-1.5">
                {customEntries.map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-slate-300 font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success state */}
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-4 p-3 rounded-xl text-center text-sm font-semibold ${
                  done === "check_out"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <p>{done === "check_out" ? "✓ Checked Out Successfully" : "✓ Checked In Successfully"}</p>
                {/* Manual WhatsApp button in case auto-open was blocked */}
                <button
                  onClick={() => sendWhatsAppNotification(done, device?.name || deviceId || "")}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/30 transition"
                >
                  <span>📲</span> Notify Admin on WhatsApp
                </button>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-900/60 text-xs text-rose-400">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!isAvailable || actionLoading}
                onClick={() => handleCheck("check_out")}
                className="h-14 rounded-2xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-primary-600/30 transition active:scale-95 flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-xl">📤</span>
                <span>{actionLoading ? "…" : "Check Out"}</span>
              </button>
              <button
                disabled={isAvailable || actionLoading}
                onClick={() => handleCheck("check_in")}
                className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition active:scale-95 flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-xl">📥</span>
                <span>{actionLoading ? "…" : "Check In"}</span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Logged as: {auth.currentUser?.email || "Guest"}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/dashboard" className="text-sm text-primary-400 hover:text-primary-300 transition underline underline-offset-2">
            ← Go to Dashboard
          </Link>
        </div>
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
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/scan" element={<QRScannerPage />} />
      <Route path="/d/:orgSlug/:deviceId" element={<DeviceScanPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="devices/:deviceId" element={<DeviceDetailsPage />} />
                <Route path="stickers" element={<StickersPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="ai" element={<AIAssistantPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="vendors" element={<VendorsPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
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

