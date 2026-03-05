import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  where,
  doc,
  setDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { AppUserProfile, UserRole } from "../types";

interface UserRow extends AppUserProfile {}

export function UsersPage() {
  const { profile } = useAuth();

  // Role-based access control
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  const [users, setUsers] = useState<UserRow[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "users"),
      where("orgId", "==", profile.orgId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: UserRow[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          email: data.email ?? null,
          displayName: data.displayName ?? null,
          orgId: data.orgId,
          role: data.role
        });
      });
      setUsers(list);
    });
    return () => unsub();
  }, [profile]);

  if (!profile) return null;

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await updateDoc(doc(db, "users", userId), { role });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== "admin") {
      setError("Only admins can create users");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail.trim(),
        newPassword
      );

      // Create Firestore user document
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: newEmail.trim(),
        displayName: newDisplayName.trim() || null,
        orgId: profile.orgId,
        role: newRole,
        createdAt: new Date()
      });

      setSuccess(`User ${newEmail} created successfully!`);
      setNewEmail("");
      setNewPassword("");
      setNewDisplayName("");
      setNewRole("user");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  if (profile.role !== "admin") {
    return (
      <p className="text-xs text-slate-400">
        Only admins can manage users.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-50">Users</h1>
        <p className="text-xs text-slate-400">
          Create new users and manage roles for your organization.
        </p>
      </header>

      {/* Create User Form */}
      <form
        onSubmit={handleCreateUser}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-slate-100">
          Create new user
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="email"
            required
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
            placeholder="Password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="text"
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
            placeholder="Display Name (optional)"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
          >
            <option value="user">Scanner</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="h-9 rounded-md bg-primary-600 px-4 text-xs font-medium text-white shadow-md shadow-primary-600/40 hover:bg-primary-700 transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create User"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-900 rounded-md px-3 py-2">
            {success}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-slate-800 odd:bg-slate-950/40"
              >
                <td className="px-3 py-2 text-xs">
                  {u.displayName || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  {u.email || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  <select
                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px]"
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value as UserRole)
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Scanner</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  No users found for this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

