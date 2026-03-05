import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebaseClient";
import type { Device, DeviceStatus, Category } from "../types";

interface DeviceActivityRow {
  id: string;
  action: "check_in" | "check_out";
  userEmail?: string;
  timestamp?: Date | null;
}

export function DeviceDetailsPage() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState<any | null>(null);
  const [activity, setActivity] = useState<DeviceActivityRow[]>([]);

  // editable form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<DeviceStatus>("available");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDevice() {
      if (!deviceId) return;
      const ref = doc(db, "devices", deviceId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as any;
        setDevice(data);
        setName(data.name || "");
        setLocation(data.location || "");
        setStatus(data.status || "available");
        setCategoryId(data.categoryId || null);
      }
    }
    loadDevice();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const q = query(
      collection(db, "deviceActivity"),
      where("deviceId", "==", deviceId),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: DeviceActivityRow[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          action: data.action,
          userEmail: data.userEmail,
          timestamp: data.timestamp?.toDate?.() ?? null
        });
      });
      setActivity(list);
    });
    return () => unsub();
  }, [deviceId]);

  // categories for selection
  useEffect(() => {
    if (!deviceId || !device) return;
    const orgId = device.orgId;
    const q = query(
      collection(db, "categories"),
      where("orgId", "==", orgId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Category[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          orgId: data.orgId,
          name: data.name,
          description: data.description || null
        });
      });
      setCategories(list);
    });
    return () => unsub();
  }, [deviceId, device]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;
    await updateDoc(doc(db, "devices", deviceId), {
      name: name.trim(),
      location: location.trim() || null,
      status,
      categoryId: categoryId || null,
      updatedAt: new Date()
    });
    navigate(`/devices`);
  };

  if (!deviceId) {
    return (
      <p className="text-xs text-slate-400">
        No device selected.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Edit: {device?.name || deviceId}
          </h1>
          <p className="text-[11px] text-slate-500 break-all">
            ID: {deviceId}
          </p>
        </div>
        <Link
          to="/devices"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          Back to devices
        </Link>
      </header>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-slate-200">Name</label>
            <input
              required
              className="mt-1 w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-200">Category</label>
            <select
              className="mt-1 w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-200">Location</label>
            <input
              className="mt-1 w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-200">Status</label>
            <select
              className="mt-1 w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
              value={status}
              onChange={(e) => setStatus(e.target.value as DeviceStatus)}
            >
              <option value="available">Available</option>
              <option value="checked_out">Checked out</option>
              <option value="under_repair">Under repair</option>
              <option value="maintenance_required">
                Maintenance required
              </option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary-600 px-4 text-xs font-medium text-white shadow-md shadow-primary-600/40 hover:bg-primary-700 transition"
        >
          Save changes
        </button>
      </form>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Activity history
        </h2>
        <div className="max-h-80 overflow-y-auto">
          {activity.length === 0 ? (
            <p className="text-xs text-slate-400">
              No check-in / check-out events recorded yet.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-200">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                >
                  <div>
                    <div className="font-medium capitalize">
                      {a.action === "check_in" ? "Check-in" : "Check-out"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {a.userEmail || "Unknown user"}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {a.timestamp?.toLocaleString() ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

