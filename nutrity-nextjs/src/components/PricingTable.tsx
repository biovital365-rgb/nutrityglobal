'use client';

import React, { useState } from 'react';
import { motion } from "motion/react";
import { Check, Star, Crown, Zap, Shield, ArrowRight } from 'lucide-react';
import { createCheckoutSession, createCustomerPortal } from '@/actions/stripe-actions';

interface PricingTableProps {
  currentPlan?: string;
  userId: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({ currentPlan = 'FREE', userId }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planType: 'BASIC' | 'ADVANCED' | 'ELITE') => {
    setLoading(planType);
    const { url, error } = await createCheckoutSession(userId, planType);
    if (url) {
      window.location.href = url;
    } else {
      console.error(error);
      alert('Hubo un error al procesar la solicitud.');
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('PORTAL');
    const { url, error } = await createCustomerPortal(userId);
    if (url) {
      window.location.href = url;
    } else {
      console.error(error);
      alert('Hubo un error abriendo el portal de facturación.');
      setLoading(null);
    }
  };

  const plans = [
    {
      type: 'BASIC',
      name: 'Básico',
      price: '9.99',
      description: 'Inicia tu remisión con generación de menú asistida.',
      icon: Zap,
      color: 'bg-nutrity-success/10 text-nutrity-success',
      borderColor: 'border-nutrity-success/20',
      features: [
        '1 Menú Semanal IA al mes',
        'Descarga de Reporte PDF Estándar',
        'Tracker de Bioquímica básico'
      ],
    },
    {
      type: 'ADVANCED',
      name: 'Avanzado',
      price: '24.99',
      description: 'Potencia tu restauración con menús ilimitados.',
      popular: true,
      icon: Star,
      color: 'bg-nutrity-accent/10 text-nutrity-accent',
      borderColor: 'border-nutrity-accent',
      features: [
        'Menús semanales IA Ilimitados',
        'Reporte PDF Premium (Biodescodificación)',
        'Feedback loop (Solicitar Cambios)',
        'Acceso completo a Cursos y Recetario'
      ],
    },
    {
      type: 'ELITE',
      name: 'Elite (Coach)',
      price: '49.99',
      description: 'Plataforma administrativa para acompañamiento VIP.',
      icon: Crown,
      color: 'bg-purple-500/10 text-purple-500',
      borderColor: 'border-purple-500/20',
      features: [
        'Rol de COACH Administrativo',
        'Gestión de pacientes propios (Organización)',
        'Aprobación manual de menús',
        'Analytics metabólicos de pacientes'
      ],
    }
  ];

  return (
    <div className="w-full py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-nutrity-primary mb-3">Sube de Nivel tu Remisión</h2>
        <p className="text-nutrity-gray-text max-w-xl mx-auto">Desbloquea el poder completo de la IA y nuestra metodología clínica para acelerar tus resultados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.type;
          
          return (
            <motion.div 
              key={plan.type}
              whileHover={{ y: -5 }}
              className={`nutrity-card relative overflow-hidden flex flex-col p-8 ${plan.popular ? 'border-2 shadow-2xl shadow-nutrity-accent/10' : 'border'} ${plan.borderColor} transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-nutrity-accent text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                  Recomendado
                </div>
              )}
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color}`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-[10px] font-bold text-nutrity-gray-text opacity-40 uppercase tracking-widest">{plan.type}</p>
                  </div>
                </div>
                {isCurrentPlan && (
                  <span className="text-xs font-bold text-nutrity-primary bg-nutrity-bg py-1 px-2 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Activo
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display">${plan.price}</span>
                  <span className="text-nutrity-gray-text text-sm">/mes</span>
                </div>
                <p className="text-sm text-nutrity-gray-text mt-3 leading-relaxed">{plan.description}</p>
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-nutrity-success/10 p-0.5 rounded-full">
                      <Check className="w-3 h-3 text-nutrity-success" />
                    </div>
                    <span className="text-sm text-nutrity-primary/80 font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              {isCurrentPlan ? (
                <button 
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 bg-nutrity-bg text-nutrity-gray-text cursor-not-allowed opacity-50"
                >
                  Tu Plan Actual
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.type as any)}
                  disabled={loading !== null}
                  className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${
                    loading === plan.type ? 'bg-nutrity-bg text-nutrity-gray-text cursor-wait' : 'bg-nutrity-primary text-white hover:bg-nutrity-accent shadow-lg shadow-nutrity-primary/20'
                  }`}
                >
                  {loading === plan.type ? 'Procesando...' : 'Obtener Plan'}
                  {loading !== plan.type && <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {currentPlan !== 'FREE' && (
        <div className="mt-12 text-center">
          <button 
            onClick={handleManageBilling}
            disabled={loading === 'PORTAL'}
            className="text-sm font-medium text-nutrity-gray-text hover:text-nutrity-primary underline transition-colors"
          >
            {loading === 'PORTAL' ? 'Cargando portal...' : 'Administrar mi suscripción (Portal de Facturación)'}
          </button>
        </div>
      )}
    </div>
  );
};
