import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing or using InventoryQ, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, you may not use the service.",
        "These terms apply to all users, including administrators, managers, and scanners.",
      ]
    },
    {
      title: "2. Description of Service",
      content: [
        "InventoryQ is a cloud-based inventory management platform for tracking devices and assets.",
        "Features include QR code scanning, bulk import/export, reporting, and role-based access control.",
        "The service is provided 'as is' and may be updated or modified at any time.",
      ]
    },
    {
      title: "3. Account Registration",
      content: [
        "You must provide accurate and complete information when creating an account.",
        "You are responsible for maintaining the security of your account credentials.",
        "You must notify us immediately of any unauthorized access to your account.",
        "One organization account may have multiple users with different roles.",
      ]
    },
    {
      title: "4. Acceptable Use",
      content: [
        "You may only use InventoryQ for lawful business purposes.",
        "You may not use the service to store illegal, harmful, or offensive content.",
        "You may not attempt to reverse engineer, hack, or disrupt the service.",
        "You may not share your account credentials with unauthorized individuals.",
        "You may not use the service to infringe on intellectual property rights.",
      ]
    },
    {
      title: "5. Data Ownership",
      content: [
        "You retain full ownership of all data you input into InventoryQ.",
        "By using the service, you grant us a limited license to process your data to provide the service.",
        "We do not claim ownership of your inventory data, device records, or organizational information.",
        "You may export or delete your data at any time.",
      ]
    },
    {
      title: "6. Service Availability",
      content: [
        "We strive for 99.9% uptime but do not guarantee uninterrupted service.",
        "Scheduled maintenance will be communicated in advance when possible.",
        "We are not liable for losses resulting from service downtime or interruptions.",
      ]
    },
    {
      title: "7. Limitation of Liability",
      content: [
        "InventoryQ is provided 'as is' without warranties of any kind.",
        "We are not liable for any indirect, incidental, or consequential damages.",
        "Our total liability shall not exceed the amount paid for the service in the past 12 months.",
        "We are not responsible for data loss due to user error or third-party failures.",
      ]
    },
    {
      title: "8. Termination",
      content: [
        "You may terminate your account at any time by contacting support.",
        "We may suspend or terminate accounts that violate these terms.",
        "Upon termination, your data will be retained for 30 days before permanent deletion.",
        "Termination does not relieve you of obligations incurred prior to termination.",
      ]
    },
    {
      title: "9. Changes to Terms",
      content: [
        "We may update these Terms of Service at any time.",
        "Significant changes will be communicated via email or in-app notification.",
        "Continued use of the service after changes constitutes acceptance.",
      ]
    },
    {
      title: "10. Contact",
      content: [
        "For questions about these terms, contact us at:",
        "Email: support@pandascanpros.in",
        "Business: business@pandascanpros.in",
        "Company: GAGenPandax AI Labs",
      ]
    },
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service — InventoryQ</title>
        <meta name="description" content="InventoryQ Terms of Service — rules and guidelines for using our platform." />
      </Helmet>

      <div className="min-h-screen bg-[#050810] text-white">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-black mb-4">Terms of Service</h1>
              <p className="text-slate-400 text-lg">Last updated: March 29, 2026</p>
              <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm">
                Please read these Terms of Service carefully before using InventoryQ by GAGenPandax AI Labs.
              </div>
            </div>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-white/3 border border-white/8"
                >
                  <h2 className="text-xl font-bold mb-4">{section.title}</h2>
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
                Questions?{" "}
                <a href="mailto:support@pandascanpros.in" className="text-primary-400 hover:text-primary-300 transition">
                  support@pandascanpros.in
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GAGenPandax AI Labs. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy</Link>
            <Link to="/login" className="hover:text-slate-400 transition">Sign In</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
