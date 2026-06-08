"use client";

import { NutrityLanding } from "@/components/NutrityLanding";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const user = res?.data?.user;
      if (user) {
        setUser(user);
      }
    });

    // Guardar invitation_org_id si viene en la URL (?ref=orgId)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      localStorage.setItem("invitation_org_id", ref);
    }
  }, []);

  return (
    <NutrityLanding 
      user={user}
      onStart={() => {
        if (user) router.push('/dashboard');
        else router.push('/onboarding');
      }} 
      onAuthClick={() => {
        if (user) router.push('/dashboard');
        else router.push('/auth');
      }} 
    />
  );
}
