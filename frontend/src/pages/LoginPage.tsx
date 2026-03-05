import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { motion } from "framer-motion";
import { auth } from "../firebaseClient";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-8 backdrop-blur"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Inventory Cloud
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to manage and track your assets.
          </p>
        </div>

        <form
          onSubmit={handleEmailLogin}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-sm font-medium text-white shadow-lg shadow-primary-600/40 transition"
          >
            {loading ? "Logging in..." : "Sign in with email"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Or
          </span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-4 h-10 w-full rounded-lg bg-white text-slate-900 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:bg-slate-100 transition disabled:opacity-60"
        >
          <span className="text-lg">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 underline">
            Create admin account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

