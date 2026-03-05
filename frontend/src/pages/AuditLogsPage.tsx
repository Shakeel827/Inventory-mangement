import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";

interface AuditLog {
  id: string;
  orgId: string;
  type: string;
  actorEmail?: string;
  message: string;
  createdAt?: Date | null;
}

export function AuditLogsPage() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "auditLogs"),
      where("orgId", "==", profile.orgId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: AuditLog[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          orgId: data.orgId,
          type: data.type,
          actorEmail: data.actorEmail,
          message: data.message,
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
        <h1 className="text-lg font-semibold text-slate-50">Audit logs</h1>
        <p className="text-xs text-slate-400">
          Transparent trail of important system actions for compliance.
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                className="border-t border-slate-800 odd:bg-slate-950/40"
              >
                <td className="px-3 py-2 text-[11px] text-slate-400">
                  {l.createdAt?.toLocaleString() ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-300">
                  {l.actorEmail || "System"}
                </td>
                <td className="px-3 py-2 text-xs">{l.type}</td>
                <td className="px-3 py-2 text-xs text-slate-200">
                  {l.message}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  No audit events yet. They will appear here as you use the app.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

