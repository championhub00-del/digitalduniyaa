"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getSettingsAction, saveSettingsAction, checkAdminAction } from "@/lib/actions";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminPaymentsPage() {
  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankTitle, setBankTitle] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [, startT] = useTransition();

  useEffect(() => {
    checkAdminAction().then((res) => {
      if (res.isAdmin) {
        setAuthed(true);
        getSettingsAction().then((s) => {
          setJazzcashNumber(s.jazzcashNumber || "");
          setEasypaisaNumber(s.easypaisaNumber || "");
          setBankName(s.bankName || "");
          setBankAccount(s.bankAccount || "");
          setBankTitle(s.bankTitle || "");
          setWhatsappNumber(s.whatsappNumber || "");
          setLoading(false);
        });
      } else {
        window.location.href = "/admin";
      }
    });
  }, []);

  const save = () => {
    startT(async () => {
      await saveSettingsAction({ jazzcashNumber, easypaisaNumber, bankName, bankAccount, bankTitle, whatsappNumber });
      setToast("Payment settings saved!");
      setTimeout(() => setToast(""), 3000);
    });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="size-8 border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" /></div>;
  }

  if (!authed) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 rounded-lg border hover:bg-gray-50"><ArrowLeft className="size-4" /></Link>
        <h1 className="text-2xl font-bold">Payment Settings</h1>
      </div>

      <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
        <label className="block text-sm font-semibold">JazzCash Number<input value={jazzcashNumber} onChange={(e) => setJazzcashNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" placeholder="03xx..." /></label>
        <label className="block text-sm font-semibold">EasyPaisa Number<input value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" placeholder="03xx..." /></label>
        <label className="block text-sm font-semibold">Bank Name<input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" /></label>
        <label className="block text-sm font-semibold">Account Title<input value={bankTitle} onChange={(e) => setBankTitle(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" /></label>
        <label className="block text-sm font-semibold">Account Number<input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" /></label>
        <label className="block text-sm font-semibold">WhatsApp Number (with country code)<input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-sm" placeholder="923001234567" /></label>
        <button onClick={save} className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-bold flex items-center justify-center gap-2"><Save className="size-4" /> Save</button>
      </div>

      {toast && <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-xl text-sm">{toast}</div>}
    </div>
  );
}
