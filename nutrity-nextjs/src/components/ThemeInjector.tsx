"use client";

import { useEffect, useState } from "react";
import { getLandingConfig } from "@/actions/db-actions";

interface ThemeInjectorProps {
    plan?: string;
    role?: string;
    organizationId?: string;
}

export function ThemeInjector({ plan, role, organizationId }: ThemeInjectorProps) {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        if (organizationId) {
            getLandingConfig(organizationId).then(data => {
                if (data && data.primaryColor) {
                    setConfig(data);
                }
            }).catch(e => console.error(e));
        }
    }, [organizationId]);

    useEffect(() => {
        const root = document.documentElement;

        if (config && config.primaryColor) {
            // 🏢 Tema de la Clínica (SaaS)
            root.style.setProperty('--color-nutrity-primary', config.primaryColor);
            root.style.setProperty('--color-nutrity-accent', config.accentColor || config.primaryColor);
            root.style.setProperty('--color-nutrity-highlight', config.accentColor || config.primaryColor);
            root.style.setProperty('--color-nutrity-bg', 'hsl(0, 0%, 98%)');
        } else {
            // Determinar el nivel del usuario
            const isElite = plan === 'ELITE' || role === 'COACH';
            const isPremium = plan === 'PREMIUM' || plan === 'AVANZADO';
            const isBasic = plan === 'BASIC' || plan === 'BÁSICO';

            if (isElite) {
                // 🟡 Tema Dorado (ELITE / COACH)
                root.style.setProperty('--color-nutrity-primary', 'hsl(45, 90%, 10%)'); // Negro con matiz bronceado
                root.style.setProperty('--color-nutrity-accent', 'hsl(43, 90%, 55%)'); // Dorado puro
                root.style.setProperty('--color-nutrity-highlight', 'hsl(45, 100%, 75%)');
                root.style.setProperty('--color-nutrity-bg', 'hsl(45, 20%, 98%)');
            } else if (isPremium) {
                // ⚪ Tema Plateado (PREMIUM / AVANZADO)
                root.style.setProperty('--color-nutrity-primary', 'hsl(215, 15%, 15%)'); // Pizarra / Gris oscuro
                root.style.setProperty('--color-nutrity-accent', 'hsl(215, 10%, 65%)'); // Plata brillante
                root.style.setProperty('--color-nutrity-highlight', 'hsl(215, 20%, 90%)');
                root.style.setProperty('--color-nutrity-bg', 'hsl(215, 10%, 98%)');
            } else if (isBasic) {
                // 🔵 Tema Azul (BASIC)
                root.style.setProperty('--color-nutrity-primary', 'hsl(222, 80%, 15%)'); // Azul Navy Profundo
                root.style.setProperty('--color-nutrity-accent', 'hsl(210, 100%, 60%)'); // Azul Royal
                root.style.setProperty('--color-nutrity-highlight', 'hsl(200, 100%, 75%)');
                root.style.setProperty('--color-nutrity-bg', 'hsl(222, 20%, 98%)');
            } else {
                // 🟢 Tema Verde (FREE) - Default
                root.style.setProperty('--color-nutrity-primary', 'hsl(175, 100%, 18%)');
                root.style.setProperty('--color-nutrity-accent', 'hsl(76, 75%, 48%)');
                root.style.setProperty('--color-nutrity-highlight', 'hsl(64, 100%, 50%)');
                root.style.setProperty('--color-nutrity-bg', 'hsl(175, 30%, 98%)');
            }
        }

        // Cleanup function
        return () => {
            root.style.removeProperty('--color-nutrity-primary');
            root.style.removeProperty('--color-nutrity-accent');
            root.style.removeProperty('--color-nutrity-highlight');
            root.style.removeProperty('--color-nutrity-bg');
        };
    }, [plan, role, config]);

    return null; // Componente sin UI
}
