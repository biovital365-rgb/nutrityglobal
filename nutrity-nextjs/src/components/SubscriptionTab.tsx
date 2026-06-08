"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { createOrder, captureOrder } from "@/actions/paypal-actions";

interface Props {
  user: any;
  onSuccess?: () => void;
}

export default function SubscriptionTab({ user, onSuccess }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "premium" | "coach" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  const plans = [
    {
      id: "free",
      name: "BioVital Free",
      price: "0.00",
      description: "Inicia tu camino hacia la remisión metabólica.",
      features: [
        "Acceso Básico a la Plataforma",
        "Perfil Metabólico Inicial",
        "Registro de mediciones manual"
      ],
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      color: "border-green-500",
      shadow: "shadow-green-500/20"
    },
    {
      id: "basic",
      name: "Básico",
      price: "9.99",
      description: "Inicia tu remisión con generación de menú asistida.",
      features: [
        "1 Menú Semanal IA al mes",
        "Descarga de Reporte PDF Estándar",
        "Tracker de Bioquímica básico"
      ],
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      color: "border-blue-500",
      shadow: "shadow-blue-500/20"
    },
    {
      id: "premium",
      name: "Premium (Avanzado)",
      price: "49.00",
      description: "Potencia tu restauración con menús ilimitados.",
      features: [
        "Menús semanales IA ilimitados",
        "Reporte PDF Premium (Biodescodificación)",
        "Feedback loop (Solicitar Cambios)",
        "Acceso completo a Cursos y Recetario"
      ],
      icon: <Sparkles className="w-6 h-6 text-slate-400" />,
      color: "border-slate-400",
      shadow: "shadow-slate-400/20"
    },
    {
      id: "coach",
      name: "Elite (Coach)",
      price: "149.00",
      description: "Para profesionales de la salud y coaches metabólicos.",
      features: [
        "Rol de COACH Administrativo",
        "Gestión de pacientes propios (Organización)",
        "Aprobación manual de menús",
        "Analytics metabólicos de pacientes"
      ],
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: "border-amber-500",
      shadow: "shadow-amber-500/20"
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-3xl font-display font-bold">Planes de Suscripción</h2>
        <p className="text-nutrity-gray-text text-sm max-w-lg mx-auto">
          Desbloquea todo el potencial de la remisión metabólica con acceso a herramientas avanzadas y seguimiento profesional.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`nutrity-card p-6 border-2 transition-all flex flex-col ${
              selectedPlan === plan.id 
                ? `${plan.color} shadow-xl ${plan.shadow} relative z-10 scale-[1.02]` 
                : 'border-transparent hover:border-nutrity-border hover:shadow-lg'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-nutrity-border">
                {plan.icon}
              </div>
              <div className="text-right">
                <span className="text-3xl font-black">${plan.price}</span>
                <span className="text-[10px] font-bold text-nutrity-gray-text uppercase block tracking-widest">/ único</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-nutrity-primary mb-2">{plan.name}</h3>
            <p className="text-sm text-nutrity-gray-text mb-6">{plan.description}</p>
            
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-nutrity-accent shrink-0" />
                  <span className="text-sm font-medium text-nutrity-primary leading-tight">{feature}</span>
                </li>
              ))}
            </ul>

            {(() => {
              const currentPlan = user?.profile?.plan?.toLowerCase() || 'free';
              const userRole = user?.profile?.role?.toLowerCase() || 'user';
              
              let mappedCurrentPlan = 'free';
              if (userRole === 'coach' || currentPlan === 'elite') mappedCurrentPlan = 'coach';
              else if (currentPlan === 'premium' || currentPlan === 'avanzado') mappedCurrentPlan = 'premium';
              else if (currentPlan === 'basic' || currentPlan === 'básico') mappedCurrentPlan = 'basic';

              const planLevels: Record<string, number> = {
                free: 0,
                basic: 1,
                premium: 2,
                coach: 3
              };

              const currentLevel = planLevels[mappedCurrentPlan] || 0;
              const cardLevel = planLevels[plan.id] || 0;

              if (mappedCurrentPlan === plan.id) {
                return (
                  <button
                    disabled={true}
                    className="w-full bg-slate-100 text-nutrity-gray-text py-3.5 rounded-xl font-bold transition-all border border-slate-200 cursor-not-allowed"
                  >
                    Tu Plan Actual
                  </button>
                );
              }

              if (cardLevel < currentLevel) {
                 return (
                  <button
                    disabled={true}
                    className="w-full bg-slate-100 text-nutrity-gray-text py-3.5 rounded-xl font-bold transition-all border border-slate-200 cursor-not-allowed opacity-50"
                  >
                    Incluido
                  </button>
                 );
              }

              return (
                <button
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-nutrity-primary text-white shadow-lg shadow-nutrity-primary/20'
                      : 'bg-nutrity-bg text-nutrity-primary hover:bg-nutrity-primary hover:text-white border border-nutrity-border'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Obtener Plan'}
                </button>
              );
            })()}
          </div>
        ))}
      </div>

      {selectedPlan && selectedPlan !== "free" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-nutrity-border/50 max-w-md mx-auto animate-fade-in">
          <h3 className="text-center font-bold text-lg mb-6">Completar Pago Seguro</h3>
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-nutrity-gray-text font-medium">Procesando actualización...</p>
            </div>
          ) : (
            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons 
                style={{ layout: "vertical", shape: "rect", color: "blue" }}
                createOrder={async () => {
                  setError(null);
                  const res = await createOrder(user?.id || user?.uid, selectedPlan);
                  if (res.success && res.orderId) {
                    return res.orderId;
                  } else {
                    setError(res.error || "No se pudo iniciar la transacción.");
                    throw new Error(res.error || "Order creation failed");
                  }
                }}
                onApprove={async (data, actions) => {
                  setIsProcessing(true);
                  setError(null);
                  try {
                    const res = await captureOrder(data.orderID, user?.id || user?.uid, selectedPlan);
                    if (res.success) {
                      alert("¡Pago exitoso! Tu cuenta ha sido actualizada.");
                      if (onSuccess) onSuccess();
                    } else {
                      setError("No se pudo completar el pago: " + res.error);
                    }
                  } catch (err) {
                    console.error("Capture Error", err);
                    setError("Hubo un error procesando tu pago.");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                onError={(err) => {
                  console.error("PayPal UI Error:", err);
                  setError("Hubo un error en la ventana de pago de PayPal.");
                }}
              />
            </PayPalScriptProvider>
          )}
        </div>
      )}
    </div>
  );
}
