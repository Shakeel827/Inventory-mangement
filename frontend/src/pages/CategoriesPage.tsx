import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Category } from "../types";

export function CategoriesPage() {
  const { profile } = useAuth();

  // Role-based access control
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [deviceCounts, setDeviceCounts] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "categories"),
      where("orgId", "==", profile.orgId)
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
  }, [profile]);

  // Load device counts per category
  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "devices"),
      where("orgId", "==", profile.orgId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const counts: Record<string, number> = {};
      snap.forEach((d) => {
        const categoryId = d.data().categoryId || "uncategorized";
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });
      setDeviceCounts(counts);
    });
    return () => unsub();
  }, [profile]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !name.trim()) return;
    await addDoc(collection(db, "categories"), {
      orgId: profile.orgId,
      name: name.trim(),
      description: description.trim() || null
    });
    setName("");
    setDescription("");
  };

  const handleDelete = async (id: string) => {
    const yes = window.confirm(
      "Delete this category? Devices will remain but lose the link."
    );
    if (!yes) return;
    await deleteDoc(doc(db, "categories", id));
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-50">Categories</h1>
        <p className="text-xs text-slate-400">
          Define your own inventory taxonomy (laptops, monitors, networking…).
        </p>
      </header>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-200">
            Name
          </label>
          <input
            className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/60"
            placeholder="Laptop, Monitor, Accessories…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-200">
            Description
          </label>
          <input
            className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/60"
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary-600 px-4 text-xs font-medium text-white shadow-md shadow-primary-600/40 hover:bg-primary-700 transition"
        >
          Add category
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Devices</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr
                key={c.id}
                className="border-t border-slate-800 odd:bg-slate-950/40"
              >
                <td className="px-3 py-2 text-xs font-medium">{c.name}</td>
                <td className="px-3 py-2 text-xs text-slate-300">
                  {c.description || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-primary-500/10 px-2 py-0.5 text-[11px] font-medium text-primary-400 border border-primary-500/20">
                    {deviceCounts[c.id] || 0} devices
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-[11px]">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md border border-rose-800 bg-rose-950/70 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-900 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  No categories yet. Create your first above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

