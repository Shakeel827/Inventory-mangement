import { ReactNode, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, NavLink } from "react-router-dom";
import { auth } from "../../firebaseClient";
import { useAuth } from "../../context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 border-r border-slate-800 bg-slate-950/80 p-4 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold shadow-lg shadow-primary-600/40">
            IQ
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              Inventory Cloud
            </div>
            <div className="text-[11px] text-slate-400">
              {profile?.orgId ?? "Demo Org"}
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 text-xs font-medium">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            Dashboard
          </NavLink>
          {profile?.role === "user" && (
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 transition ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              📷 Scan QR Code
            </NavLink>
          )}
          {profile?.role !== "user" && (
            <>
              <NavLink
                to="/devices"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Devices
              </NavLink>
              <NavLink
                to="/stickers"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                QR Stickers
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/maintenance"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Maintenance
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Reports
              </NavLink>
              <NavLink
                to="/audit"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Audit Logs
              </NavLink>
              <NavLink
                to="/scan"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
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
                to="/users"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                Users
              </NavLink>
            </>
          )}
        </nav>
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <div className="mb-2 text-[11px] text-slate-400">Signed in as</div>
          <div className="mb-1 text-xs font-medium truncate">{profile?.displayName || "User"}</div>
          <div className="mb-3 text-[11px] text-slate-400 truncate">{profile?.email ?? "Guest"}</div>
          <button
            onClick={() => signOut(auth)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:hidden backdrop-blur-sm sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-2">
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
                to="/"
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
                    to="/devices"
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
                    to="/stickers"
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
                    to="/categories"
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
                    to="/maintenance"
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
                    to="/reports"
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
                    to="/audit"
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
                    to="/users"
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

