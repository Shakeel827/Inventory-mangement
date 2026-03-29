import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function SecurityPage() {
  const layers = [
    {
      icon: "🔐",
      title: "Firebase Authentication",
      color: "from-blue-500 to-cyan-500",
      points: [
        "Industry-standard email/password authentication via Firebase Auth.",
        "Passwords are hashed using bcrypt — we never store plaintext passwords.",
        "Minimum 8-character passwords enforced with uppercase, lowercase, and number requirements.",
        "Session tokens are short-lived JWTs signed by Google's infrastructure.",
        "Automatic session expiry and token refresh handled securely.",
        "Failed login attempts are rate-limited by Firebase to prevent brute-force attacks.",
      ]
    },
    {
      icon: "🛡️",
      title: "Firestore Security Rules",
      color: "from-violet-500 to-purple-500",
      points: [
        "All database access is governed by server-side Firestore Security Rules.",
        "Users can only read/write data belonging to their own organization (orgId isolation).",
        "Role-based rules: Admins can manage users; Managers can manage devices; Scanners can only check-in/out.",
        "No client-side code can bypass these rules — they are enforced at the database level by Google.",
        "Rules are version-controlled and deployed via Firebase CLI.",
        "Regular rule audits are performed to identify and close any gaps.",
      ]
    },
    {
      icon: "🔒",
      title: "Data Encryption",
      color: "from-emerald-500 to-teal-500",
      points: [
        "All data in transit is encrypted using TLS 1.3 (HTTPS enforced everywhere).",
        "All data at rest in Firestore is encrypted using AES-256 by Google Cloud.",
        "Firebase Storage (if used) encrypts files at rest and in transit.",
        "No sensitive data is stored in browser localStorage — only session tokens.",
        "API keys are scoped and restricted to specific Firebase services.",
      ]
    },
    {
      icon: "🏗️",
      title: "Infrastructure Security",
      color: "from-orange-500 to-amber-500",
      points: [
        "Hosted on Google Firebase — SOC 2 Type II, ISO 27001, and PCI DSS certified infrastructure.",
        "Global CDN via Vercel/Firebase Hosting with DDoS protection built-in.",
        "CORS is restricted to specific allowed origins — no wildcard access.",
        "Rate limiting on all API endpoints: 100 requests per 15 minutes per IP.",
        "HTTP security headers enforced: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection.",
        "Helmet.js middleware applied to all backend routes for security hardening.",
        "No backend server required for most operations — direct Firestore access reduces attack surface.",
      ]
    },
    {
      icon: "🔑",
      title: "Access Control (RBAC)",
      color: "from-rose-500 to-pink-500",
      points: [
        "Three-tier role system: Admin → Manager → Scanner with strict permission boundaries.",
        "Admins are the only role that can create, edit, or delete users.",
        "Scanner users can only access QR scanning and check-in/out — no device management.",
        "All protected routes require authentication — unauthenticated requests are rejected.",
        "Organization data is completely isolated — users from one org cannot access another's data.",
        "Role assignments are stored server-side in Firestore and cannot be modified by the client.",
      ]
    },
    {
      icon: "📋",
      title: "Audit & Compliance",
      color: "from-yellow-500 to-orange-500",
      points: [
        "Every check-in, check-out, and status change is logged with userId, userEmail, and timestamp.",
        "Audit logs are immutable — users cannot delete or modify activity records.",
        "Logs are retained for 12 months by default.",
        "Full audit trail available for compliance and accountability reviews.",
        "Admin can export audit logs as Excel for external compliance reporting.",
        "IP addresses and device types are logged for security monitoring.",
      ]
    },
    {
      icon: "🌐",
      title: "Application Security",
      color: "from-cyan-500 to-blue-500",
      points: [
        "React Error Boundaries prevent application crashes from exposing sensitive error details.",
        "File upload validation: only .xlsx/.xls files accepted, max 10MB, MIME type verified.",
        "Input sanitization on all form fields to prevent XSS attacks.",
        "No eval() or dangerouslySetInnerHTML used anywhere in the codebase.",
        "Dependencies are regularly audited with npm audit for known vulnerabilities.",
        "TypeScript enforces type safety, reducing runtime errors and injection risks.",
        "Content Security Policy (CSP) headers restrict resource loading to trusted sources.",
      ]
    },
    {
      icon: "🔄",
      title: "Operational Security",
      color: "from-slate-400 to-slate-600",
      points: [
        "All code changes go through version control (GitHub) before deployment.",
        "Production deployments are automated via Vercel CI/CD — no manual server access.",
        "Environment variables (API keys, secrets) are stored in Vercel's encrypted vault.",
        "Firebase API keys are restricted by domain and service in the Firebase Console.",
        "Regular security reviews and penetration testing performed quarterly.",
        "Incident response plan in place — critical issues addressed within 4 hours.",
      ]
    },
  ];

  const certifications = [
    { name: "Google Cloud", desc: "SOC 2 Type II", icon: "☁️" },
    { name: "Firebase", desc: "ISO 27001 Certified", icon: "🔥" },
    { name: "TLS 1.3", desc: "Data in Transit", icon: "🔒" },
    { name: "AES-256", desc: "Data at Rest", icon: "🛡️" },
    { name: "GDPR Ready", desc: "Data Privacy", icon: "🇪🇺" },
    { name: "HTTPS Only", desc: "All Connections", icon: "✅" },
  ];

  return (
    <>
      <Helmet>
        <title>Security — InventoryQ by GENPANDAX</title>
        <meta name="description" content="How InventoryQ protects your data — Firebase security, encryption, RBAC, audit logs, and infrastructure security." />
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise-grade security
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Your Data is
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Completely Safe</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              InventoryQ is built on Google Firebase — one of the most secure cloud platforms in the world. Here's exactly how we protect your data.
            </p>
          </motion.div>
        </section>

        {/* Certifications */}
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {certifications.map((cert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="text-2xl mb-2">{cert.icon}</div>
                  <div className="text-xs font-bold text-white">{cert.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{cert.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Layers */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-black mb-3">8 Layers of Security</h2>
              <p className="text-slate-400">Every layer is designed to protect your inventory data from unauthorized access.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {layers.map((layer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-6 rounded-2xl bg-white/4 border border-white/8 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {layer.icon}
                    </div>
                    <h3 className="text-lg font-black">{layer.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {layer.points.map((p, pi) => (
                      <li key={pi} className="flex gap-2.5 text-sm text-slate-400">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Report Vulnerability */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-white/4 border border-white/10 text-center"
            >
              <div className="text-4xl mb-4">🐛</div>
              <h3 className="text-2xl font-black mb-3">Found a Security Issue?</h3>
              <p className="text-slate-400 mb-6">
                We take security seriously. If you discover a vulnerability, please report it responsibly and we'll address it within 48 hours.
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>📧 <a href="mailto:support@pandascanpros.in" className="text-primary-400 hover:text-primary-300 transition">support@pandascanpros.in</a></p>
                <p>📞 <a href="tel:+918074015276" className="text-primary-400 hover:text-primary-300 transition">+91 80740 15276</a></p>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GENPANDAX — Next-Gen Solutions. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/pricing" className="hover:text-slate-400 transition">Pricing</Link>
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
