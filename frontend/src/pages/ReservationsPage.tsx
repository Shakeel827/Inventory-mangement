/**
 * ReservationsPage — device booking system.
 *
 * Users can reserve a device for a future date/time window.
 * Prevents double-booking conflicts.
 * Admins see all reservations; users see only their own.
 *
 * Firestore collection: /reservations/{id}
 * Fields: orgId, deviceId, deviceName, userId, userEmail,
 *         startDate, endDate, note, status (pending|approved|cancelled)
 */

import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, query, where, orderBy, Timestamp
} from "firebase/firestore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import { SkeletonBar } from "../components/SkeletonLoader";

interface Reservation {
  id: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  userEmail: string;
  startDate: Date;
  endDate: Date;
  note: string;
  status: "pending" | "approved" | "cancelled";
}

interface Device { id: string; name: string; status: string; }

export function ReservationsPage() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [deviceId, setDeviceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  // Load devices for dropdown
  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "devices"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      setDevices(snap.docs.map((d) => ({ id: d.id, name: d.data().name, status: d.data().status })));
    });
  }, [profile]);

  // Load reservations — admins see all, users see own
  useEffect(() => {
    if (!profile) return;
    const constraints = [where("orgId", "==", profile.orgId)];
    if (!isAdmin) constraints.push(where("userId", "==", profile.id));

    const q = query(collection(db, "reservations"), ...constraints);
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          userId: data.userId,
          userEmail: data.userEmail,
          startDate: data.startDate?.toDate?.() ?? new Date(),
          endDate: data.endDate?.toDate?.() ?? new Date(),
          note: data.note ?? "",
          status: data.status ?? "pending",
        } as Reservation;
      });
      // Sort by start date ascending
      list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setReservations(list);
      setLoading(false);
    });
  }, [profile, isAdmin]);

  /** Check for conflicts before creating a reservation */
  const hasConflict = (devId: string, start: Date, end: Date): boolean => {
    return reservations.some(
      (r) =>
        r.deviceId === devId &&
        r.status !== "cancelled" &&
        r.startDate < end &&
        r.endDate > start
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !deviceId || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) { toast.error("End date must be after start date"); return; }
    if (start < new Date()) { toast.error("Start date cannot be in the past"); return; }

    if (hasConflict(deviceId, start, end)) {
      toast.error("This device is already reserved for that time period");
      return;
    }

    const device = devices.find((d) => d.id === deviceId);
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reservations"), {
        orgId: profile.orgId,
        deviceId,
        deviceName: device?.name ?? deviceId,
        userId: profile.id,
        userEmail: profile.email,
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        note: note.trim(),
        status: "pending",
        createdAt: Timestamp.now(),
      });
      toast.success("Reservation created");
      setDeviceId(""); setStartDate(""); setEndDate(""); setNote("");
    } catch {
      toast.error("Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReservation = async (id: string) => {
    await deleteDoc(doc(db, "reservations", id)).catch(() => toast.error("Failed to cancel"));
    toast.success("Reservation cancelled");
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">📅 Device Reservations</h1>
        <p className="text-sm text-slate-400 mt-1">Book devices in advance to prevent conflicts</p>
      </div>

      {/* New Reservation Form */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">New Reservation</h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            required
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition"
          >
            <option value="">Select device…</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition"
          />

          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition"
          />

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition"
          />

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 lg:col-span-4 h-10 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-sm font-semibold text-white transition"
          >
            {submitting ? "Creating…" : "Reserve Device"}
          </button>
        </form>
      </div>

      {/* Reservations List */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">
            {isAdmin ? "All Reservations" : "My Reservations"} ({reservations.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => <SkeletonBar key={i} className="h-12 w-full" />)}
          </div>
        ) : reservations.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-10">No reservations yet</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {reservations.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.deviceName}</p>
                  <p className="text-xs text-slate-400">
                    {r.startDate.toLocaleDateString()} {r.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" → "}
                    {r.endDate.toLocaleDateString()} {r.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {r.note && <p className="text-xs text-slate-500 mt-0.5">{r.note}</p>}
                  {isAdmin && <p className="text-xs text-slate-500">{r.userEmail}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] border ${statusColor[r.status]}`}>
                  {r.status}
                </span>
                {(isAdmin || r.userId === profile?.id) && r.status !== "cancelled" && (
                  <button
                    onClick={() => cancelReservation(r.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
