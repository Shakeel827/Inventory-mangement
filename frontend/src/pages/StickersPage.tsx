import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device } from "../types";

export function StickersPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);

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
    });
    return () => unsub();
  }, [profile]);

  if (!profile) {
    return null;
  }

  const baseUrl = window.location.origin;

  return (
    <div className="space-y-3 print:bg-white">
      <header className="print:hidden">
        <h1 className="text-lg font-semibold text-slate-50">
          Sticker generator
        </h1>
        <p className="text-xs text-slate-400">
          Print QR stickers for your devices. Use your browser&apos;s{" "}
          <span className="font-semibold">Print</span> function to send to a
          label printer.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
        {devices.map((d) => {
          const url = `${baseUrl}/d/${profile.orgId}/${d.id}`;
          return (
            <div
              key={d.id}
              className="flex flex-col items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center text-[11px] print:border-black print:bg-white"
            >
              <div className="mb-1 font-semibold truncate w-full">
                {d.name}
              </div>
              <QRCodeCanvas value={url} size={88} />
              <div className="mt-1 w-full break-all">
                <div className="truncate">
                  <span className="font-semibold">ID:</span> {d.id}
                </div>
                {d.serialNumber && (
                  <div className="truncate">
                    <span className="font-semibold">S/N:</span>{" "}
                    {d.serialNumber}
                  </div>
                )}
                {d.location && (
                  <div className="truncate">
                    <span className="font-semibold">Loc:</span> {d.location}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

