import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      tagline: "Perfect for small teams",
      monthlyPrice: 0,
      annualPrice: 0,
      color: "from-slate-600 to-slate-700",
      badge: null,
      features: [
        "Up to 100 devices",
        "2 users (1 admin + 1 scanner)",
        "QR code scanning",
        "Basic reports (Excel export)",
        "Manual device entry",
        "Firebase free tier",
        "Email support",
        "Community access",
      ],
      limits: [
        "No bulk Excel import",
        "No custom fields",
        "No AI features",
        "No priority support",
      ],
      cta: "Start Free",
      ctaLink: "/register",
      highlight: false,
    },
    {
      name: "Professional",
      tagline: "For growing businesses",
      monthlyPrice: 499,
      annualPrice: 4999,
      color: "from-primary-500 to-violet-600",
      badge: "Most Popular",
      features: [
        "Up to 2,000 devices",
        "10 users (all roles)",
        "QR code scanning & stickers",
        "Bulk Excel import (real-time progress)",
        "Custom fields (unlimited)",
        "Advanced reports (PDF + Excel)",
        "Maintenance tracking",
        "Audit logs (12 months)",
        "Priority email support",
        "Firebase Blaze tier included",
        "Custom domain support",
        "Mobile responsive",
      ],
      limits: [],
      cta: "Get Started",
      ctaLink: "/register",
      highlight: true,
    },
    {
      name: "Business",
      tagline: "For large organizations",
      monthlyPrice: 999,
      annualPrice: 9999,
      color: "from-emerald-500 to-teal-600",
      badge: "Best Value",
      features: [
        "Unlimited devices",
        "Unlimited users",
        "Everything in Professional",
        "AI inventory insights",
        "Predictive maintenance alerts",
        "Smart search (natural language)",
        "Anomaly detection",
        "Auto-categorization",
        "Dedicated support manager",
        "SLA: 99.9% uptime guarantee",
        "Custom integrations",
        "White-label option",
        "Onboarding assistance",
        "Monthly review calls",
      ],
      limits: [],
      cta: "Contact Sales",
      ctaLink: "mailto:business@pandascanpros.in",
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: "How is pricing calculated?",
      a: "Pricing is based on the number of devices and users in your organization. Firebase infrastructure costs (reads/writes/storage) are included in the Professional and Business plans."
    },
    {
      q: "What happens if I exceed my device limit?",
      a: "You'll receive a notification when you're at 80% capacity. You can upgrade your plan at any time to increase your limit."
    },
    {
      q: "Is there a free trial for paid plans?",
      a: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely. You can cancel your subscription at any time. Your data will be retained for 30 days after cancellation."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept UPI, bank transfer, and major credit/debit cards. For enterprise billing, contact business@pandascanpros.in."
    },
    {
      q: "Do you offer discounts for NGOs or educational institutions?",
      a: "Yes! We offer up to 50% discount for verified NGOs and educational institutions. Contact us at support@pandascanpros.in."
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pricing — InventoryQ by GENPANDAX</title>
        <meta name="description" content="Simple, transparent pricing for InventoryQ. Plans from free to ₹999/month. No hidden fees." />
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
              <Link to="/features" className="text-sm text-slate-400 hover:text-white transition">Features</Link>
              <Link to="/login" className="text-sm text-slate-400 hover:text-white transition">Sign In</Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-12 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12),transparent_70%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              No hidden fees. No surprises. Plans designed around real Firebase infrastructure costs.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${!annual ? "bg-primary-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${annual ? "bg-primary-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Annual
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Plans */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 border transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-b from-primary-600/20 to-violet-600/10 border-primary-500/40 shadow-2xl shadow-primary-600/20 scale-105"
                    : "bg-white/4 border-white/10 hover:border-white/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${plan.color} text-white shadow-lg`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                  {i === 0 ? "🌱" : i === 1 ? "🚀" : "🏢"}
                </div>

                <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-4xl font-black text-white">Free</div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-slate-400">₹</span>
                        <span className="text-4xl font-black text-white">
                          {annual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                        </span>
                        <span className="text-slate-400 text-sm mb-1">/month</span>
                      </div>
                      {annual && (
                        <p className="text-xs text-emerald-400 mt-1">
                          ₹{plan.annualPrice.toLocaleString()}/year — save ₹{((plan.monthlyPrice * 12) - plan.annualPrice).toLocaleString()}
                        </p>
                      )}
                      {!annual && (
                        <p className="text-xs text-slate-500 mt-1">
                          or ₹{plan.annualPrice.toLocaleString()}/year (save 20%)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition mb-8 ${
                    plan.highlight
                      ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/40"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-2.5">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5 text-sm">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.limits.map((l, li) => (
                    <div key={li} className="flex items-start gap-2.5 text-sm">
                      <span className="text-slate-600 mt-0.5 flex-shrink-0">✗</span>
                      <span className="text-slate-600">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Max price note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-10 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <p className="text-emerald-300 font-semibold text-sm">
              💡 Our plans are designed to never exceed ₹999/month or ₹9,999/year — covering all Firebase infrastructure, AI features, and support.
            </p>
          </motion.div>
        </section>

        {/* Contact for Enterprise */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-white/4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div>
                <h3 className="text-2xl font-black mb-2">Need a custom plan?</h3>
                <p className="text-slate-400">Contact us for enterprise pricing, custom integrations, or volume discounts.</p>
                <div className="mt-4 space-y-1 text-sm text-slate-400">
                  <p>📧 <a href="mailto:business@pandascanpros.in" className="text-primary-400 hover:text-primary-300 transition">business@pandascanpros.in</a></p>
                  <p>📞 <a href="tel:+918074015276" className="text-primary-400 hover:text-primary-300 transition">+91 80740 15276</a></p>
                </div>
              </div>
              <a
                href="mailto:business@pandascanpros.in"
                className="flex-shrink-0 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition shadow-lg shadow-primary-600/30"
              >
                Contact Sales →
              </a>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black mb-3">Frequently Asked Questions</h2>
              <p className="text-slate-400">Everything you need to know about pricing.</p>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-white/4 border border-white/8"
                >
                  <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
          <p>&copy; 2026 GENPANDAX — Next-Gen Solutions. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-slate-400 transition">Home</Link>
            <Link to="/features" className="hover:text-slate-400 transition">Features</Link>
            <Link to="/security" className="hover:text-slate-400 transition">Security</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
