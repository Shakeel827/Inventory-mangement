import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function FeaturesPage() {
  const categories = [
    {
      title: "Inventory Management",
      icon: "📦",
      color: "from-blue-500 to-cyan-500",
      features: [
        { name: "Real-Time Device Tracking", desc: "Track every device and asset with live Firestore updates — changes reflect instantly across all users." },
        { name: "Custom Fields", desc: "Add unlimited custom fields (text, number, date) to match your exact inventory structure." },
        { name: "Category Management", desc: "Organize devices into categories with device counts and visual indicators." },
        { name: "Bulk Excel Import", desc: "Import hundreds of devices at once via Excel with real-time progress tracking (0–100%)." },
        { name: "Excel Template Download", desc: "Download a pre-formatted Excel template with all your custom fields included." },
        { name: "Device History", desc: "Full audit trail of every check-in, check-out, and status change per device." },
      ]
    },
    {
      title: "QR Code System",
      icon: "📱",
      color: "from-violet-500 to-purple-500",
      features: [
        { name: "QR Code Generation", desc: "Auto-generate unique QR codes for every device in your inventory." },
        { name: "Printable QR Stickers", desc: "Print professional QR sticker sheets for physical labeling of devices." },
        { name: "Mobile QR Scanner", desc: "Scan QR codes using any smartphone camera — no app download required." },
        { name: "Instant Check-In/Out", desc: "One scan to check a device in or out — updates Firestore in real time." },
        { name: "Scan History Logging", desc: "Every scan is logged with user ID, email, and timestamp for full accountability." },
      ]
    },
    {
      title: "Access Control",
      icon: "🔐",
      color: "from-emerald-500 to-teal-500",
      features: [
        { name: "Role-Based Access (RBAC)", desc: "Three roles: Admin (full access), Manager (device management), Scanner (QR only)." },
        { name: "Admin User Management", desc: "Admins can create, edit, and deactivate users directly from the dashboard." },
        { name: "Organization Isolation", desc: "Each organization's data is completely isolated — no cross-org data access." },
        { name: "Protected Routes", desc: "All dashboard routes are protected — unauthenticated users are redirected automatically." },
        { name: "Firestore Security Rules", desc: "Server-side rules enforce role-based access at the database level." },
      ]
    },
    {
      title: "Reports & Analytics",
      icon: "📊",
      color: "from-orange-500 to-amber-500",
      features: [
        { name: "Device Usage Report", desc: "Full log of all check-in/check-out activity with user and timestamp data." },
        { name: "User Activity Report", desc: "See how many check-ins and check-outs each user has performed." },
        { name: "Inventory Snapshot", desc: "Export current inventory status — all devices, locations, and statuses." },
        { name: "Dashboard Summary Report", desc: "High-level stats: total devices, by status, by category — all in one Excel file." },
        { name: "PDF Export", desc: "Export device lists as PDF for offline sharing and printing." },
        { name: "Print Support", desc: "Print any page directly from the browser with optimized print styles." },
      ]
    },
    {
      title: "Maintenance",
      icon: "🔧",
      color: "from-rose-500 to-pink-500",
      features: [
        { name: "Maintenance Tracking", desc: "Log maintenance events for devices with notes, dates, and status updates." },
        { name: "Status Management", desc: "Mark devices as Available, Checked Out, Under Repair, or Retired." },
        { name: "Optimistic UI Updates", desc: "Status changes reflect instantly in the UI — no waiting for server response." },
        { name: "Audit Logs", desc: "Complete audit trail of all system actions for compliance and accountability." },
      ]
    },
    {
      title: "AI Integration (Coming Soon)",
      icon: "🤖",
      color: "from-yellow-500 to-orange-500",
      features: [
        { name: "AI Inventory Insights", desc: "Get AI-powered recommendations on device utilization and maintenance schedules." },
        { name: "Predictive Maintenance", desc: "AI predicts when devices are likely to need maintenance based on usage patterns." },
        { name: "Smart Search", desc: "Natural language search — ask 'show me all laptops checked out this week'." },
        { name: "Anomaly Detection", desc: "AI flags unusual patterns like devices checked out for too long or missing items." },
        { name: "Auto-Categorization", desc: "AI suggests categories and fields when importing new devices." },
      ]
    },
  ];

  return (
    <>
      <Helmet>
        <title>Features — InventoryQ by GENPANDAX</title>
        <meta name="description" content="Explore all features of InventoryQ — QR scanning, real-time tracking, bulk import, reports, RBAC, and AI integration." />
      </Helmet>

      <div className="min-h-screen bg-[#050810] text-white">
        {/* Nav */}
        <nav className="border-b border-white/5 bg-[#050810]/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">IQ</div>
              <span className="font-bold">InventoryQ</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition">Pricing</Link>
              <Link to="/login" className="text-sm text-slate-400 hover:text-white transition">Sign In</Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15),transparent_70%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Everything you need to manage inventory
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Powerful Features,<br />
              <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">Simple to Use</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              From QR scanning to AI-powered insights — InventoryQ has everything your team needs to manage assets efficiently.
            </p>
          </motion.div>
        </section>

        {/* Feature Categories */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-20">
            {categories.map((cat, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.05 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-xl`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{cat.title}</h2>
                    <p className="text-slate-500 text-sm">{cat.features.length} features</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.features.map((f, fi) => (
                    <motion.div
                      key={fi}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.05 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${cat.color} mt-2 flex-shrink-0`} />
                        <div>
                          <h3 className="font-bold text-white mb-1">{f.name}</h3>
                          <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-3xl bg-gradient-to-br from-primary-600 to-violet-700 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative">
                <h2 className="text-3xl font-black mb-4">Ready to get started?</h2>
                <p className="text-white/80 mb-8">Start managing your inventory smarter today.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="px-8 py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-slate-100 transition">
                    Start Free →
                  </Link>
                  <Link to="/pricing" className="px-8 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                    View Pricing
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GENPANDAX — Next-Gen Solutions. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/pricing" className="hover:text-slate-400 transition">Pricing</Link>
            <Link to="/security" className="hover:text-slate-400 transition">Security</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
