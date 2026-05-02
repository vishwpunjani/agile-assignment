"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminHeader() {
  const router = useRouter();
  const { isAdmin, logout } = useAdminAuth();

  if (isAdmin) {
    return (
      <div className="admin-header-controls">
        <span className="admin-badge">Admin</span>
        <button type="button" className="admin-logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="admin-header-controls">
      <button type="button" className="admin-login-btn" onClick={() => router.push("/login")}>
        Admin Login
      </button>
    </div>
  );
}
