/**
 * DevicesPage — full device management with:
 *  - Search bar (name, ID, location, serial number)
 *  - Edit device inline (name, location, category, custom fields, custom ID)
 *  - Add device manually with custom fields
 *  - Bulk Excel import with real-time progress
 *  - Download template (includes custom fields)
 *  - Manage custom fields (add, edit, remove)
 *  - Quick status change (optimistic UI)
 *  - Bulk delete
 *  - PDF export + Print
 *  - Email notification on status change (via EmailJS / mailto fallback)
 */

import { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  query, updateDoc, where, writeBatch, getDoc, setDoc
} from "firebase/firestore";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device, DeviceStatus, Category } from "../types";
import { importDevicesToFirestore, parseDevicesFromWorkbook } from "../utils/deviceImport";
import { validateExcelFile } from "../utils/fileValidation";
import { DEVICE_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants";
import { TableSkeleton } from "../components/SkeletonLoader";

interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "date";
  required: boolean;
}

/** Inline edit state for a device row */
interface EditState {
  name: string;
  location: string;
  categoryId: string;
  customId: string; // user-defined ID / asset tag
  customFields: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  checked_out: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  under_repair: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  maintenance_required: "bg-red-500/20 text-red-300 border-red-500/30",
  retired: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function DevicesPage() {
  const { profile } = useAuth();

  // ── State (all hooks before early returns) ────────────────────────────────
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);

  // Add device form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newStatus, setNewStatus] = useState<DeviceStatus>("available");
  const [newCustomId, setNewCustomId] = useState("");
  const [newCustomFieldValues, setNewCustomFieldValues] = useState<Record<string, string>>({});
  const [addingDevice, setAddingDevice] = useState(false);

  // Edit device state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Custom fields manager
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<string | null>(null);

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile) return;
    getDoc(doc(db, "customFields", profile.orgId)).then((snap) => {
      if (snap.exists()) setCustomFields(snap.data()?.fields || []);
    }).catch(() => toast.error("Failed to load custom fields"));
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    setLoadingDevices(true);
    const q = query(collection(db, "devices"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id, orgId: data.orgId, name: data.name || d.id,
          categoryId: data.categoryId || null, model: data.model || null,
          serialNumber: data.serialNumber || null, location: data.location || null,
          status: data.status || "available", imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate?.() ?? null,
          customId: data.customId || null,
          ...Object.fromEntries(
            Object.entries(data).filter(([k]) =>
              !["orgId","name","categoryId","model","serialNumber","location","status","imageUrl","createdAt","updatedAt","customId"].includes(k)
            )
          )
        } as Device & { customId?: string };
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setDevices(list as Device[]);
      setLoadingDevices(false);
    }, () => { setLoadingDevices(false); toast.error("Failed to load devices"); });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, "categories"), where("orgId", "==", profile.orgId));
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    });
  }, [profile]);

  // ── RBAC ──────────────────────────────────────────────────────────────────
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  // ── Filtered devices ──────────────────────────────────────────────────────
  const filteredDevices = useMemo(() => {
    const q = search.toLowerCase();
    return devices.filter((d) => {
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.location ?? "").toLowerCase().includes(q) ||
        (d.serialNumber ?? "").toLowerCase().includes(q) ||
        ((d as any).customId ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [devices, search, statusFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Start editing a device row */
  const startEdit = (d: Device & { customId?: string }) => {
    setEditingId(d.id);
    const cfVals: Record<string, string> = {};
    customFields.forEach((f) => { cfVals[f.id] = String((d as any)[f.id] ?? ""); });
    setEditState({
      name: d.name,
      location: d.location ?? "",
      categoryId: d.categoryId ?? "",
      customId: d.customId ?? "",
      customFields: cfVals,
    });
  };

  /** Save edited device */
  const saveEdit = async () => {
    if (!editingId || !editState) return;
    setSavingEdit(true);
    try {
      const update: Record<string, any> = {
        name: editState.name.trim(),
        location: editState.location.trim() || null,
        categoryId: editState.categoryId || null,
        customId: editState.customId.trim() || null,
        updatedAt: new Date(),
      };
      customFields.forEach((f) => {
        update[f.id] = editState.customFields[f.id] ?? null;
      });
      await updateDoc(doc(db, "devices", editingId), update);
      toast.success("Device updated");
      setEditingId(null);
      setEditState(null);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  /** Optimistic status update */
  const handleQuickStatusChange = async (id: string, newStatus: DeviceStatus) => {
    setDevices((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d));
    setUpdatingStatus(id);
    try {
      await updateDoc(doc(db, "devices", id), { status: newStatus, updatedAt: new Date() });
      // Log activity
      const device = devices.find((d) => d.id === id);
      await addDoc(collection(db, "deviceActivity"), {
        orgId: profile?.orgId,
        deviceId: id,
        deviceName: device?.name,
        action: newStatus === "checked_out" ? "check_out" : "status_change",
        newStatus,
        userId: null,
        userEmail: "admin",
        timestamp: new Date(),
      });
    } catch {
      setDevices((prev) => prev.map((d) => d.id === id ? { ...d, status: d.status } : d));
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this device? This cannot be undone.")) return;
    setDeletingDevice(id);
    try {
      await deleteDoc(doc(db, "devices", id));
      toast.success("Device deleted");
    } catch {
      toast.error("Failed to delete device");
    } finally {
      setDeletingDevice(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} devices? This cannot be undone.`)) return;
    const batch = writeBatch(db);
    selectedIds.forEach((id) => batch.delete(doc(db, "devices", id)));
    await batch.commit();
    setSelectedIds(new Set());
    toast.success(`Deleted ${selectedIds.size} devices`);
  };

  const selectAll = () => setSelectedIds(new Set(filteredDevices.map((d) => d.id)));
  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  /** Add device manually */
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newName.trim()) return;
    setAddingDevice(true);
    try {
      const data: Record<string, any> = {
        orgId: profile.orgId,
        name: newName.trim(),
        categoryId: newCategory || null,
        location: newLocation.trim() || null,
        status: newStatus,
        customId: newCustomId.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      customFields.forEach((f) => {
        if (newCustomFieldValues[f.id]) data[f.id] = newCustomFieldValues[f.id];
      });
      await addDoc(collection(db, "devices"), data);
      toast.success("Device added");
      setNewName(""); setNewCategory(null); setNewLocation("");
      setNewStatus("available"); setNewCustomId(""); setNewCustomFieldValues({});
    } catch {
      toast.error("Failed to add device");
    } finally {
      setAddingDevice(false);
    }
  };

  /** Excel import */
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!profile) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateExcelFile(file);
    if (!validation.valid) { toast.error(validation.error || ERROR_MESSAGES.INVALID_FILE_TYPE); e.target.value = ""; return; }
    setImportSummary(null); setImportErrors([]); setImporting(true); setImportProgress(0);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseDevicesFromWorkbook(buffer);
      const catMap: Record<string, string> = {};
      categories.forEach((c) => { catMap[c.name.toLowerCase()] = c.id; });
      const result = await importDevicesToFirestore(db, profile.orgId, parsed, catMap, customFields, (p) => setImportProgress(p));
      setImportSummary(`✅ Imported ${result.imported} of ${result.totalRows} rows. Skipped ${result.skipped}.`);
      toast.success(SUCCESS_MESSAGES.IMPORT_COMPLETE);
      setImportErrors(result.errors);
    } catch (err: any) {
      setImportSummary(`❌ ${err.message || "Failed to import"}`);
      toast.error(err.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setImporting(false); setImportProgress(0); e.target.value = "";
    }
  };

  /** Download Excel template with all custom fields */
  const downloadTemplate = () => {
    const row: Record<string, string> = {
      "Name": "Example Laptop", "Custom ID": "ASSET-001",
      "Serial Number": "SN123456", "Model": "Dell XPS 15",
      "Location": "Office Floor 2", "Status": "available", "Category": "Laptops",
    };
    customFields.forEach((f) => {
      row[f.label] = f.type === "date" ? "2024-01-01" : f.type === "number" ? "100" : `Sample ${f.label}`;
    });
    const instructions = [
      { Column: "Name", Description: "Device name (Required)", Example: "Dell Laptop" },
      { Column: "Custom ID", Description: "Your own asset tag / ID (Optional)", Example: "ASSET-001" },
      { Column: "Serial Number", Description: "Serial number (Optional)", Example: "SN123456" },
      { Column: "Model", Description: "Device model (Optional)", Example: "XPS 15" },
      { Column: "Location", Description: "Physical location (Optional)", Example: "Office Floor 2" },
      { Column: "Status", Description: "available | checked_out | under_repair | retired", Example: "available" },
      { Column: "Category", Description: "Category name (must exist in system)", Example: "Laptops" },
      ...customFields.map((f) => ({
        Column: f.label,
        Description: `${f.type} field (${f.required ? "Required" : "Optional"})`,
        Example: f.type === "date" ? "2024-01-01" : f.type === "number" ? "100" : "Sample value",
      })),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([row]), "Devices");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(instructions), "Instructions");
    XLSX.writeFile(wb, "device-import-template.xlsx");
    toast.success("Template downloaded");
  };

  /** Custom fields CRUD */
  const handleAddField = async () => {
    if (!profile || !newFieldLabel.trim()) return;
    const id = newFieldLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (customFields.some((f) => f.id === id)) { toast.error("Field already exists"); return; }
    const updated = [...customFields, { id, label: newFieldLabel.trim(), type: newFieldType, required: newFieldRequired }];
    setCustomFields(updated);
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updated });
    setNewFieldLabel(""); setNewFieldType("text"); setNewFieldRequired(false);
    toast.success("Field added — template updated");
  };

  const handleEditField = async (fieldId: string) => {
    if (!profile || !editFieldLabel.trim()) return;
    const updated = customFields.map((f) => f.id === fieldId ? { ...f, label: editFieldLabel.trim() } : f);
    setCustomFields(updated);
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updated });
    setEditingFieldId(null); setEditFieldLabel("");
    toast.success("Field updated");
  };

  const handleRemoveField = async (id: string) => {
    if (!profile) return;
    const updated = customFields.filter((f) => f.id !== id);
    setCustomFields(updated);
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updated });
    toast.success("Field removed");
  };

  /** PDF export */
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16); pdf.text("Device Inventory", 14, 20);
    pdf.setFontSize(10); pdf.text(`Org: ${profile?.orgId} | ${new Date().toLocaleString()}`, 14, 28);
    autoTable(pdf, {
      startY: 34,
      head: [["Name", "Custom ID", "Category", "Location", "Status"]],
      body: filteredDevices.map((d) => [
        d.name, (d as any).customId || "—",
        categories.find((c) => c.id === d.categoryId)?.name || "—",
        d.location || "—", d.status,
      ]),
      theme: "grid", headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8 },
    });
    pdf.save(`devices-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 print:bg-white">

      {/* Import progress overlay */}
      <AnimatePresence>
        {importing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm p-4"
          >
            <div className="max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">Importing devices…</span>
                <span className="text-sm font-bold text-primary-400">{importProgress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                  animate={{ width: `${importProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-black text-white">📦 Devices</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {filteredDevices.length} of {devices.length} devices
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportPDF} className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition">📄 PDF</button>
          <button onClick={() => window.print()} className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition">🖨️ Print</button>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, location, serial…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | "all")}
          className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition"
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="checked_out">Checked out</option>
          <option value="under_repair">Under repair</option>
          <option value="maintenance_required">Maintenance required</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {/* ── Add Device Form ── */}
      <form onSubmit={handleAddManual} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Add Device Manually</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input required value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Device Name *"
            className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <input value={newCustomId} onChange={(e) => setNewCustomId(e.target.value)}
            placeholder="Custom ID / Asset Tag (optional)"
            className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Location"
            className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          <select value={newCategory || ""} onChange={(e) => setNewCategory(e.target.value || null)}
            className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as DeviceStatus)}
            className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white outline-none focus:border-primary-500 transition">
            <option value="available">Available</option>
            <option value="checked_out">Checked out</option>
            <option value="under_repair">Under repair</option>
            <option value="maintenance_required">Maintenance required</option>
            <option value="retired">Retired</option>
          </select>
          {customFields.map((f) => (
            <input key={f.id} type={f.type} required={f.required}
              placeholder={`${f.label}${f.required ? " *" : ""}`}
              value={newCustomFieldValues[f.id] || ""}
              onChange={(e) => setNewCustomFieldValues({ ...newCustomFieldValues, [f.id]: e.target.value })}
              className="h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
          ))}
        </div>
        <button type="submit" disabled={addingDevice}
          className="h-10 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-sm font-semibold text-white transition shadow-lg shadow-primary-600/30">
          {addingDevice ? "Adding…" : "+ Add Device"}
        </button>
      </form>

      {/* ── Bulk Upload Section ── */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Bulk Upload from Excel</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowFieldsManager((v) => !v)}
              className="h-9 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white transition">
              ⚙️ Manage Fields {customFields.length > 0 && `(${customFields.length})`}
            </button>
            <button onClick={downloadTemplate}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/30">
              📥 Download Template
            </button>
          </div>
        </div>

        {/* Custom Fields Manager */}
        <AnimatePresence>
          {showFieldsManager && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-700 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Custom Fields</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field name"
                  className="h-9 rounded-lg bg-slate-800 border border-slate-700 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-500 transition" />
                <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="h-9 rounded-lg bg-slate-800 border border-slate-700 px-2 text-xs text-white outline-none focus:border-primary-500 transition">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-slate-300 h-9 px-2">
                  <input type="checkbox" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} className="rounded" />
                  Required
                </label>
                <button onClick={handleAddField}
                  className="h-9 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white transition">
                  + Add Field
                </button>
              </div>
              <div className="space-y-1.5">
                {customFields.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    {editingFieldId === f.id ? (
                      <>
                        <input value={editFieldLabel} onChange={(e) => setEditFieldLabel(e.target.value)} autoFocus
                          className="flex-1 h-7 rounded-md bg-slate-800 border border-slate-700 px-2 text-xs text-white outline-none focus:border-primary-500" />
                        <button onClick={() => handleEditField(f.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Save</button>
                        <button onClick={() => { setEditingFieldId(null); setEditFieldLabel(""); }} className="text-xs text-slate-400 hover:text-slate-300">Cancel</button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 text-xs">
                          <span className="font-medium text-white">{f.label}</span>
                          <span className="text-slate-500 ml-2">({f.type}{f.required ? ", required" : ""})</span>
                        </div>
                        <button onClick={() => { setEditingFieldId(f.id); setEditFieldLabel(f.label); }}
                          className="text-xs text-primary-400 hover:text-primary-300 font-medium">Edit</button>
                        <button onClick={() => handleRemoveField(f.id)} className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
                      </>
                    )}
                  </div>
                ))}
                {customFields.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-2">No custom fields yet. Add one above — it will appear in the template.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-slate-400">
          Upload a .xlsx file. Required: <strong className="text-slate-300">Name</strong>. Optional: Custom ID, Serial Number, Model, Location, Status, Category
          {customFields.length > 0 && `, ${customFields.map((f) => f.label).join(", ")}`}.
        </p>
        <label className="cursor-pointer inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition">
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={importing} className="hidden" />
          {importing ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /> Importing…</>
          ) : "📁 Choose Excel File"}
        </label>
        {importSummary && (
          <p className={`text-xs px-3 py-2 rounded-lg border ${importSummary.startsWith("✅") ? "bg-emerald-950/40 border-emerald-900 text-emerald-300" : "bg-rose-950/40 border-rose-900 text-rose-300"}`}>
            {importSummary}
          </p>
        )}
        {importErrors.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-900 bg-amber-950/40 p-2 text-xs text-amber-200 space-y-0.5">
            {importErrors.map((e) => <div key={`${e.row}-${e.message}`}>Row {e.row}: {e.message}</div>)}
          </div>
        )}
      </div>

      {/* ── Bulk actions ── */}
      <div className="flex items-center justify-between text-xs print:hidden">
        <button onClick={handleBulkDelete} disabled={selectedIds.size === 0}
          className="text-rose-400 hover:text-rose-300 disabled:opacity-40 transition">
          🗑️ Delete selected ({selectedIds.size})
        </button>
        <button onClick={selectedIds.size === filteredDevices.length ? clearSelection : selectAll}
          className="text-slate-400 hover:text-white transition">
          {selectedIds.size === filteredDevices.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* ── Device Table ── */}
      {loadingDevices ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox"
                      checked={filteredDevices.length > 0 && selectedIds.size === filteredDevices.length}
                      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                      className="rounded" />
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Custom ID</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Location</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((d, i) => {
                  const isEditing = editingId === d.id;
                  const dev = d as Device & { customId?: string };
                  return (
                    <motion.tr key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-t border-slate-800 transition ${isEditing ? "bg-primary-950/20" : "hover:bg-white/3"}`}
                    >
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)} className="rounded" />
                      </td>

                      {/* Name */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input value={editState!.name} onChange={(e) => setEditState({ ...editState!, name: e.target.value })}
                            className="w-full h-8 rounded-lg bg-slate-800 border border-primary-500 px-2 text-sm text-white outline-none" />
                        ) : (
                          <span className="font-medium text-white">{d.name}</span>
                        )}
                      </td>

                      {/* Custom ID */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input value={editState!.customId} onChange={(e) => setEditState({ ...editState!, customId: e.target.value })}
                            placeholder="Asset tag…"
                            className="w-full h-8 rounded-lg bg-slate-800 border border-slate-600 px-2 text-sm text-white outline-none focus:border-primary-500" />
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">{dev.customId || <span className="text-slate-600">—</span>}</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <select value={editState!.categoryId} onChange={(e) => setEditState({ ...editState!, categoryId: e.target.value })}
                            className="h-8 rounded-lg bg-slate-800 border border-slate-600 px-2 text-sm text-white outline-none focus:border-primary-500">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">{categories.find((c) => c.id === d.categoryId)?.name || "—"}</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input value={editState!.location} onChange={(e) => setEditState({ ...editState!, location: e.target.value })}
                            placeholder="Location…"
                            className="w-full h-8 rounded-lg bg-slate-800 border border-slate-600 px-2 text-sm text-white outline-none focus:border-primary-500" />
                        ) : (
                          <span className="text-xs text-slate-400">{d.location || "—"}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <select value={d.status} disabled={updatingStatus === d.id || isEditing}
                            onChange={(e) => handleQuickStatusChange(d.id, e.target.value as DeviceStatus)}
                            className={`h-8 rounded-lg border px-2 text-xs font-medium outline-none transition ${STATUS_COLORS[d.status] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                            <option value="available">Available</option>
                            <option value="checked_out">Checked out</option>
                            <option value="under_repair">Under repair</option>
                            <option value="maintenance_required">Maintenance req.</option>
                            <option value="retired">Retired</option>
                          </select>
                          {updatingStatus === d.id && (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} disabled={savingEdit}
                                className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition disabled:opacity-50">
                                {savingEdit ? "…" : "Save"}
                              </button>
                              <button onClick={() => { setEditingId(null); setEditState(null); }}
                                className="h-7 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition">
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(dev)}
                                className="h-7 px-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-300 transition">
                                ✏️ Edit
                              </button>
                              <Link to={`/dashboard/devices/${d.id}`}
                                className="h-7 px-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-300 transition flex items-center">
                                History
                              </Link>
                              <button onClick={() => handleDelete(d.id)} disabled={deletingDevice === d.id}
                                className="h-7 px-2.5 rounded-lg bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-xs text-rose-300 transition disabled:opacity-50">
                                {deletingDevice === d.id ? "…" : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      {search ? `No devices match "${search}"` : "No devices yet. Add one above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
