/**
 * QRScannerPage — camera-based QR & barcode scanner.
 *
 * Supports both QR codes and standard barcodes (html5-qrcode handles both).
 * On successful scan, navigates to the device check-in/out page.
 * "Go to Dashboard" correctly links to /dashboard.
 */

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function QRScannerPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => handleDetected(decodedText),
        () => {} // ignore per-frame errors
      );
      setScanning(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permission and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera. Please check your browser permissions.");
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      setScanning(false);
    }
  };

  const handleDetected = async (decodedText: string) => {
    await stopScanning();
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split("/");
      if (parts[1] === "d" && parts[2] && parts[3]) {
        setSuccess(`Device found! Redirecting…`);
        setTimeout(() => navigate(`/d/${parts[2]}/${parts[3]}`), 800);
      } else {
        setError("Invalid QR code. Please scan a device QR code.");
      }
    } catch {
      setError("Invalid QR code format. Please scan a device QR code.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] px-4 py-8">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">IQ</div>
            <span className="font-bold text-white">InventoryQ</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Scan Device</h1>
          <p className="text-sm text-slate-400">Point camera at a QR code or barcode</p>
        </div>

        {/* Scanner Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Camera area */}
          <div className="relative bg-slate-950 aspect-square">
            {!scanning && !success && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                {/* Animated QR icon */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 rounded-2xl bg-primary-600/20 border-2 border-primary-500/30 flex items-center justify-center"
                >
                  <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2M19 15v2M15 19h4v2M19 19v2" />
                  </svg>
                </motion.div>
                <button
                  onClick={startScanning}
                  className="px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-xl shadow-primary-600/40 transition active:scale-95"
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-300 font-semibold text-sm">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning overlay with corner brackets */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-52 h-52">
                  {/* Corner brackets */}
                  {[
                    "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                    "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                    "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                    "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-primary-400 ${cls}`} />
                  ))}
                  {/* Scan line */}
                  <motion.div
                    animate={{ y: [0, 192, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-primary-400/70 shadow-lg shadow-primary-400"
                  />
                </div>
              </div>
            )}

            {/* Video element */}
            <div id="qr-reader" className={scanning ? "w-full h-full" : "hidden"} />
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3">
            {scanning && (
              <button
                onClick={stopScanning}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition"
              >
                Stop Scanning
              </button>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-rose-950/60 border border-rose-900/60"
                >
                  <p className="text-xs text-rose-400">{error}</p>
                  <button onClick={() => setError(null)} className="mt-1 text-xs text-rose-300 underline">
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">Supports QR codes and barcodes</p>
          <Link
            to="/dashboard"
            className="text-sm text-primary-400 hover:text-primary-300 transition underline underline-offset-2"
          >
            ← Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
