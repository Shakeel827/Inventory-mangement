/**
 * StickersPage — QR sticker generator with search.
 *
 * Features:
 *  - Search bar to filter devices by name, location, or ID
 *  - Select individual or all devices to print
 *  - Print selected stickers via browser print
 *  - Each sticker shows: name, QR code, ID, serial number, location
 */

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device } from "../types";

export function StickersPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "devices"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id, orgId: data.orgId, name: data.name || d.id,
          categoryId: data.categoryId || null, model: data.model || null,
          serialNumber: data.serialNumber || null, location: data.location || null,
          status: data.status || "available", imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate?.() ?? null
        } as Device;
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setDevices(list);
    });
  }, [profile]);

  if (!profile) return null;

  const baseUrl = window.location.origin;

  // Filter by search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return devices;
    return devices.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.location ?? "").toLowerCase().includes(q) ||
      (d.serialNumber ?? "").toLowerCase().includes(q)
    );
  }, [devices, search]);

  // Devices to show in print mode (selected or all filtered)
  const toPrint = printMode
    ? filtered.filter((d) => selected.size === 0 || selected.has(d.id))
    : filtered;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((d) => d.id)));
  const clearAll = () => setSelected(new Set());

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  return (
    <div className="space-y-5 print:bg-white print:p-0">
      {/* Header */}
      <div className="print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-black text-white">🖨️ QR Sticker Generator</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Print QR stickers for your devices. Use your browser's Print function.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition shadow-lg shadow-primary-600/30"
            >
              🖨️ Print {selected.size > 0 ? `(${selected.size})` : "All"}
            </button>
          </div>
        </div>

        {/* Search + Select controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name, location, ID, serial…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
            )}
          </div>

          <div className="flex gap-2 text-xs">
            <button onClick={selectAll} className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition">
              Select All ({filtered.length})
            </button>
            {selected.size > 0 && (
              <button onClick={clearAll} className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition">
                Clear ({selected.size})
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {filtered.length} of {devices.length} devices
            {selected.size > 0 && ` · ${selected.size} selected`}
          </p>
        </div>
      </div>

      {/* Sticker Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm print:hidden">
          {search ? `No devices match "${search}"` : "No devices found"}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-2">
          {toPrint.map((d, i) => {
            const url = `${baseUrl}/d/${profile.orgId}/${d.id}`;
            const isSelected = selected.has(d.id);
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => toggleSelect(d.id)}
                className={`relative flex flex-col items-center rounded-2xl border p-3 text-center cursor-pointer transition print:border-black print:bg-white print:rounded-none print:cursor-default ${
                  isSelected
                    ? "border-primary-500 bg-primary-600/10 shadow-lg shadow-primary-600/20"
                    : "border-slate-800 bg-slate-900/80 hover:border-slate-600"
                }`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center print:hidden">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}

                {/* Device name */}
                <p className="text-xs font-bold text-white mb-2 truncate w-full print:text-black">
                  {d.name}
                </p>

                {/* QR Code */}
                <div className="bg-white p-1.5 rounded-lg">
                  <QRCodeCanvas value={url} size={96} />
                </div>

                {/* Device info */}
                <div className="mt-2 w-full text-[10px] text-slate-400 space-y-0.5 print:text-black">
                  <div className="truncate">
                    <span className="font-semibold">ID:</span>{" "}
                    <span className="font-mono text-[9px]">{d.id.slice(0, 16)}…</span>
                  </div>
                  {(d as any).customId && (
                    <div className="truncate">
                      <span className="font-semibold">Tag:</span> {(d as any).customId}
                    </div>
                  )}
                  {d.serialNumber && (
                    <div className="truncate">
                      <span className="font-semibold">S/N:</span> {d.serialNumber}
                    </div>
                  )}
                  {d.location && (
                    <div className="truncate">
                      <span className="font-semibold">Loc:</span> {d.location}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
