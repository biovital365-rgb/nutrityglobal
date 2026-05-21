"use client";

import { NutrityLanding } from "@/components/NutrityLanding";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <NutrityLanding 
      onStart={() => router.push('/onboarding')} 
      onAuthClick={() => router.push('/auth')} 
    />
  );
}
