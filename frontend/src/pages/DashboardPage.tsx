import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device } from "../types";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export function DashboardPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "devices"),
      where("orgId", "==", profile.orgId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Device[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          orgId: data.orgId,
          name: data.name || d.id,
          categoryId: data.categoryId || null,
          model: data.model || null,
          serialNumber: data.serialNumber || null,
          location: data.location || null,
          status: data.status || "available",
          imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate?.() ?? null
        });
      });
      setDevices(list);
      setLoading(false);
    });
    return () => unsub();
  }, [profile]);

  // Scanner user view - show device list for check-in/out
  if (profile?.role === "user") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Welcome, {profile?.displayName || "Scanner"}.
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Select a device to check in or check out.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 font-medium">Device</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-slate-800 odd:bg-slate-950/40"
                >
                  <td className="px-3 py-2 text-xs">{d.name}</td>
                  <td className="px-3 py-2 text-xs">
                    {d.location || <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                        d.status === "available"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`/d/${profile.orgId}/${d.id}`}
                      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800 transition"
                    >
                      Scan / Check
                    </a>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-xs text-slate-400"
                  >
                    No devices available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const availableCount = devices.filter((d) => d.status === "available").length;
  const checkedOutCount = devices.filter(
    (d) => d.status === "checked_out"
  ).length;
  const maintenanceCount = devices.filter(
    (d) => d.status === "under_repair" || d.status === "maintenance_required"
  ).length;

  const categoryCounts = devices.reduce<Record<string, number>>((acc, d) => {
    const key = d.categoryId || "Uncategorized";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = Object.values(categoryCounts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-50">
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : ""}.
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          High-level view of your organization&apos;s device inventory and usage.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total devices
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {loading ? "…" : devices.length.toString().padStart(2, "0")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Available
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {availableCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Checked out
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {checkedOutCount}
          </p>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            Devices by status
          </h2>
          <Doughnut
            data={{
              labels: ["Available", "Checked out", "Maintenance"],
              datasets: [
                {
                  data: [availableCount, checkedOutCount, maintenanceCount],
                  backgroundColor: ["#22c55e", "#f59e0b", "#6366f1"]
                }
              ]
            }}
            options={{
              plugins: {
                legend: {
                  labels: { color: "#e5e7eb", font: { size: 10 } }
                }
              }
            }}
          />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            Devices by category
          </h2>
          {categoryLabels.length === 0 ? (
            <p className="text-xs text-slate-400">
              No categories yet. Add categories and assign them to devices to see
              this chart.
            </p>
          ) : (
            <Bar
              data={{
                labels: categoryLabels,
                datasets: [
                  {
                    label: "Devices",
                    data: categoryValues,
                    backgroundColor: "#3b82f6"
                  }
                ]
              }}
              options={{
                scales: {
                  x: {
                    ticks: { color: "#9ca3af", font: { size: 10 } }
                  },
                  y: {
                    ticks: { color: "#9ca3af", font: { size: 10 } }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: "#e5e7eb", font: { size: 10 } }
                  }
                }
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

