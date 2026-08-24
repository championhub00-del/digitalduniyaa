"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-10 sm:mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold uppercase tracking-wider mb-4">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">Contact Us</h1>
        <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto">
          Questions, partnerships, or feedback — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        {/* Info cards */}
        <div className="space-y-4">
          <InfoCard icon={<Mail className="size-5" />} label="Email" value="hello@digitalduniya.info" />
          <InfoCard icon={<MessageCircle className="size-5" />} label="WhatsApp" value="+92 316 4288921" />
          <InfoCard icon={<MapPin className="size-5" />} label="Location" value="Karachi, Pakistan 🇵🇰" />

          <div className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl p-6 text-white mt-6">
            <div className="text-2xl mb-3">💡</div>
            <h2 className="font-bold text-lg mb-2">Submit an Article</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Have expertise in Pakistani ecommerce, tech, health, or business? Write for DigitalDuniya and reach thousands of readers monthly.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[var(--border)] p-6 sm:p-7 shadow-sm space-y-4"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <CheckCircle className="size-16 text-green-500 mb-4" />
              <h3 className="font-bold text-xl text-[#0f172a] mb-2">Message Sent!</h3>
              <p className="text-slate-500 text-sm">Thanks! We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="contact-name" className="text-sm font-semibold text-[#0f172a] block mb-2">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
                  placeholder="Muhammad Ali"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-sm font-semibold text-[#0f172a] block mb-2">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-sm font-semibold text-[#0f172a] block mb-2">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
                  placeholder="Partnership / Article / Feedback"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-sm font-semibold text-[#0f172a] block mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none"
                  placeholder="Tell us about your query..."
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-sky-100"
              >
                <Send className="size-4" />
                {isPending ? "Sending..." : "Send Message"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="size-11 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">{label}</div>
        <div className="font-semibold text-[#0f172a]">{value}</div>
      </div>
    </div>
  );
}
