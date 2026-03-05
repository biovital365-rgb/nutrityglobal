import { motion } from "motion/react";
import { Check, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    recommended?: boolean;
    paypalUrl?: string;
    icon: any;
    color: string;
}

const plans: PricingPlan[] = [
    {
        id: "FREE",
        name: "Bio-Básico",
        price: "0",
        description: "Ideal para iniciar tu camino hacia la remisión metabólica.",
        features: [
            "Escáner de Alimentos (10/día)",
            "Seguimiento de Glucosa Básico",
            "Acceso a Lecciones Gratuitas",
            "IA Coach (Modo Limitado)"
        ],
        buttonText: "Tu Plan Actual",
        icon: Shield,
        color: "bg-nutrity-gray-text/10 text-nutrity-gray-text"
    },
    {
        id: "BIO_PRO",
        name: "Bio-Pro",
        price: "29",
        description: "Potencia tu restauración con bio-señalización avanzada.",
        features: [
            "Escáner de Alimentos Ilimitado",
            "Bio-Reportes Mensuales",
            "Academia Nutrity Completa",
            "IA Coach Pro (24/7)",
            "Recetas de Medicina de Restauración"
        ],
        buttonText: "Upgrade a Pro",
        recommended: true,
        paypalUrl: "https://www.paypal.com/ncp/payment/CMG445X32EL2S",
        icon: Zap,
        color: "bg-nutrity-accent/10 text-nutrity-accent"
    },
    {
        id: "ELITE",
        name: "Nutrity Elite",
        price: "99",
        description: "Acompañamiento VIP con IA y Clínica Integrativa.",
        features: [
            "Todo lo de Bio-Pro",
            "Citas Médicas Virtuales Prioritarias",
            "Análisis Genético y de Microbioma",
            "Dashboard Multi-tenant Avanzado",
            "Soporte Médico Especializado"
        ],
        buttonText: "Acceso Elite",
        paypalUrl: "https://www.paypal.com/ncp/payment/CMG445X32EL2S",
        icon: Sparkles,
        color: "bg-nutrity-primary/10 text-nutrity-primary"
    }
];

export const PricingTable = ({ currentPlan, onSelectPlan }: { currentPlan: string, onSelectPlan: (plan: PricingPlan) => void }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
            {plans.map((plan) => (
                <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    className={`nutrity-card relative overflow-hidden flex flex-col p-8 ${plan.recommended ? 'border-2 border-nutrity-accent shadow-2xl shadow-nutrity-accent/10' : ''}`}
                >
                    {plan.recommended && (
                        <div className="absolute top-0 right-0 bg-nutrity-accent text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                            Recomendado
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color}`}>
                            <plan.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <p className="text-[10px] font-bold text-nutrity-gray-text opacity-40 uppercase tracking-widest">{plan.id}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold font-display">${plan.price}</span>
                            <span className="text-nutrity-gray-text text-sm">/mes</span>
                        </div>
                        <p className="text-sm text-nutrity-gray-text mt-3 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1 bg-nutrity-success/10 p-0.5 rounded-full">
                                    <Check className="w-3 h-3 text-nutrity-success" />
                                </div>
                                <span className="text-sm text-nutrity-primary/80 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onSelectPlan(plan)}
                        disabled={currentPlan === plan.id}
                        className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${currentPlan === plan.id
                            ? 'bg-nutrity-bg text-nutrity-gray-text cursor-not-allowed opacity-50'
                            : 'bg-nutrity-primary text-white hover:bg-nutrity-accent shadow-lg shadow-nutrity-primary/20'
                            }`}
                    >
                        {currentPlan === plan.id ? "Tu Plan Actual" : plan.buttonText}
                        {currentPlan !== plan.id && <ArrowRight className="w-4 h-4" />}
                    </button>
                </motion.div>
            ))}
        </div>
    );
};
