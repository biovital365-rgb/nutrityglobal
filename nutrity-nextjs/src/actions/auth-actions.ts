"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

import { syncUserProfile } from "./db-actions";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/auth?error=" + error.message);
  }

  if (authData?.user) {
      await syncUserProfile({
          uid: authData.user.id,
          email: authData.user.email,
      });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  if (formData.get("privacyAccepted") !== "yes") {
    redirect("/auth?mode=register&error=" + encodeURIComponent("Debes aceptar el Aviso de Privacidad y los Términos de Uso."));
  }
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        privacy_consent_version: "1.0",
        privacy_consent_at: new Date().toISOString(),
      },
    },
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/auth?error=" + error.message);
  }

  if (authData?.user) {
      await syncUserProfile({
          uid: authData.user.id,
          email: authData.user.email,
      });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
