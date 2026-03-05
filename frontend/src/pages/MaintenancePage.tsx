import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";

interface MaintenanceLog {
  id: string;
  orgId: string;
  deviceId: string;
  deviceName?: string;
  status: string;
  note?: string;
  createdAt?: Date | null;
}

export function MaintenancePage() {
  const { profile } = useAuth();

  // Role-based access control
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  const [logs, setLogs] = useState<MaintenanceLog[]>([]);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "maintenanceLogs"),
      where("orgId", "==", profile.orgId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: MaintenanceLog[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          orgId: data.orgId,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt?.toDate?.() ?? null
        });
      });
      setLogs(list);
    });
    return () => unsub();
  }, [profile]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-50">Maintenance</h1>
        <p className="text-xs text-slate-400">
          Recent maintenance events, repairs and retirements.
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 font-medium">Device</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Note</th>
              <th className="px-3 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                className="border-t border-slate-800 odd:bg-slate-950/40"
              >
                <td className="px-3 py-2 text-xs">
                  {l.deviceName || l.deviceId}
                </td>
                <td className="px-3 py-2 text-xs capitalize">
                  {l.status.replace("_", " ")}
                </td>
                <td className="px-3 py-2 text-xs text-slate-300">
                  {l.note || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-[11px] text-slate-400">
                  {l.createdAt?.toLocaleString() ?? "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  No maintenance activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

