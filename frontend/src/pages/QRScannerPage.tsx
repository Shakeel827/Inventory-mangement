import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * QRScannerPage Component
 * Allows users to scan QR codes using device camera
 * Automatically redirects to device check-in/out page when QR code is detected
 */
export function QRScannerPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  /**
   * Initialize QR code scanner
   * Requests camera permission and starts scanning
   */
  const startScanning = async () => {
    try {
      setError(null);
      
      // Check camera permission
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "camera" as PermissionName });
        setCameraPermission(permission.state);
        
        if (permission.state === "denied") {
          setError("Camera permission denied. Please enable camera access in your browser settings.");
          return;
        }
      }

      // Initialize scanner
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Start scanning with back camera (environment facing)
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10, // Frames per second for scanning
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        (decodedText) => {
          // QR code detected - handle the result
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Scanning errors (can be ignored - happens frequently)
          console.debug("QR scan error:", errorMessage);
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permission and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera. Please check your browser permissions.");
      }
    }
  };

  /**
   * Stop QR code scanning and release camera
   */
  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  /**
   * Handle detected QR code
   * Extracts device URL and navigates to check-in/out page
   */
  const handleQRCodeDetected = async (decodedText: string) => {
    // Stop scanning
    await stopScanning();

    try {
      // Check if it's a valid device URL
      // Expected format: http://domain/d/:orgSlug/:deviceId
      const url = new URL(decodedText);
      const pathParts = url.pathname.split("/");
      
      if (pathParts[1] === "d" && pathParts[2] && pathParts[3]) {
        // Valid device QR code - navigate to device page
        navigate(`/d/${pathParts[2]}/${pathParts[3]}`);
      } else {
        setError("Invalid QR code. Please scan a device QR code.");
      }
    } catch (err) {
      setError("Invalid QR code format. Please scan a device QR code.");
    }
  };

  /**
   * Cleanup scanner on component unmount
   */
  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-50 mb-2">
            Scan Device QR Code
          </h1>
          <p className="text-sm text-slate-400">
            Point your camera at a device QR code to check in or check out
          </p>
        </div>

        {/* Scanner Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
          {!scanning && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-24 w-24 rounded-full bg-primary-600/20 flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <button
                onClick={startScanning}
                className="h-12 px-6 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-600/40"
              >
                Start Camera
              </button>
            </div>
          )}

          {/* QR Scanner Video Element */}
          <div id="qr-reader" className={scanning ? "rounded-lg overflow-hidden" : "hidden"} />

          {scanning && (
            <button
              onClick={stopScanning}
              className="mt-4 w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 font-medium hover:bg-slate-800 transition"
            >
              Stop Scanning
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-900">
              <p className="text-xs text-rose-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-rose-300 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Camera Permission Info */}
          {cameraPermission === "denied" && (
            <div className="mt-4 p-3 rounded-lg bg-amber-950/60 border border-amber-900">
              <p className="text-xs text-amber-400">
                Camera permission is required to scan QR codes. Please enable camera access in your browser settings.
              </p>
            </div>
          )}
        </div>

        {/* Manual Entry Option */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 mb-2">
            Can't scan? Enter device ID manually
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary-400 hover:text-primary-300 underline"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
