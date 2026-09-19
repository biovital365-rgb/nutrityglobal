"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { registerClinic } from "@/actions/db-actions";
import { createCheckoutSession } from "@/actions/stripe-actions";
import { Crown, Loader2, Sparkles, Building } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { trackEvent } from "@/lib/analytics";

export default function ClinicSignupPage() {
    const supabase = createClient();
    
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        clinicName: ""
    });
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);
        
        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("No se pudo crear el usuario");

            const newUserId = authData.user.id;
            setUserId(newUserId);
            trackEvent("account_created", { source: "professional_signup" });

            // 2. Crear la organización; el rol COACH se activa solo tras confirmar el pago.
            const res = await registerClinic(newUserId, formData.clinicName, formData.name);
            if (!res.success) throw new Error(res.error || "Error al registrar la clínica");

            // Move to Payment Step
            setStep(2);
        } catch (err: any) {
            setError(err.message || "Error desconocido");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckout = async () => {
        if (!userId) return;
        setIsProcessing(true);
        setError(null);
        trackEvent("checkout_started", { plan: "ELITE", source: "professional_signup" });
        try {
            const result = await createCheckoutSession(userId, "ELITE");
            if (!result.url) throw new Error(result.error || "No se pudo iniciar el pago");
            window.location.assign(result.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fbf8f1] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans text-[#2d3748]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
                <BrandLogo className="mb-6 h-20 w-auto" priority />
                <h2 className="text-center text-3xl font-display font-extrabold text-[#012a4a]">
                    Nutrity Profesional
                </h2>
                <p className="mt-2 text-center text-sm text-[#2d3748]/70 max-w-sm">
                    {step === 1 
                        ? "Organiza tu práctica y el acompañamiento educativo de tus participantes."
                        : "Estás a un paso. Completa la suscripción Profesional para activar tu panel."}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#012a4a]/10">
                    
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleSignup}>
                            <div>
                                <label className="block text-sm font-bold text-[#2d3748] mb-2">Nombre de la Clínica / Consultorio</label>
                                <div className="relative">
                                    <Building className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2d3748]/40" />
                                    <input required type="text" value={formData.clinicName} onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                                        className="pl-10 w-full bg-[#fbf8f1] border border-[#012a4a]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c19b6c]/50 outline-none" 
                                        placeholder="Ej. Clínica Metabólica BioSana" />
                                </div>
                            </div>

                            <label className="flex items-start gap-3 text-xs leading-5 text-[#2d3748]/75">
                                <input required type="checkbox" className="mt-1" />
                                <span>Acepto el <Link href="/privacy" className="font-bold underline">Aviso de Privacidad</Link> y los <Link href="/terms" className="font-bold underline">Términos de Uso</Link>.</span>
                            </label>
                            
                            <div>
                                <label className="block text-sm font-bold text-[#2d3748] mb-2">Tu Nombre (Admin)</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#fbf8f1] border border-[#012a4a]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c19b6c]/50 outline-none" 
                                    placeholder="Dr. Juan Pérez" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#2d3748] mb-2">Correo Electrónico</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#fbf8f1] border border-[#012a4a]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c19b6c]/50 outline-none" 
                                    placeholder="clinica@ejemplo.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#2d3748] mb-2">Contraseña</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#fbf8f1] border border-[#012a4a]/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c19b6c]/50 outline-none" 
                                    placeholder="••••••••" />
                            </div>

                            <button type="submit" disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 bg-[#012a4a] text-white py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#012a4a]/20 disabled:opacity-70 disabled:hover:scale-100">
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar y Continuar"}
                            </button>
                            
                            <p className="text-center text-xs text-[#2d3748]/60 mt-4">
                                ¿Ya tienes cuenta? <Link href="/auth" className="font-bold text-[#c19b6c] hover:underline">Inicia sesión</Link>
                            </p>
                        </form>
                    )}

                    {step === 2 && userId && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-[#012a4a] rounded-2xl p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c19b6c]/20 rounded-full blur-3xl -mr-10 -mt-10" />
                                <Crown className="w-10 h-10 text-[#c19b6c] mx-auto mb-3" />
                                <h3 className="text-xl font-bold font-display mb-1">Nutrity Profesional</h3>
                                <p className="text-[#fbf8f1]/80 text-sm mb-4">Herramientas para organizaciones y coaches</p>
                                <div className="text-4xl font-black mb-4">$149.00 <span className="text-sm font-normal opacity-70">/ mes</span></div>
                                <ul className="text-left text-sm space-y-2 mb-2">
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> Tu propia Landing Page</li>
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> Gestión de participantes</li>
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> Planificación con IA sujeta a uso responsable</li>
                                </ul>
                            </div>

                            <button type="button" disabled={isProcessing} onClick={handleCheckout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17324d] px-5 py-4 font-bold text-white disabled:opacity-60">
                                {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Preparando pago...</> : "Continuar al pago seguro"}
                            </button>
                            <p className="text-center text-xs leading-5 text-[#2d3748]/65">Suscripción mensual en USD procesada por Stripe. Puedes cancelarla desde el portal de facturación.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
