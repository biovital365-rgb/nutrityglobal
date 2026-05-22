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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
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
