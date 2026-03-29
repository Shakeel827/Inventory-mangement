import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Account Information: When you register, we collect your name, email address, and organization name.",
        "Device & Asset Data: Information about devices and assets you add to the system, including names, serial numbers, locations, and custom fields.",
        "Usage Data: Activity logs including check-in/check-out events, timestamps, and user actions.",
        "Technical Data: IP address, browser type, device type, and usage analytics to improve our service.",
      ]
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To provide and maintain the InventoryQ service.",
        "To authenticate users and enforce role-based access control.",
        "To generate reports and analytics for your organization.",
        "To send important service notifications and updates.",
        "To improve our platform based on usage patterns.",
        "To comply with legal obligations.",
      ]
    },
    {
      title: "3. Data Storage & Security",
      content: [
        "All data is stored securely on Google Firebase (Firestore), which is SOC 2 Type II certified.",
        "Data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption.",
        "Access to your organization's data is restricted by Firestore security rules.",
        "We implement role-based access control to ensure users only access authorized data.",
        "Regular security audits are performed to identify and address vulnerabilities.",
      ]
    },
    {
      title: "4. Data Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "We may share data with service providers (Firebase/Google) solely to operate our service.",
        "We may disclose information if required by law or to protect our legal rights.",
        "Organization data is never shared between different organizations on our platform.",
      ]
    },
    {
      title: "5. Data Retention",
      content: [
        "Account data is retained for as long as your account is active.",
        "Activity logs are retained for 12 months by default.",
        "Upon account deletion, your data is permanently removed within 30 days.",
        "You may request data export or deletion at any time by contacting support.",
      ]
    },
    {
      title: "6. Your Rights",
      content: [
        "Access: You have the right to access all personal data we hold about you.",
        "Correction: You may request correction of inaccurate personal data.",
        "Deletion: You may request deletion of your personal data at any time.",
        "Portability: You may request an export of your data in a machine-readable format.",
        "Objection: You may object to certain processing of your personal data.",
      ]
    },
    {
      title: "7. Cookies",
      content: [
        "We use essential cookies for authentication and session management.",
        "We use analytics cookies to understand how users interact with our service.",
        "You may disable cookies in your browser settings, though this may affect functionality.",
        "We do not use advertising or tracking cookies.",
      ]
    },
    {
      title: "8. Children's Privacy",
      content: [
        "InventoryQ is not intended for use by individuals under the age of 16.",
        "We do not knowingly collect personal information from children under 16.",
        "If we become aware of such collection, we will delete the information immediately.",
      ]
    },
    {
      title: "9. Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time.",
        "We will notify you of significant changes via email or in-app notification.",
        "Continued use of the service after changes constitutes acceptance of the updated policy.",
        "The date of the last update is shown at the bottom of this page.",
      ]
    },
    {
      title: "10. Contact Us",
      content: [
        "For privacy-related questions or requests, contact us at:",
        "Email: support@pandascanpros.in",
        "Business: business@pandascanpros.in",
        "Company: GAGenPandax AI Labs",
        "We will respond to all privacy requests within 30 days.",
      ]
    },
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy — InventoryQ</title>
        <meta name="description" content="InventoryQ Privacy Policy — how we collect, use, and protect your data." />
      </Helmet>

      <div className="min-h-screen bg-[#050810] text-white">
        {/* Nav */}
        <nav className="border-b border-white/5 bg-[#050810]/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold">IQ</div>
              <span className="font-bold">InventoryQ</span>
            </Link>
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition">Sign In</Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-black mb-4">Privacy Policy</h1>
              <p className="text-slate-400 text-lg">Last updated: March 29, 2026</p>
              <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm">
                This Privacy Policy describes how GAGenPandax AI Labs ("we", "us", or "our") collects, uses, and protects your information when you use InventoryQ.
              </div>
            </div>

            <div className="space-y-10">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-white/3 border border-white/8"
                >
                  <h2 className="text-xl font-bold mb-4 text-white">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.content.map((item, j) => (
                      <li key={j} className="flex gap-3 text-slate-400 text-sm leading-relaxed">
                        <span className="text-primary-400 mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                Questions about this policy?{" "}
                <a href="mailto:support@pandascanpros.in" className="text-primary-400 hover:text-primary-300 transition">
                  Contact us at support@pandascanpros.in
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GAGenPandax AI Labs. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/terms" className="hover:text-slate-400 transition">Terms</Link>
            <Link to="/login" className="hover:text-slate-400 transition">Sign In</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
