"use client";

import { useEffect } from "react";

interface ThemeInjectorProps {
    plan?: string;
    role?: string;
    organizationId?: string;
}

export function ThemeInjector({ plan: _plan, role: _role, organizationId: _organizationId }: ThemeInjectorProps) {
    useEffect(() => {
        const root = document.documentElement;

        // La identidad de producto no cambia por rol o plan. Los niveles se comunican
        // con etiquetas y estados, sin convertir cada cuenta en una marca diferente.
        root.style.setProperty('--color-nutrity-primary', '#17324d');
        root.style.setProperty('--color-nutrity-accent', '#3a6447');
        root.style.setProperty('--color-nutrity-highlight', '#ffcc00');
        root.style.setProperty('--color-nutrity-route-blue', '#2f6fed');
        root.style.setProperty('--color-nutrity-bg', '#fbf8f1');

        // Cleanup function
        return () => {
            root.style.removeProperty('--color-nutrity-primary');
            root.style.removeProperty('--color-nutrity-accent');
            root.style.removeProperty('--color-nutrity-highlight');
            root.style.removeProperty('--color-nutrity-bg');
        };
    }, []);

    return null; // Componente sin UI
}
