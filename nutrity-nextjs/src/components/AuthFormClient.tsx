"use client";
import { login, signup } from "@/actions/auth-actions";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthFormClient({ isRegister, error }: { isRegister: boolean, error?: string }) {
    const [orgId, setOrgId] = useState<string>("");

    useEffect(() => {
        const storedOrgId = localStorage.getItem("invitation_org_id");
        if (storedOrgId) {
            setOrgId(storedOrgId);
        }
    }, []);

    return (
        <form className="flex flex-col gap-5">
            <input type="hidden" name="organizationId" value={orgId} />
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
        </form>
    );
}
