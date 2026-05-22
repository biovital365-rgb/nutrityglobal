import { login, signup } from "@/actions/auth-actions";
import Link from "next/link";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string; mode?: string };
}) {
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

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#84cc16] focus:border-[#84cc16] outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#84cc16] focus:border-[#84cc16] outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
            {isRegister && (
              <p className="text-xs text-gray-500 mt-2 ml-1">Mínimo 6 caracteres</p>
            )}
          </div>

          <div className="mt-2">
            <button
              formAction={isRegister ? signup : login}
              className="w-full bg-[#84cc16] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#65a30d] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isRegister ? "Crear Mi Cuenta" : "Iniciar Sesión"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
            <Link 
              href={isRegister ? "/auth" : "/auth?mode=register"} 
              className="text-[#84cc16] font-bold hover:underline"
            >
              {isRegister ? "Inicia Sesión aquí" : "Regístrate gratis"}
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
