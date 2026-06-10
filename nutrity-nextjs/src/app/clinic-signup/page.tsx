"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { registerClinic } from "@/actions/db-actions";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createOrder, captureOrder } from "@/actions/paypal-actions";
import { Crown, Loader2, HeartPulse, Sparkles, Building } from "lucide-react";
import Link from "next/link";

export default function ClinicSignupPage() {
    const router = useRouter();
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

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: "USD",
        intent: "capture",
    };

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

            // 2. Register Clinic & Upgrade to COACH
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

    return (
        <div className="min-h-screen bg-[#fbf8f1] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans text-[#2d3748]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#012a4a] to-[#013a63] flex items-center justify-center shadow-lg shadow-[#012a4a]/20 mb-6">
                    <HeartPulse className="w-8 h-8 text-[#c19b6c]" />
                </div>
                <h2 className="text-center text-3xl font-display font-extrabold text-[#012a4a]">
                    BioVital B2B SaaS
                </h2>
                <p className="mt-2 text-center text-sm text-[#2d3748]/70 max-w-sm">
                    {step === 1 
                        ? "Registra tu Clínica o Práctica Privada y revoluciona la salud metabólica de tus pacientes."
                        : "Estás a un paso. Completa la suscripción Elite para activar tu panel B2B."}
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
                                <h3 className="text-xl font-bold font-display mb-1">Plan Elite (SaaS)</h3>
                                <p className="text-[#fbf8f1]/80 text-sm mb-4">Plataforma Multi-tenant B2B</p>
                                <div className="text-4xl font-black mb-4">$149.00 <span className="text-sm font-normal opacity-70">/ mes</span></div>
                                <ul className="text-left text-sm space-y-2 mb-2">
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> Tu propia Landing Page</li>
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> CRM y Gestión de Pacientes</li>
                                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c19b6c]" /> Menús IA Ilimitados</li>
                                </ul>
                            </div>

                            {isProcessing ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-10 h-10 text-[#c19b6c] animate-spin mx-auto mb-3" />
                                    <p className="text-sm font-bold text-[#2d3748]/70">Procesando pago...</p>
                                </div>
                            ) : (
                                <PayPalScriptProvider options={initialOptions}>
                                    <PayPalButtons 
                                        style={{ layout: "vertical", shape: "rect", color: "blue" }}
                                        createOrder={async () => {
                                            setError(null);
                                            const res = await createOrder(userId, "coach");
                                            if (res.success && res.orderId) return res.orderId;
                                            throw new Error(res.error || "Error al iniciar pago");
                                        }}
                                        onApprove={async (data) => {
                                            setIsProcessing(true);
                                            try {
                                                const res = await captureOrder(data.orderID, userId, "coach");
                                                if (res.success) {
                                                    router.push("/dashboard");
                                                } else {
                                                    setError("No se pudo completar el pago: " + res.error);
                                                }
                                            } catch (err) {
                                                setError("Hubo un error procesando tu pago.");
                                            } finally {
                                                setIsProcessing(false);
                                            }
                                        }}
                                        onError={(err) => {
                                            setError("Hubo un error en la ventana de pago de PayPal.");
                                        }}
                                    />
                                </PayPalScriptProvider>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
