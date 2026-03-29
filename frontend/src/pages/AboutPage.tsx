import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function AboutPage() {
  const values = [
    { icon: "⚡", title: "Speed First", desc: "We build systems that respond instantly. No lag, no waiting — just results." },
    { icon: "🔒", title: "Security by Design", desc: "Security isn't an afterthought. Every feature is built with data protection in mind." },
    { icon: "🤖", title: "AI-Powered", desc: "We integrate cutting-edge AI to make your business smarter and more efficient." },
    { icon: "🌍", title: "Built for Scale", desc: "From 10 devices to 100,000 — our systems grow with your business." },
    { icon: "💡", title: "Innovation", desc: "We constantly push boundaries to deliver next-generation solutions." },
    { icon: "🤝", title: "Partnership", desc: "We don't just build software — we become your long-term technology partner." },
  ];

  const services = [
    {
      icon: "🌐",
      title: "Smart Websites",
      desc: "We build high-performance, SEO-optimized websites that convert visitors into customers and grow your business 24/7.",
      tags: ["React", "Next.js", "SEO", "Performance"]
    },
    {
      icon: "📦",
      title: "Inventory Systems",
      desc: "Custom inventory management systems with QR scanning, real-time tracking, and AI-powered insights for any industry.",
      tags: ["Firebase", "QR Codes", "Real-Time", "AI"]
    },
    {
      icon: "🤖",
      title: "AI Integration",
      desc: "We integrate AI into your existing workflows — chatbots, predictive analytics, automation, and intelligent reporting.",
      tags: ["GPT-4", "Automation", "Analytics", "ML"]
    },
    {
      icon: "📱",
      title: "Mobile Apps",
      desc: "Cross-platform mobile applications for iOS and Android that work seamlessly with your web systems.",
      tags: ["React Native", "Capacitor", "iOS", "Android"]
    },
    {
      icon: "🔗",
      title: "Supply Chain Management",
      desc: "End-to-end supply chain visibility — track suppliers, purchase orders, stock levels, and delivery timelines in real time. Reduce costs, prevent stockouts, and optimize procurement with intelligent dashboards.",
      tags: ["Procurement", "Vendors", "Stock Control", "Real-Time"]
    },
    {
      icon: "🎙️",
      title: "AI Voice Agent & Automation",
      desc: "Deploy AI voice agents that handle customer queries, automate repetitive workflows, and detect anomalies in your operations. From voice-powered inventory updates to automated alerts and intelligent process detection — we make your business run itself.",
      tags: ["Voice AI", "Automation", "Anomaly Detection", "GPT-4o"]
    },
  ];

  const stats = [
    { value: "50+", label: "Projects Delivered" },
    { value: "30+", label: "Happy Clients" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <>
      <Helmet>
        <title>About — GENPANDAX Next-Gen Solutions</title>
        <meta name="description" content="GENPANDAX builds smart websites, inventory systems, and AI integrations that grow your business. Learn about our mission and services." />
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

        {/* Hero — Company Statement */}
        <section className="pt-24 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs font-black">GP</div>
                <span className="text-sm font-semibold text-slate-300">GENPANDAX — Next-Gen Solutions</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8"
            >
              We Build Smart
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-primary-400 bg-clip-text text-transparent">
                Websites That Run
              </span>
              <br />
              and Grow Your Business
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-3xl leading-relaxed mb-10"
            >
              Transform your business with cutting-edge websites and intelligent management systems that drive growth, efficiency, and success in the digital age.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="mailto:business@pandascanpros.in"
                className="px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-base font-bold text-white shadow-2xl shadow-primary-600/40 transition flex items-center gap-2"
              >
                Work With Us →
              </a>
              <a
                href="tel:+918074015276"
                className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-base font-semibold text-white transition flex items-center gap-2"
              >
                📞 +91 80740 15276
              </a>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About GENPANDAX */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">About Us</p>
                <h2 className="text-4xl font-black mb-6">
                  GENPANDAX<br />
                  <span className="text-slate-400 font-normal text-2xl">Next-Gen Solutions</span>
                </h2>
                <div className="space-y-4 text-slate-400 leading-relaxed">
                  <p>
                    GENPANDAX is a technology company specializing in building intelligent digital solutions for modern businesses. We combine cutting-edge web development with AI integration to create systems that don't just work — they grow your business.
                  </p>
                  <p>
                    InventoryQ is our flagship product — a professional inventory management system built for businesses that need real-time asset tracking, QR scanning, and powerful reporting without the complexity of enterprise software.
                  </p>
                  <p>
                    We believe technology should be accessible, affordable, and powerful. That's why we've designed InventoryQ to be simple enough for a small team but powerful enough for a large enterprise.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600/20 to-violet-600/10 border border-primary-500/20">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-bold text-white mb-2">Our Mission</h3>
                  <p className="text-slate-400 text-sm">To empower businesses with intelligent technology that drives real growth and operational efficiency.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/4 border border-white/8">
                  <div className="text-3xl mb-3">👁️</div>
                  <h3 className="font-bold text-white mb-2">Our Vision</h3>
                  <p className="text-slate-400 text-sm">A world where every business — regardless of size — has access to enterprise-grade technology at affordable prices.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-white/2 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">What We Do</p>
              <h2 className="text-4xl font-black mb-4">Our Services</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                From websites to AI systems — we build everything your business needs to thrive digitally.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-white/4 border border-white/8 hover:border-primary-500/30 transition-all"
                >
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((tag, ti) => (
                      <span key={ti} className="px-2.5 py-1 rounded-lg bg-white/8 text-xs text-slate-400 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-4">Our Values</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="p-5 rounded-2xl bg-white/4 border border-white/8 flex gap-4"
                >
                  <div className="text-3xl flex-shrink-0">{v.icon}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{v.title}</h3>
                    <p className="text-sm text-slate-400">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-12 rounded-3xl overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-violet-700" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative">
                <h2 className="text-4xl font-black mb-4">Let's Build Something Great</h2>
                <p className="text-white/80 text-lg mb-8">
                  Ready to transform your business? Get in touch with our team today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:business@pandascanpros.in"
                    className="px-8 py-4 rounded-xl bg-white text-primary-700 font-bold hover:bg-slate-100 transition"
                  >
                    📧 business@pandascanpros.in
                  </a>
                  <a
                    href="tel:+918074015276"
                    className="px-8 py-4 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
                  >
                    📞 +91 80740 15276
                  </a>
                </div>
                <p className="mt-6 text-white/60 text-sm">
                  Also reach us at: <a href="mailto:support@pandascanpros.in" className="underline hover:text-white transition">support@pandascanpros.in</a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GENPANDAX — Next-Gen Solutions. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/features" className="hover:text-slate-400 transition">Features</Link>
            <Link to="/pricing" className="hover:text-slate-400 transition">Pricing</Link>
            <Link to="/security" className="hover:text-slate-400 transition">Security</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
