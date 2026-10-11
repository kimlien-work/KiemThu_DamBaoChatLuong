"use client";

import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, loaded } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!loaded) return;
    if (!admin && !isLogin) router.replace("/admin/login");
    if (admin && isLogin) router.replace("/admin");
  }, [admin, loaded, isLogin, router]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Đang tải...</p>
      </div>
    );
  }

  if (isLogin) {
    return <>{children}</>;
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
