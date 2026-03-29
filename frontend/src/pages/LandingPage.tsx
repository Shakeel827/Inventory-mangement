import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return () => unsub();
  }, [scrollY]);

  // Auto-cycle features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3000);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: "📦", title: "Smart Inventory", desc: "Track all devices and assets in real-time with instant updates across your entire team.", color: "from-blue-500 to-cyan-500" },
    { icon: "📱", title: "QR Scanning", desc: "Scan QR codes with any mobile device for instant check-in and check-out.", color: "from-violet-500 to-purple-500" },
    { icon: "👥", title: "Role-Based Access", desc: "Admin, Manager, and Scanner roles with granular permissions for your team.", color: "from-emerald-500 to-teal-500" },
    { icon: "📊", title: "Advanced Reports", desc: "Generate detailed Excel reports on device usage, activity, and inventory snapshots.", color: "from-orange-500 to-amber-500" },
    { icon: "📤", title: "Bulk Import", desc: "Import hundreds of devices via Excel with real-time progress tracking.", color: "from-rose-500 to-pink-500" },
    { icon: "⚡", title: "Real-Time Sync", desc: "Firebase-powered real-time synchronization — changes appear instantly everywhere.", color: "from-yellow-500 to-orange-500" },
  ];

  const stats = [
    { value: "10K+", label: "Devices Tracked", icon: "📦" },
    { value: "500+", label: "Organizations", icon: "🏢" },
    { value: "99.9%", label: "Uptime", icon: "⚡" },
    { value: "24/7", label: "Support", icon: "🛡️" },
  ];

  const steps = [
    { step: "01", title: "Create Account", desc: "Register your organization in under 2 minutes." },
    { step: "02", title: "Add Devices", desc: "Import via Excel or add devices manually with custom fields." },
    { step: "03", title: "Print QR Codes", desc: "Generate and print QR stickers for each device." },
    { step: "04", title: "Start Tracking", desc: "Scan QR codes to check-in/out devices from anywhere." },
  ];

  return (
    <>
      <Helmet>
        <title>InventoryQ — Smart Asset & Device Management System</title>
        <meta name="description" content="Professional inventory management with QR scanning, real-time tracking, bulk import, and advanced reporting. Free to start." />
        <meta name="keywords" content="inventory management, asset tracking, QR code scanner, device management, equipment tracking" />
        <meta property="og:title" content="InventoryQ — Smart Asset Management" />
        <meta property="og:description" content="Track devices and assets with QR scanning and real-time updates." />
        <link rel="canonical" href="https://inventory-f8f66.web.app/" />
      </Helmet>

      <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">

        {/* ── NAV ── */}
        <motion.nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-[#050810]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-600/50">
                IQ
              </div>
              <span className="text-lg font-bold tracking-tight">
                Inventory<span className="text-primary-400">Q</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white shadow-lg shadow-primary-600/40 transition active:scale-95">
                Get Started Free
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[150px]" />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 max-w-5xl mx-auto px-4 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-8 backdrop-blur"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Now with real-time QR scanning
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            >
              Manage Every Asset
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
                With Precision
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Professional inventory management with QR scanning, real-time tracking,
              bulk operations, and powerful reporting — built for modern teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-base font-bold text-white shadow-2xl shadow-primary-600/40 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Start for Free
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-base font-semibold text-white backdrop-blur transition-all active:scale-95"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur"
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-slate-500">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-2 rounded-full bg-white/40" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-32 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                Everything your team needs
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                From QR scanning to advanced reporting — all in one platform.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 items-start">
              {/* Feature list */}
              <div className="space-y-3">
                {features.map((f, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setActiveFeature(i)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                      activeFeature === i
                        ? "bg-white/10 border-white/20 shadow-xl"
                        : "bg-white/3 border-white/5 hover:bg-white/6"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                        {f.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white">{f.title}</div>
                        <AnimatePresence>
                          {activeFeature === i && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm text-slate-400 mt-1"
                            >
                              {f.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Feature visual */}
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="sticky top-24 p-8 rounded-3xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 backdrop-blur-xl shadow-2xl"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center text-4xl mb-6 shadow-2xl`}>
                  {features[activeFeature].icon}
                </div>
                <h3 className="text-2xl font-black mb-3">{features[activeFeature].title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg">{features[activeFeature].desc}</p>
                <div className="mt-8 flex gap-2">
                  {features.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveFeature(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeFeature ? "w-8 bg-primary-400" : "w-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-32 px-4 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                Up and running in minutes
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all"
                >
                  <div className="text-5xl font-black text-white/10 mb-4">{s.step}</div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 text-white/20 text-xl">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-12 sm:p-16 rounded-3xl overflow-hidden text-center"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-violet-700" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black mb-4">
                  Ready to take control?
                </h2>
                <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                  Join hundreds of businesses managing their inventory smarter.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white hover:bg-slate-100 text-lg font-bold text-primary-700 shadow-2xl transition-all active:scale-95"
                >
                  Create Free Account →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">IQ</div>
                  <span className="font-bold text-white">InventoryQ</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Professional inventory management for modern businesses.
                </p>
                <div className="mt-4 text-xs text-slate-600">
                  <p>Support: <a href="mailto:support@pandascanpros.in" className="text-slate-400 hover:text-white transition">support@pandascanpros.in</a></p>
                  <p className="mt-1">Business: <a href="mailto:business@pandascanpros.in" className="text-slate-400 hover:text-white transition">business@pandascanpros.in</a></p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Product</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link to="/register" className="hover:text-white transition">Features</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Security</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Company</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link to="/register" className="hover:text-white transition">About</Link></li>
                  <li><a href="mailto:support@pandascanpros.in" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <p>&copy; 2026 InventoryQ by GAGenPandax AI Labs. All rights reserved.</p>
              <p>Powered by Firebase &amp; React</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
