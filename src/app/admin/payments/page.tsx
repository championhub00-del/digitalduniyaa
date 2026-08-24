"use client";

import { useEffect } from "react";

export default function AdminPaymentsPage() {
  useEffect(() => {
    window.location.href = "/admin?tab=payments";
  }, []);
  return null;
}
