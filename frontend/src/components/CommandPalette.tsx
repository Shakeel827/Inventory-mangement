/**
 * CommandPalette — ⌘K / Ctrl+K spotlight-style search.
 *
 * Lets users jump to any page or action instantly.
 * Keyboard-first: arrow keys to navigate, Enter to select, Esc to close.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // All available commands
  const commands: Command[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", action: () => navigate("/dashboard"), keywords: ["home", "overview"] },
    { id: "devices", label: "Devices", description: "Manage all devices", icon: "📦", action: () => navigate("/dashboard/devices"), keywords: ["inventory", "assets"] },
    { id: "categories", label: "Categories", icon: "🏷️", action: () => navigate("/dashboard/categories") },
    { id: "reports", label: "Reports", description: "Download Excel/PDF reports", icon: "📊", action: () => navigate("/dashboard/reports") },
    { id: "maintenance", label: "Maintenance", icon: "🔧", action: () => navigate("/dashboard/maintenance") },
    { id: "users", label: "Users", description: "Manage team members", icon: "👥", action: () => navigate("/dashboard/users") },
    { id: "audit", label: "Audit Logs", icon: "📋", action: () => navigate("/dashboard/audit") },
    { id: "stickers", label: "QR Stickers", description: "Print QR codes", icon: "🖨️", action: () => navigate("/dashboard/stickers") },
    { id: "scan", label: "Scan QR Code", icon: "📷", action: () => navigate("/scan"), keywords: ["camera", "barcode"] },
    { id: "ai", label: "AI Assistant", description: "Ask AI about your inventory", icon: "🤖", action: () => navigate("/dashboard/ai"), keywords: ["chat", "smart search"] },
  ];

  // Filter commands by query
  const filtered = query.trim()
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  // Reset selection when filter changes
  useEffect(() => { setSelected(0); }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = useCallback((cmd: Command) => {
    cmd.action();
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) execute(filtered[selected]);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, execute, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <span className="text-slate-400 text-lg">⌘</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, actions…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  aria-label="Search commands"
                />
                <kbd className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-6">No results for "{query}"</p>
                ) : (
                  filtered.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelected(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                        i === selected ? "bg-primary-600/20 text-white" : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-xl w-7 text-center">{cmd.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{cmd.label}</div>
                        {cmd.description && <div className="text-xs text-slate-500">{cmd.description}</div>}
                      </div>
                      {i === selected && (
                        <kbd className="ml-auto text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">↵</kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-800 flex gap-4 text-[10px] text-slate-600">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>ESC close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
