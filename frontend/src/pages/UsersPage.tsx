/**
 * UsersPage — admin user management with:
 *  - Create single user (email + password + role)
 *  - Bulk upload users via Excel (.xlsx)
 *  - Download Excel template for bulk upload
 *  - Change roles inline
 *
 * Excel template columns: Name, Email, Password, Role (admin/manager/scanner)
 */

import { useEffect, useRef, useState } from "react";
import {
  collection, onSnapshot, query, updateDoc, where, doc, setDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { db, auth } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { AppUserProfile, UserRole } from "../types";

interface UserRow extends AppUserProfile {}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", manager: "Manager", user: "Scanner"
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  manager: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  user: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export function UsersPage() {
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // All hooks before early returns
  const [users, setUsers] = useState<UserRow[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [creating, setCreating] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "users"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, email: data.email ?? null, displayName: data.displayName ?? null, orgId: data.orgId, role: data.role };
      }));
    });
  }, [profile]);

  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Access restricted to admins only.</p>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <p className="text-xs text-slate-400 p-4">Only admins can manage users.</p>;
  }

  if (!profile) return null;

  /** Change a user's role */
  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  /** Create a single user */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, newEmail.trim(), newPassword);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: newEmail.trim(),
        displayName: newDisplayName.trim() || null,
        orgId: profile.orgId,
        role: newRole,
        createdAt: new Date()
      });
      toast.success(`User ${newEmail} created`);
      setNewEmail(""); setNewPassword(""); setNewDisplayName(""); setNewRole("user");
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  /** Download Excel template for bulk user upload */
  const downloadTemplate = () => {
    const templateData = [
      { Name: "John Doe", Email: "john@company.com", Password: "Pass@1234", Role: "scanner" },
      { Name: "Jane Smith", Email: "jane@company.com", Password: "Pass@5678", Role: "manager" },
    ];
    const instructions = [
      { Column: "Name", Description: "Full name of the user", Example: "John Doe" },
      { Column: "Email", Description: "Email address (must be unique)", Example: "john@company.com" },
      { Column: "Password", Description: "Min 8 chars, uppercase, lowercase, number", Example: "Pass@1234" },
      { Column: "Role", Description: "admin | manager | scanner", Example: "scanner" },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(templateData), "Users");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(instructions), "Instructions");
    XLSX.writeFile(wb, "user-import-template.xlsx");
    toast.success("Template downloaded");
  };

  /** Bulk import users from Excel */
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Only Excel files (.xlsx, .xls) are allowed");
      e.target.value = "";
      return;
    }

    setBulkLoading(true);
    setBulkProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws);

      if (rows.length === 0) { toast.error("No data found in Excel file"); return; }

      let created = 0;
      let failed = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const email = String(row.Email || row.email || "").trim();
        const password = String(row.Password || row.password || "").trim();
        const name = String(row.Name || row.name || "").trim();
        const roleRaw = String(row.Role || row.role || "scanner").toLowerCase().trim();
        const role: UserRole = roleRaw === "admin" ? "admin" : roleRaw === "manager" ? "manager" : "user";

        if (!email || !password) { failed++; continue; }

        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", cred.user.uid), {
            email, displayName: name || null, orgId: profile.orgId, role, createdAt: new Date()
          });
          created++;
        } catch {
          failed++;
        }

        setBulkProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      toast.success(`Imported ${created} users${failed > 0 ? `, ${failed} failed` : ""}`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setBulkLoading(false);
      setBulkProgress(0);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white">👥 Users</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage team members and their roles — {users.length} total
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-600/30 transition"
          >
            📥 Download Template
          </button>
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition cursor-pointer">
            📤 Bulk Upload Excel
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkUpload} />
          </label>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition shadow-lg shadow-primary-600/30"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Bulk upload progress */}
      <AnimatePresence>
        {bulkLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-300">Importing users…</span>
              <span className="text-sm font-bold text-primary-400">{bulkProgress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                animate={{ width: `${bulkProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateUser}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
          >
            <h2 className="text-sm font-bold text-white">Create New User</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition"
              />
              <input
                type="email"
                required
                placeholder="Email address *"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Password (min 8 chars) *"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition"
              >
                <option value="user">Scanner</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-sm font-semibold text-white transition"
              >
                {creating ? "Creating…" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-slate-800 hover:bg-white/3 transition"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {u.displayName || <span className="text-slate-500 italic">No name</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="h-8 rounded-lg bg-slate-800 border border-slate-700 px-2 text-xs text-white outline-none focus:border-primary-500 transition"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">Scanner</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    No users found. Create your first user above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk upload instructions */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400 mb-1">📋 Bulk Upload Format</p>
        <p>Download the template above. Fill in: <strong className="text-slate-300">Name</strong>, <strong className="text-slate-300">Email</strong>, <strong className="text-slate-300">Password</strong>, <strong className="text-slate-300">Role</strong> (admin/manager/scanner).</p>
        <p className="mt-1">Passwords must be at least 8 characters. Invalid rows are skipped automatically.</p>
      </div>
    </div>
  );
}
