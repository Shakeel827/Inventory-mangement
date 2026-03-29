import { ReactNode, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, NavLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseClient";
import { useAuth } from "../../context/AuthContext";
import { CommandPalette } from "../CommandPalette";
import { OnboardingWizard } from "../OnboardingWizard";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding wizard for new users
  useEffect(() => {
    if (!profile?.id) return;
    getDoc(doc(db, "users", profile.id)).then((snap) => {
      if (snap.exists() && !snap.data().onboardingComplete) {
        setShowOnboarding(true);
      }
    });
  }, [profile?.id]);

  // Global keyboard shortcut: Ctrl+K / ⌘K opens command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* Global overlays */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}

      {/* Desktop Sidebar */}
      <aside className="hidden w-56 border-r border-slate-800 bg-slate-950/80 p-4 md:flex md:flex-col">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold shadow-lg shadow-primary-600/40">
            IQ
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Inventory Cloud</div>
            <div className="text-[11px] text-slate-400">{profile?.orgId ?? "Demo Org"}</div>
          </div>
        </div>

        {/* ⌘K search button */}
        <button
          onClick={() => setCmdOpen(true)}
          className="mb-4 flex items-center gap-2 w-full h-8 rounded-lg bg-slate-800/60 border border-slate-700 px-3 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <span>⌘</span>
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] bg-slate-700 px-1 rounded">K</kbd>
        </button>

        <nav className="flex-1 space-y-0.5 text-xs font-medium overflow-y-auto">
          {/* Dashboard */}
          <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
            🏠 Dashboard
          </NavLink>

          {/* Scanner-only */}
          {profile?.role === "user" && (
            <NavLink to="/scan" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
              📷 Scan QR Code
            </NavLink>
          )}

          {/* Admin + Manager */}
          {profile?.role !== "user" && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] uppercase tracking-widest text-slate-600">Inventory</div>
              <NavLink to="/dashboard/devices" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>📦 Devices</NavLink>
              <NavLink to="/dashboard/categories" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>🏷️ Categories</NavLink>
              <NavLink to="/dashboard/reservations" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>📅 Reservations</NavLink>
              <NavLink to="/dashboard/vendors" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>🏭 Vendors</NavLink>

              <div className="pt-2 pb-1 px-3 text-[10px] uppercase tracking-widest text-slate-600">Operations</div>
              <NavLink to="/dashboard/maintenance" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>🔧 Maintenance</NavLink>
              <NavLink to="/dashboard/stickers" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>🖨️ QR Stickers</NavLink>
              <NavLink to="/scan" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>📷 Scan QR</NavLink>

              <div className="pt-2 pb-1 px-3 text-[10px] uppercase tracking-widest text-slate-600">Insights</div>
              <NavLink to="/dashboard/reports" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>📊 Reports</NavLink>
              <NavLink to="/dashboard/audit" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>📋 Audit Logs</NavLink>
              <NavLink to="/dashboard/ai" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>🤖 AI Assistant</NavLink>
            </>
          )}

          {/* Admin only */}
          {profile?.role === "admin" && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] uppercase tracking-widest text-slate-600">Admin</div>
              <NavLink to="/dashboard/users" className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 transition ${isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>👥 Users</NavLink>
            </>
          )}
        </nav>

        {/* User card */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="mb-1 text-xs font-medium truncate">{profile?.displayName || "User"}</div>
          <div className="mb-3 text-[11px] text-slate-400 truncate">{profile?.email ?? "Guest"}</div>
          <button onClick={() => signOut(auth)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition">
            Sign out
          </button>
        </div>
      </aside>
          <div>
            <div className="text-sm font-semibold leading-tight">
              Inventory Cloud
            </div>
            <div className="text-[11px] text-slate-400">
              {profile?.orgId ?? "Demo Org"}
            </div>
          </div>
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:hidden backdrop-blur-sm sticky top-0 z-50">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold shadow-lg shadow-primary-600/40">
              IQ
            </div>
            <span className="text-sm font-semibold">Inventory Cloud</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
            <nav className="p-4 space-y-1 text-xs font-medium">
              <NavLink
                to="/dashboard"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                Dashboard
              </NavLink>
              {profile?.role === "user" && (
                <NavLink
                  to="/scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  📷 Scan QR Code
                </NavLink>
              )}
              {profile?.role !== "user" && (
                <>
                  <NavLink
                    to="/dashboard/devices"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Devices
                  </NavLink>
                  <NavLink
                    to="/dashboard/stickers"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    QR Stickers
                  </NavLink>
                  <NavLink
                    to="/dashboard/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Categories
                  </NavLink>
                  <NavLink
                    to="/dashboard/maintenance"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Maintenance
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Reports
                  </NavLink>
                  <NavLink
                    to="/dashboard/audit"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Audit Logs
                  </NavLink>
                  <NavLink
                    to="/scan"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    📷 Scan QR
                  </NavLink>
                </>
              )}
              {profile?.role === "admin" && (
                <>
                  <NavLink
                    to="/dashboard/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    Users
                  </NavLink>
                </>
              )}
              <div className="pt-3 mt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">
                  {profile?.email ?? "Guest"}
                </div>
                <button
                  onClick={() => {
                    signOut(auth);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 bg-slate-950 px-3 py-4 md:px-6 md:py-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
