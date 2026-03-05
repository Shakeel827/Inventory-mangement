import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

/**
 * Landing Page Component
 * Beautiful, modern landing page with SEO optimization
 */
export function LandingPage() {
  const features = [
    {
      icon: "📦",
      title: "Smart Inventory Management",
      description: "Track all your devices, equipment, and assets in one centralized system with real-time updates."
    },
    {
      icon: "📱",
      title: "QR Code Scanning",
      description: "Scan QR codes with your mobile device for instant check-in and check-out of equipment."
    },
    {
      icon: "👥",
      title: "Role-Based Access",
      description: "Secure access control with admin, manager, and scanner roles for your team."
    },
    {
      icon: "📊",
      title: "Advanced Reports",
      description: "Generate detailed reports on device usage, user activity, and inventory snapshots."
    },
    {
      icon: "📤",
      title: "Bulk Import/Export",
      description: "Import hundreds of devices via Excel and export data for analysis and backup."
    },
    {
      icon: "🔔",
      title: "Real-Time Updates",
      description: "See changes instantly across all devices with Firebase real-time synchronization."
    }
  ];

  const stats = [
    { value: "10K+", label: "Devices Tracked" },
    { value: "500+", label: "Organizations" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Inventory Management System - Track Assets & Equipment Efficiently</title>
        <meta name="description" content="Professional inventory management system with QR code scanning, real-time tracking, bulk import/export, and advanced reporting. Perfect for businesses of all sizes." />
        <meta name="keywords" content="inventory management, asset tracking, QR code scanner, equipment management, device tracking, inventory software, warehouse management, stock control" />
        <meta name="author" content="Inventory Management System" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inventory-f8f66.web.app/" />
        <meta property="og:title" content="Inventory Management System - Track Assets Efficiently" />
        <meta property="og:description" content="Professional inventory management with QR scanning, real-time tracking, and advanced reporting." />
        <meta property="og:image" content="https://inventory-f8f66.web.app/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://inventory-f8f66.web.app/" />
        <meta property="twitter:title" content="Inventory Management System" />
        <meta property="twitter:description" content="Professional inventory management with QR scanning and real-time tracking." />
        <meta property="twitter:image" content="https://inventory-f8f66.web.app/og-image.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://inventory-f8f66.web.app/" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-600/40">
                  IQ
                </div>
                <span className="text-xl font-bold text-white">Inventory<span className="text-primary-400">Q</span></span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-600/40 transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Manage Your Inventory
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Professional inventory management system with QR code scanning, real-time tracking, 
                bulk operations, and powerful reporting. Perfect for businesses of all sizes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-lg font-semibold text-white shadow-2xl shadow-primary-600/50 transition transform hover:scale-105"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-slate-700 hover:border-slate-600 bg-slate-900/60 text-lg font-semibold text-white transition"
                >
                  Watch Demo
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/40">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Powerful features designed to streamline your inventory management workflow
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-primary-500/50 transition group"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-12 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-center shadow-2xl"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join thousands of businesses managing their inventory efficiently
              </p>
              <Link
                to="/register"
                className="inline-block px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-lg font-semibold text-primary-600 shadow-xl transition transform hover:scale-105"
              >
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                    IQ
                  </div>
                  <span className="text-lg font-bold text-white">InventoryQ</span>
                </div>
                <p className="text-sm text-slate-400">
                  Professional inventory management for modern businesses.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link to="/register" className="hover:text-white transition">Features</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Security</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link to="/register" className="hover:text-white transition">About</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Blog</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link to="/register" className="hover:text-white transition">Privacy</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Terms</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">License</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
              <p>&copy; 2026 InventoryQ. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
