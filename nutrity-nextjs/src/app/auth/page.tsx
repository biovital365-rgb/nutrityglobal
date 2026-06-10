import { login, signup } from "@/actions/auth-actions";
import Link from "next/link";
import { AuthFormClient } from "@/components/AuthFormClient";

export default async function AuthPage(props: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const isRegister = searchParams.mode === "register";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-gray-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isRegister ? "Crea tu Cuenta" : "Bienvenido de nuevo"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isRegister 
              ? "Guarda tu Bio-Plan y accede a tu panel personalizado." 
              : "Inicia sesión para ver tu progreso y tu Bio-Plan."}
          </p>
        </div>
        
        {searchParams?.error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{searchParams.error === "Invalid login credentials" ? "Correo o contraseña incorrectos." : searchParams.error}</span>
          </div>
        )}

        <AuthFormClient isRegister={isRegister} error={searchParams.error} />
      </div>
    </div>
  );
}
