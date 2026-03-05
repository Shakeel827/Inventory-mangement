import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { auth, db } from "../firebaseClient";

/**
 * RegisterPage Component
 * Allows first-time users to create an admin account
 * Creates both Firebase Auth user and Firestore user document
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Validate password strength
   * Returns error message if password is weak, null if valid
   */
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  /**
   * Handle registration form submission
   * Creates Firebase Auth account and Firestore user document with admin role
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Create organization ID from org name (lowercase, no spaces)
      const orgId = orgName.trim().toLowerCase().replace(/\s+/g, "-") || "demo-org";

      // Create Firestore user document with admin role
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email.trim(),
        displayName: displayName.trim() || null,
        orgId: orgId,
        role: "admin", // First user is always admin
        createdAt: new Date()
      });

      // Navigate to dashboard after successful registration
      navigate("/dashboard");
    } catch (err: any) {
      // Handle Firebase errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-8 backdrop-blur"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-bold shadow-lg shadow-primary-600/40 mb-4">
            IQ
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Create Admin Account
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Set up your organization's inventory system
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Organization Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Organization Name
            </label>
            <input
              type="text"
              required
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="My Company"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Your Name
            </label>
            <input
              type="text"
              required
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              required
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="Min 8 characters (A-Z, a-z, 0-9)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-sm font-medium text-white shadow-lg shadow-primary-600/40 transition"
          >
            {loading ? "Creating account..." : "Create Admin Account"}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
