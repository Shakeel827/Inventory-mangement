import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import toast from 'react-hot-toast';
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { ERROR_MESSAGES } from "../constants";

export function ReportsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Role-based access control
  if (profile?.role === "user") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-slate-400">Scanner users cannot access this page.</p>
      </div>
    );
  }

  const downloadDeviceUsageReport = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const activityQuery = query(
        collection(db, "deviceActivity"),
        where("orgId", "==", profile.orgId)
      );
      const activitySnap = await getDocs(activityQuery);
      
      const data = activitySnap.docs.map((doc) => {
        const d = doc.data();
        return {
          "Device ID": d.deviceId || "",
          "Action": d.action || "",
          "User Email": d.userEmail || "Unknown",
          "User ID": d.userId || "",
          "Timestamp": d.timestamp?.toDate?.()?.toLocaleString() || ""
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Device Activity");
      XLSX.writeFile(wb, `device-usage-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadUserActivityReport = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const activityQuery = query(
        collection(db, "deviceActivity"),
        where("orgId", "==", profile.orgId)
      );
      const activitySnap = await getDocs(activityQuery);
      
      const userActivity: Record<string, any> = {};
      
      activitySnap.docs.forEach((doc) => {
        const d = doc.data();
        const email = d.userEmail || "Unknown";
        if (!userActivity[email]) {
          userActivity[email] = {
            "User Email": email,
            "Check-outs": 0,
            "Check-ins": 0,
            "Total Actions": 0
          };
        }
        userActivity[email]["Total Actions"]++;
        if (d.action === "check_out") {
          userActivity[email]["Check-outs"]++;
        } else if (d.action === "check_in") {
          userActivity[email]["Check-ins"]++;
        }
      });

      const data = Object.values(userActivity);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "User Activity");
      XLSX.writeFile(wb, `user-activity-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadInventorySnapshot = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const devicesQuery = query(
        collection(db, "devices"),
        where("orgId", "==", profile.orgId)
      );
      const devicesSnap = await getDocs(devicesQuery);
      
      const data = devicesSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          "Device ID": doc.id,
          "Name": d.name || "",
          "Status": d.status || "",
          "Location": d.location || "",
          "Serial Number": d.serialNumber || "",
          "Model": d.model || "",
          "Category ID": d.categoryId || "",
          "Created At": d.createdAt?.toDate?.()?.toLocaleString() || ""
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, `inventory-snapshot-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download Excel template for bulk device import
   * Template includes all required columns with sample data
   */
  const downloadTemplate = () => {
    // Sample data to show format
    const templateData = [
      {
        "Name": "Example Laptop",
        "Serial Number": "SN123456",
        "Model": "Dell XPS 15",
        "Location": "Office Floor 2",
        "Status": "available",
        "Category": "Laptops"
      },
      {
        "Name": "Example Monitor",
        "Serial Number": "MON789",
        "Model": "Samsung 27\"",
        "Location": "Office Floor 1",
        "Status": "available",
        "Category": "Monitors"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Devices");
    
    // Add instructions sheet
    const instructions = [
      { "Column": "Name", "Description": "Device name (Required)", "Example": "Dell Laptop" },
      { "Column": "Serial Number", "Description": "Serial number (Optional)", "Example": "SN123456" },
      { "Column": "Model", "Description": "Device model (Optional)", "Example": "XPS 15" },
      { "Column": "Location", "Description": "Physical location (Optional)", "Example": "Office Floor 2" },
      { "Column": "Status", "Description": "available, checked_out, under_repair, maintenance_required, retired", "Example": "available" },
      { "Column": "Category", "Description": "Category name (must exist in system)", "Example": "Laptops" }
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
    
    XLSX.writeFile(wb, "device-import-template.xlsx");
  };

  /**
   * Download dashboard report with statistics
   * Includes device counts by status and category
   */
  const downloadDashboardReport = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const devicesQuery = query(
        collection(db, "devices"),
        where("orgId", "==", profile.orgId)
      );
      const devicesSnap = await getDocs(devicesQuery);
      
      const devices = devicesSnap.docs.map(doc => doc.data());
      
      // Calculate statistics
      const totalDevices = devices.length;
      const availableCount = devices.filter((d: any) => d.status === "available").length;
      const checkedOutCount = devices.filter((d: any) => d.status === "checked_out").length;
      const maintenanceCount = devices.filter((d: any) => d.status === "under_repair" || d.status === "maintenance_required").length;
      const retiredCount = devices.filter((d: any) => d.status === "retired").length;
      
      // Summary sheet
      const summaryData = [
        { "Metric": "Total Devices", "Count": totalDevices },
        { "Metric": "Available", "Count": availableCount },
        { "Metric": "Checked Out", "Count": checkedOutCount },
        { "Metric": "Under Maintenance", "Count": maintenanceCount },
        { "Metric": "Retired", "Count": retiredCount }
      ];
      
      // Devices by category
      const categoryCounts: Record<string, number> = {};
      devices.forEach((d: any) => {
        const cat = d.categoryId || "Uncategorized";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
        "Category": category,
        "Device Count": count
      }));
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
      
      const wsCategory = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, wsCategory, "By Category");
      
      XLSX.writeFile(wb, `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Dashboard report downloaded successfully");
    } catch (error) {
      console.error("Error generating dashboard report:", error);
      toast.error("Failed to generate dashboard report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-50">Reports</h1>
        <p className="text-xs text-slate-400">
          Export device usage, user activity, and inventory snapshots to Excel.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            📊 Dashboard Report
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Complete dashboard statistics and device summary.
          </p>
          <button 
            onClick={downloadDashboardReport}
            disabled={loading}
            className="mt-3 h-9 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Excel"}
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Device usage report
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            All check-in and check-out events per device.
          </p>
          <button 
            onClick={downloadDeviceUsageReport}
            disabled={loading}
            className="mt-3 h-9 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Excel"}
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            User activity report
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Asset operations grouped by user accounts.
          </p>
          <button 
            onClick={downloadUserActivityReport}
            disabled={loading}
            className="mt-3 h-9 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Excel"}
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Inventory snapshot
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Complete list of all devices with current status.
          </p>
          <button 
            onClick={downloadInventorySnapshot}
            disabled={loading}
            className="mt-3 h-9 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Excel"}
          </button>
        </div>
        <div className="rounded-xl border border-emerald-800 bg-emerald-900/20 p-4">
          <h2 className="text-sm font-semibold text-emerald-100">
            📥 Import Template
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Download Excel template for bulk device import.
          </p>
          <button 
            onClick={downloadTemplate}
            className="mt-3 h-9 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 transition"
          >
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
}

