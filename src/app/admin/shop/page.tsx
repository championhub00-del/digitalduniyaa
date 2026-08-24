"use client";

import { useEffect } from "react";

export default function AdminShopPage() {
  useEffect(() => {
    window.location.href = "/admin?tab=products";
  }, []);
  return null;
}
