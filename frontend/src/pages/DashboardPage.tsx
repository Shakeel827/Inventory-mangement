/**
 * DashboardPage — main overview for admins/managers.
 * Shows animated stat cards, donut chart, and quick actions.
 * Scanner users see a simplified device list for check-in/out.
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device } from "../types";
import { CardSkeleton } from "../components/SkeletonLoader";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

/** Animated stat card */
function StatCard({
  label, value, color, icon, delay = 0
}: { label: string; value: string | number; color: string; icon: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5"
    >
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 ${color}`} />
      <div className="relative">
        <div className="text-2xl mb-3">{icon}</div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color.replace("bg-", "text-")}`}>{value}</p>
      </div>
    </motion.div>
  );
}

/** Quick action button */
function QuickAction({ icon, label, to }: { icon: string; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-primary-500/30 transition group"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-medium text-slate-400 group-hover:text-white transition">{label}</span>
    </Link>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "devices"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      setDevices(snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id, orgId: data.orgId, name: data.name || d.id,
          categoryId: data.categoryId || null, model: data.model || null,
          serialNumber: data.serialNumber || null, location: data.location || null,
          status: data.status || "available", imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate?.() ?? null
        };
      }));
      setLoading(false);
    });
  }, [profile]);

  // ── Scanner view ──────────────────────────────────────────────────────────
  if (profile?.role === "user") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">
              Welcome, {profile?.displayName || "Scanner"} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">Select a device to check in or out</p>
          </div>
          <Link
            to="/scan"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition shadow-lg shadow-primary-600/30"
          >
            📷 Scan QR
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-400">Device</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Location</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-slate-800 hover:bg-white/3 transition"
                >
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-slate-400">{d.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                      d.status === "available"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}>
                      {d.status === "available" ? "✓ Available" : "⏳ Checked Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/d/${profile.orgId}/${d.id}`}
                      className="px-3 py-1.5 rounded-lg bg-primary-600/20 border border-primary-500/30 text-primary-300 text-[11px] font-medium hover:bg-primary-600/30 transition"
                    >
                      Check In/Out
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {!loading && devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    No devices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Admin / Manager view ──────────────────────────────────────────────────
  const available = devices.filter((d) => d.status === "available").length;
  const checkedOut = devices.filter((d) => d.status === "checked_out").length;
  const maintenance = devices.filter((d) =>
    d.status === "under_repair" || d.status === "maintenance_required"
  ).length;
  const retired = devices.filter((d) => d.status === "retired").length;

  const utilizationRate = devices.length > 0
    ? Math.round((checkedOut / devices.length) * 100)
    : 0;

  const donutData = {
    labels: ["Available", "Checked Out", "Maintenance", "Retired"],
    datasets: [{
      data: [available, checkedOut, maintenance, retired],
      backgroundColor: ["#10b981", "#f59e0b", "#f97316", "#64748b"],
      borderColor: ["#064e3b", "#78350f", "#7c2d12", "#1e293b"],
      borderWidth: 2,
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#94a3b8", font: { size: 11 }, padding: 16 }
      }
    },
    cutout: "70%",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {profile?.displayName?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's your inventory overview for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to="/dashboard/devices"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition shadow-lg shadow-primary-600/30"
        >
          + Add Device
        </Link>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Devices" value={devices.length} color="bg-primary-500" icon="📦" delay={0} />
          <StatCard label="Available" value={available} color="bg-emerald-500" icon="✅" delay={0.08} />
          <StatCard label="Checked Out" value={checkedOut} color="bg-amber-500" icon="⏳" delay={0.16} />
          <StatCard label="Utilization" value={`${utilizationRate}%`} color="bg-violet-500" icon="📊" delay={0.24} />
        </div>
      )}

      {/* Charts + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 p-6 rounded-2xl bg-white/4 border border-white/8"
        >
          <h2 className="text-sm font-bold text-white mb-4">Device Status</h2>
          {devices.length > 0 ? (
            <div className="h-52">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
              No devices yet
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/4 border border-white/8"
        >
          <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <QuickAction icon="📦" label="Devices" to="/dashboard/devices" />
            <QuickAction icon="🏷️" label="Categories" to="/dashboard/categories" />
            <QuickAction icon="📷" label="Scan QR" to="/scan" />
            <QuickAction icon="🖨️" label="Stickers" to="/dashboard/stickers" />
            <QuickAction icon="📊" label="Reports" to="/dashboard/reports" />
            <QuickAction icon="🔧" label="Maintenance" to="/dashboard/maintenance" />
            <QuickAction icon="📅" label="Reservations" to="/dashboard/reservations" />
            <QuickAction icon="🤖" label="AI Assistant" to="/dashboard/ai" />
          </div>
        </motion.div>
      </div>

      {/* Recent Devices */}
      {devices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/8 overflow-hidden"
        >
          <div className="px-5 py-4 bg-white/4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recent Devices</h2>
            <Link to="/dashboard/devices" className="text-xs text-primary-400 hover:text-primary-300 transition">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {devices.slice(0, 5).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-sm flex-shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.location || "No location"}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                  d.status === "available"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : d.status === "checked_out"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                }`}>
                  {d.status.replace("_", " ")}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Maintenance alert */}
      {maintenance > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20"
        >
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-orange-300">
              {maintenance} device{maintenance > 1 ? "s" : ""} need maintenance
            </p>
            <Link to="/dashboard/maintenance" className="text-xs text-orange-400 hover:text-orange-300 transition underline">
              View maintenance →
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
