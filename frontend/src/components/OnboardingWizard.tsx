/**
 * OnboardingWizard — shown to first-time users after registration.
 *
 * 4-step guided setup:
 *   1. Welcome
 *   2. Add first category
 *   3. Add first device
 *   4. Print QR sticker
 *
 * Completion state is stored in Firestore so it only shows once.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseClient";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  {
    icon: "🎉",
    title: "Welcome to InventoryQ!",
    desc: "Let's get your inventory set up in 3 quick steps. It takes less than 2 minutes.",
    action: "Let's Go →",
  },
  {
    icon: "🏷️",
    title: "Create a Category",
    desc: "Categories help you organise devices (e.g. Laptops, Monitors, Phones). Start by creating your first one.",
    action: "Go to Categories →",
    route: "/dashboard/categories",
  },
  {
    icon: "📦",
    title: "Add Your First Device",
    desc: "Add a device manually or import from Excel. Each device gets a unique QR code automatically.",
    action: "Go to Devices →",
    route: "/dashboard/devices",
  },
  {
    icon: "🖨️",
    title: "Print QR Stickers",
    desc: "Print QR stickers and attach them to your devices. Anyone can scan to check-in or check-out.",
    action: "Go to Stickers →",
    route: "/dashboard/stickers",
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: Props) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  /** Mark onboarding complete in Firestore and close */
  const finish = async () => {
    if (profile?.id) {
      await updateDoc(doc(db, "users", profile.id), { onboardingComplete: true }).catch(() => {});
    }
    onComplete();
  };

  const handleAction = () => {
    if (isLast) {
      finish();
      if (current.route) navigate(current.route);
    } else {
      if (current.route) navigate(current.route);
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-primary-500"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary-500" : "bg-slate-700"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-5xl mb-4">{current.icon}</div>
              <h2 className="text-2xl font-black text-white mb-3">{current.title}</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{current.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <button
              onClick={finish}
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              Skip setup
            </button>
            <button
              onClick={handleAction}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-bold text-white transition shadow-lg shadow-primary-600/30"
            >
              {current.action}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
