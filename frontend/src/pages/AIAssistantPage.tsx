/**
 * AIAssistantPage — natural-language inventory queries powered by OpenAI.
 *
 * Features:
 *  - Smart search: "show me all laptops checked out this week"
 *  - Anomaly detection
 *  - User-supplied API key fallback when default credits run out
 *  - Conversation history (last 10 messages)
 *
 * Model: gpt-4o-mini (cheapest, fast, sufficient for inventory queries)
 * Cost: ~$0.00015 per 1K input tokens
 */

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";
import { askInventoryAI, detectAnomalies } from "../utils/aiService";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

const SUGGESTIONS = [
  "How many devices are currently checked out?",
  "Which devices have been checked out the longest?",
  "Show me a summary of all categories",
  "Are there any devices that need maintenance?",
  "What is the total inventory count?",
];

export function AIAssistantPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userKey, setUserKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inventoryContext, setInventoryContext] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Build inventory context string for AI
  useEffect(() => {
    if (!profile) return;
    const buildContext = async () => {
      try {
        const devSnap = await getDocs(query(collection(db, "devices"), where("orgId", "==", profile.orgId)));
        const catSnap = await getDocs(query(collection(db, "categories"), where("orgId", "==", profile.orgId)));
        const actSnap = await getDocs(query(collection(db, "deviceActivity"), where("orgId", "==", profile.orgId)));

        const devices = devSnap.docs.map((d) => d.data());
        const categories = catSnap.docs.map((d) => d.data());
        const activity = actSnap.docs.map((d) => d.data()).slice(-100); // last 100 events

        const statusCounts = devices.reduce((acc: Record<string, number>, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {});

        setInventoryContext(JSON.stringify({
          totalDevices: devices.length,
          statusBreakdown: statusCounts,
          categories: categories.map((c) => c.name),
          recentActivity: activity.map((a) => ({
            action: a.action,
            deviceId: a.deviceId,
            userEmail: a.userEmail,
            timestamp: a.timestamp?.toDate?.()?.toISOString(),
          })),
        }, null, 2));
      } catch {
        // Context build failure is non-fatal
      }
    };
    buildContext();
  }, [profile]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const result = await askInventoryAI(text, inventoryContext, userKey || null);

    if (result.error) {
      setMessages((prev) => [...prev, { role: "assistant", content: result.error!, error: true }]);
      if (result.error.includes("credits exhausted")) setShowKeyInput(true);
    } else {
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    }
    setLoading(false);
  };

  const runAnomalyDetection = async () => {
    if (!inventoryContext) { toast.error("Loading inventory data…"); return; }
    setLoading(true);
    const result = await detectAnomalies(inventoryContext, userKey || null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "🔍 Run anomaly detection on my inventory" },
      { role: "assistant", content: result },
    ]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            🤖 AI Assistant
            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">gpt-4o-mini</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Ask anything about your inventory in plain English</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAnomalyDetection}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition"
          >
            🔍 Detect Anomalies
          </button>
          <button
            onClick={() => setShowKeyInput((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700 transition"
          >
            🔑 API Key
          </button>
        </div>
      </div>

      {/* API Key input (shown when credits run out) */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <p className="text-xs text-amber-300 mb-2 font-medium">
              Default AI credits exhausted. Enter your OpenAI API key to continue.
              <br />
              <span className="text-amber-400/70">Or contact <a href="mailto:support@pandascanpros.in" className="underline">support@pandascanpros.in</a> to top up.</span>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 h-8 rounded-lg bg-slate-900 border border-slate-700 px-3 text-xs text-white outline-none focus:border-primary-500"
              />
              <button
                onClick={() => { setShowKeyInput(false); toast.success("API key saved for this session"); }}
                className="px-3 h-8 rounded-lg bg-primary-600 text-xs text-white font-medium"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-slate-400 mb-6">Ask me anything about your inventory</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : msg.error
                  ? "bg-rose-950/60 border border-rose-900/60 text-rose-300 rounded-bl-sm"
                  : "bg-slate-800 text-slate-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your inventory…"
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-slate-800 border border-slate-700 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-11 px-5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-sm font-semibold text-white transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
