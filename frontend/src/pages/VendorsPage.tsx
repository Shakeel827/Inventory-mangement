/**
 * VendorsPage — track device vendors, warranties, and purchase info.
 *
 * Firestore collection: /vendors/{id}
 * Fields: orgId, name, contactEmail, contactPhone, website,
 *         notes, createdAt
 *
 * Devices can reference a vendorId for purchase tracking.
 */

import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, query, where, Timestamp
} from "firebase/firestore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import { SkeletonBar } from "../components/SkeletonLoader";

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  notes: string;
}

export function VendorsPage() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (profile?.role === "user") {
    return <p className="text-sm text-slate-400 p-4">Access restricted.</p>;
  }

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "vendors"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor)));
      setLoading(false);
    });
  }, [profile]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !name.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "vendors"), {
        orgId: profile.orgId,
        name: name.trim(),
        contactEmail: email.trim(),
        contactPhone: phone.trim(),
        website: website.trim(),
        notes: notes.trim(),
        createdAt: Timestamp.now(),
      });
      toast.success("Vendor added");
      setName(""); setEmail(""); setPhone(""); setWebsite(""); setNotes("");
    } catch {
      toast.error("Failed to add vendor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">🏭 Vendor Management</h1>
        <p className="text-sm text-slate-400 mt-1">Track suppliers, warranties, and purchase contacts</p>
      </div>

      {/* Add Vendor Form */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Add Vendor</h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vendor name *" required
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Contact email" type="email"
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL"
            className="h-10 rounded-lg bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (warranty terms, etc.)" rows={2}
            className="sm:col-span-2 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition resize-none" />
          <button type="submit" disabled={submitting}
            className="sm:col-span-2 h-10 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-sm font-semibold text-white transition">
            {submitting ? "Adding…" : "Add Vendor"}
          </button>
        </form>
      </div>

      {/* Vendor List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <SkeletonBar key={i} className="h-16 w-full" />)}</div>
      ) : vendors.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10">No vendors added yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white">{v.name}</h3>
                  {v.contactEmail && <p className="text-xs text-slate-400 mt-1">📧 {v.contactEmail}</p>}
                  {v.contactPhone && <p className="text-xs text-slate-400">📞 {v.contactPhone}</p>}
                  {v.website && <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 transition">🌐 {v.website}</a>}
                  {v.notes && <p className="text-xs text-slate-500 mt-2 border-t border-slate-800 pt-2">{v.notes}</p>}
                </div>
                <button onClick={() => deleteDoc(doc(db, "vendors", v.id)).then(() => toast.success("Vendor removed"))}
                  className="text-xs text-rose-400 hover:text-rose-300 transition ml-2">✕</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
