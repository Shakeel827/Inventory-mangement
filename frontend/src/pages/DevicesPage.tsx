import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  getDoc,
  setDoc
} from "firebase/firestore";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from 'react-hot-toast';
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import type { Device, DeviceStatus, Category } from "../types";
import { importDevicesToFirestore, parseDevicesFromWorkbook } from "../utils/deviceImport";
import { validateExcelFile } from "../utils/fileValidation";
import { DEVICE_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants";

/**
 * Custom field definition
 */
interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "date";
  required: boolean;
}

export function DevicesPage() {
  const { profile } = useAuth();

  // Role-based access control
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [addingDevice, setAddingDevice] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<string | null>(null);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");

  // categories for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);

  // manual add form state with custom fields
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newStatus, setNewStatus] = useState<DeviceStatus>("available");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load custom fields
  useEffect(() => {
    if (!profile) return;
    const fieldsDocRef = doc(db, "customFields", profile.orgId);
    
    const loadFields = async () => {
      try {
        const snap = await getDoc(fieldsDocRef);
        if (snap.exists()) {
          const data = snap.data();
          setCustomFields(data?.fields || []);
        }
      } catch (error) {
        console.error("Error loading custom fields:", error);
        toast.error("Failed to load custom fields");
      }
    };
    
    loadFields();
  }, [profile]);

  // Load devices
  useEffect(() => {
    if (!profile) return;
    setLoadingDevices(true);
    const q = query(
      collection(db, "devices"),
      where("orgId", "==", profile.orgId),
      orderBy("name")
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
      setLoadingDevices(false);
    });
    return () => unsub();
  }, [profile]);

  // also load categories for dropdowns
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredDevices.map((d) => d.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const yes = window.confirm("Delete selected devices? This cannot be undone.");
    if (!yes) return;
    const batch = writeBatch(db);
    selectedIds.forEach((id) => batch.delete(doc(db, "devices", id)));
    await batch.commit();
    clearSelection();
  };

  const filteredDevices = useMemo(
    () =>
      devices.filter((d) => {
        const matchesSearch =
          !search ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.id.toLowerCase().includes(search.toLowerCase()) ||
          (d.location ?? "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ? true : d.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [devices, search, statusFilter]
  );

  /**
   * Optimistic status update - updates UI immediately, then syncs to server
   */
  const handleQuickStatusChange = async (
    id: string,
    newStatus: DeviceStatus
  ) => {
    // Optimistic update - update UI immediately
    setDevices(prevDevices => 
      prevDevices.map(d => d.id === id ? { ...d, status: newStatus } : d)
    );
    
    setUpdatingStatus(id);
    try {
      // Update server in background
      await updateDoc(doc(db, "devices", id), { 
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      // Revert on error
      setDevices(prevDevices => 
        prevDevices.map(d => d.id === id ? { ...d, status: d.status } : d)
      );
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    const yes = window.confirm(
      "Delete this device? This will not remove history."
    );
    if (!yes) return;
    
    setDeletingDevice(id);
    try {
      await deleteDoc(doc(db, "devices", id));
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Failed to delete device");
    } finally {
      setDeletingDevice(null);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!profile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file before processing
    const validation = validateExcelFile(file);
    if (!validation.valid) {
      toast.error(validation.error || ERROR_MESSAGES.INVALID_FILE_TYPE);
      e.target.value = ""; // Reset file input
      return;
    }

    setImportSummary(null);
    setImportErrors([]);
    setImporting(true);
    setImportProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseDevicesFromWorkbook(buffer);

      const catMap: Record<string, string> = {};
      categories.forEach((c) => {
        catMap[c.name.toLowerCase()] = c.id;
      });

      // Pass progress callback
      const result = await importDevicesToFirestore(
        db, 
        profile.orgId, 
        parsed, 
        catMap, 
        customFields,
        (progress) => setImportProgress(progress)
      );
      
      const successMsg = `✅ Imported ${result.imported} of ${result.totalRows} rows. Skipped ${result.skipped}.`;
      setImportSummary(successMsg);
      toast.success(SUCCESS_MESSAGES.IMPORT_COMPLETE);
      setImportErrors(result.errors);
    } catch (err: any) {
      const errorMsg = `❌ ${err.message || "Failed to import devices"}`;
      setImportSummary(errorMsg);
      toast.error(err.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setImporting(false);
      setImportProgress(0);
      e.target.value = "";
    }
  };

  /**
   * Add device with custom fields
   */
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newName.trim()) return;

    setAddingDevice(true);
    try {
      const deviceData: any = {
        orgId: profile.orgId,
        name: newName.trim(),
        categoryId: newCategory || null,
        location: newLocation.trim() || null,
        status: newStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add custom field values
      customFields.forEach(field => {
        const value = customFieldValues[field.id];
        if (value !== undefined && value !== "") {
          deviceData[field.id] = value;
        }
      });

      await addDoc(collection(db, "devices"), deviceData);

      // Reset form
      setNewName("");
      setNewCategory(null);
      setNewLocation("");
      setNewStatus("available");
      setCustomFieldValues({});
    } catch (error) {
      console.error("Error adding device:", error);
      alert("Failed to add device");
    } finally {
      setAddingDevice(false);
    }
  };

  /**
   * Download Excel template with custom fields
   */
  const downloadTemplate = () => {
    // Build template columns
    const templateRow: any = {
      "Name": "Example Device",
      "Serial Number": "SN123456",
      "Model": "Model XYZ",
      "Location": "Office Floor 2",
      "Status": "available",
      "Category": "Electronics"
    };
    
    // Add custom fields to template
    customFields.forEach(field => {
      if (field.type === "date") {
        templateRow[field.label] = "2024-01-01";
      } else if (field.type === "number") {
        templateRow[field.label] = "100";
      } else {
        templateRow[field.label] = "Sample " + field.label;
      }
    });

    const templateData = [templateRow];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Devices");
    
    // Instructions
    const instructions: any[] = [
      { "Column": "Name", "Description": "Device name (Required)", "Example": "Dell Laptop" },
      { "Column": "Serial Number", "Description": "Serial number (Optional)", "Example": "SN123456" },
      { "Column": "Model", "Description": "Device model (Optional)", "Example": "XPS 15" },
      { "Column": "Location", "Description": "Physical location (Optional)", "Example": "Office Floor 2" },
      { "Column": "Status", "Description": "available, checked_out, under_repair, maintenance_required, retired", "Example": "available" },
      { "Column": "Category", "Description": "Category name (must exist in system)", "Example": "Laptops" }
    ];
    
    // Add custom field instructions
    customFields.forEach(field => {
      instructions.push({
        "Column": field.label,
        "Description": `${field.type} field (${field.required ? "Required" : "Optional"})`,
        "Example": field.type === "date" ? "2024-01-01" : field.type === "number" ? "100" : "Sample value"
      });
    });
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
    
    XLSX.writeFile(wb, "device-import-template.xlsx");
  };

  /**
   * Add custom field
   */
  const handleAddField = async () => {
    if (!profile || !newFieldLabel.trim()) return;
    
    const id = newFieldLabel.toLowerCase().replace(/\s+/g, "_");
    
    if (customFields.some(f => f.id === id)) {
      alert("A field with this name already exists");
      return;
    }

    const newField: CustomField = {
      id,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired
    };

    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    
    // Save to Firestore
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updatedFields });
    
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
  };

  /**
   * Edit custom field
   */
  const handleEditField = async (fieldId: string) => {
    if (!profile || !editFieldLabel.trim()) return;
    
    const updatedFields = customFields.map(f => 
      f.id === fieldId ? { ...f, label: editFieldLabel.trim() } : f
    );
    setCustomFields(updatedFields);
    
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updatedFields });
    
    setEditingField(null);
    setEditFieldLabel("");
  };

  /**
   * Export devices as PDF
   */
  const exportPDF = () => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(18);
    pdf.text("Device Inventory", 14, 22);
    
    pdf.setFontSize(11);
    pdf.text(`Organization: ${profile?.orgId || ""}`, 14, 30);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
    
    const tableData = filteredDevices.map(d => [
      d.name,
      categories.find(c => c.id === d.categoryId)?.name || "—",
      d.location || "—",
      d.status
    ]);
    
    autoTable(pdf, {
      startY: 42,
      head: [['Name', 'Category', 'Location', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    pdf.save(`devices-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  /**
   * Print devices
   */
  const printDevices = () => {
    window.print();
  };

  /**
   * Remove custom field
   */
  const handleRemoveField = async (id: string) => {
    if (!profile) return;
    
    const updatedFields = customFields.filter(f => f.id !== id);
    setCustomFields(updatedFields);
    
    await setDoc(doc(db, "customFields", profile.orgId), { fields: updatedFields });
  };

  return (
    <div className="space-y-4 print:bg-white">
      {/* Progress bar for import */}
      {importing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">Importing devices...</span>
              <span className="text-sm font-bold text-primary-400">{importProgress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Devices</h1>
          <p className="text-xs text-slate-400">
            Search, filter and manage your devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, ID, location…"
            className="h-9 w-52 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DeviceStatus | "all")
            }
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked out</option>
            <option value="under_repair">Under repair</option>
            <option value="maintenance_required">Maintenance required</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </header>

      {/* manual add form */}
      <form
        onSubmit={handleAddManual}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-slate-100">
          Add device manually
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            required
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
            placeholder="Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
            value={newCategory || ""}
            onChange={(e) => setNewCategory(e.target.value || null)}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
            placeholder="Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as DeviceStatus)}
          >
            <option value="available">Available</option>
            <option value="checked_out">Checked out</option>
            <option value="under_repair">Under repair</option>
            <option value="maintenance_required">
              Maintenance required
            </option>
            <option value="retired">Retired</option>
          </select>
          
          {/* Custom Fields */}
          {customFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              {field.type === "date" ? (
                <input
                  type="date"
                  required={field.required}
                  className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
                  placeholder={field.label + (field.required ? " *" : "")}
                  value={customFieldValues[field.id] || ""}
                  onChange={(e) => setCustomFieldValues({...customFieldValues, [field.id]: e.target.value})}
                />
              ) : field.type === "number" ? (
                <input
                  type="number"
                  required={field.required}
                  className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
                  placeholder={field.label + (field.required ? " *" : "")}
                  value={customFieldValues[field.id] || ""}
                  onChange={(e) => setCustomFieldValues({...customFieldValues, [field.id]: e.target.value})}
                />
              ) : (
                <input
                  type="text"
                  required={field.required}
                  className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100"
                  placeholder={field.label + (field.required ? " *" : "")}
                  value={customFieldValues[field.id] || ""}
                  onChange={(e) => setCustomFieldValues({...customFieldValues, [field.id]: e.target.value})}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={addingDevice}
          className="h-9 rounded-md bg-primary-600 px-4 text-xs font-medium text-white shadow-md shadow-primary-600/40 hover:bg-primary-700 transition disabled:opacity-50"
        >
          {addingDevice ? "Adding..." : "Add device"}
        </button>
      </form>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            Bulk upload from Excel
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFieldsManager(!showFieldsManager)}
              className="h-8 rounded-md bg-slate-700 px-3 text-xs font-medium text-white hover:bg-slate-600 transition"
            >
              ⚙️ Manage Fields
            </button>
            <button
              onClick={downloadTemplate}
              className="h-8 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 transition"
            >
              📥 Download Template
            </button>
          </div>
        </div>
        
        {/* Custom Fields Manager */}
        {showFieldsManager && (
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200">Custom Fields</h3>
            
            {/* Add Field Form */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input
                type="text"
                placeholder="Field Name"
                className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
              />
              <select
                className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                />
                Required
              </label>
              <button
                onClick={handleAddField}
                className="h-8 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700 transition"
              >
                Add Field
              </button>
            </div>
            
            {/* Current Fields */}
            <div className="space-y-1">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1.5"
                >
                  {editingField === field.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        className="h-7 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
                        value={editFieldLabel}
                        onChange={(e) => setEditFieldLabel(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditField(field.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setEditFieldLabel("");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-slate-200">
                        <span className="font-medium">{field.label}</span>
                        <span className="text-slate-400 ml-2">
                          ({field.type}{field.required ? ", required" : ""})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingField(field.id);
                            setEditFieldLabel(field.label);
                          }}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveField(field.id)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {customFields.length === 0 && (
                <p className="text-xs text-slate-400">No custom fields yet. Add one above.</p>
              )}
            </div>
          </div>
        )}
        
        <p className="text-[11px] text-slate-400">
          Upload a .xlsx file with a <span className="font-semibold">Name</span> column.
          Optional columns: <span className="font-semibold">Internal Code</span>,{" "}
          <span className="font-semibold">Serial Number</span>,{" "}
          <span className="font-semibold">IMEI</span>,{" "}
          <span className="font-semibold">Location</span>,{" "}
          <span className="font-semibold">Status</span>, and <span className="font-semibold">Category</span> (name).
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 h-9 rounded-md border border-slate-700 bg-slate-900 px-4 text-xs text-slate-100 hover:bg-slate-800 transition disabled:opacity-50">
              {importing ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  Importing...
                </>
              ) : (
                <>
                  📁 Choose Excel File
                </>
              )}
            </span>
          </label>
        </div>
        {importSummary && (
          <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-md px-3 py-2">
            {importSummary}
          </p>
        )}
        {importErrors.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-amber-900 bg-amber-950/40 p-2 text-[11px] text-amber-200">
            {importErrors.map((e) => (
              <div key={`${e.row}-${e.message}`}>
                Row {e.row}: {e.message}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-between items-center pb-2">
        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
          className="text-xs text-rose-200 hover:underline disabled:opacity-50"
        >
          Delete selected ({selectedIds.size})
        </button>
        <button
          onClick={selectAll}
          className="text-xs text-slate-200 hover:underline"
        >
          Select all
        </button>
      </div>
      
      {loadingDevices ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 font-medium">
                <input
                  type="checkbox"
                  checked={
                    filteredDevices.length > 0 &&
                    selectedIds.size === filteredDevices.length
                  }
                  onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                />
              </th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d) => (
              <tr
                key={d.id}
                className="border-t border-slate-800 odd:bg-slate-950/40"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(d.id)}
                    onChange={() => toggleSelect(d.id)}
                  />
                </td>
                <td className="px-3 py-2 text-xs">{d.name}</td>
                <td className="px-3 py-2 text-xs">
                  {categories.find((c) => c.id === d.categoryId)?.name || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-[11px] text-slate-400">
                  {d.id}
                </td>
                <td className="px-3 py-2 text-xs">
                  {d.location || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  <select
                    className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] disabled:opacity-50"
                    value={d.status}
                    disabled={updatingStatus === d.id}
                    onChange={(e) =>
                      handleQuickStatusChange(
                        d.id,
                        e.target.value as DeviceStatus
                      )
                    }
                  >
                    <option value="available">Available</option>
                    <option value="checked_out">Checked out</option>
                    <option value="under_repair">Under repair</option>
                    <option value="maintenance_required">
                      Maintenance required
                    </option>
                    <option value="retired">Retired</option>
                  </select>
                  {updatingStatus === d.id && (
                    <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-[11px] space-x-1">
                  <Link
                    to={`/devices/${d.id}`}
                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 transition"
                  >
                    History
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingDevice === d.id}
                    className="rounded-md border border-rose-800 bg-rose-950/70 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-900 transition disabled:opacity-50"
                  >
                    {deletingDevice === d.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredDevices.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-400"
                >
                  No devices match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

