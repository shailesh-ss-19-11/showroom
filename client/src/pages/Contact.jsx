import { SHOWROOM } from "../config/showroom";
import { useState } from "react";
import api from "../api/client";

const WHATSAPP_NUMBER = SHOWROOM.whatsappNumber;

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/enquiries", { ...form, source: "contact" });
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Get In Touch</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          Have a question about a bike, service, or finance? Reach out and our team will get back to you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Send us a message</h2>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <input
              required
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            />
            <input
              required
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            />
            <textarea
              placeholder="Your message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "sent" && <p className="text-sm text-green-600">Thanks! We'll get back to you shortly.</p>}
            {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Our Showrooms</h2>
            {SHOWROOM.branches.map((b) => (
              <div key={b.name} className="mt-3 rounded-xl border-l-4 border-brand bg-brand/5 p-3">
                <p className="text-sm font-bold text-brand">📍 {b.name}</p>
                <p className="text-sm font-medium text-ink">{b.address}</p>
              </div>
            ))}
            <p className="mt-3 text-sm font-bold text-ink">🕒 {SHOWROOM.hours}</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Call or WhatsApp</h2>
            <p className="mt-2 text-base font-bold text-brand">
              <a href={`tel:${SHOWROOM.phone.replace(/\s/g, "")}`}>{SHOWROOM.phone}</a>
            </p>
            <p className="mt-1 break-all text-sm font-bold text-ink">
              <a href={`mailto:${SHOWROOM.email}`}>{SHOWROOM.email}</a>
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-[#25D366] px-5 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Chat on WhatsApp
            </a>
          </div>

          {SHOWROOM.branches.map((b) => (
            <div key={b.name} className="aspect-video overflow-hidden rounded-2xl border border-black/5">
              <iframe
                title={`${b.name} showroom location`}
                className="h-full w-full"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(b.mapQuery)}&output=embed`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
