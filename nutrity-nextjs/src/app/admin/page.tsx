"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
    }
    checkAuth();
  }, [router, supabase]);

  if (!user) return <div className="p-8 text-center">Cargando perfil admin...</div>;

  return (
    <AdminPanel
      user={user}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.push("/");
      }}
      onBackToDashboard={() => router.push("/dashboard")}
    />
  );
}
