"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Loader2, LayoutTemplate, Type, FileText } from "lucide-react";

interface AdminLandingTabProps {
  isSaving: boolean;
  onSaveConfig: (config: any) => Promise<void>;
  initialConfig: any;
}

export function AdminLandingTab({ isSaving, onSaveConfig, initialConfig }: AdminLandingTabProps) {
  const [formData, setFormData] = useState({
    heroTitle: "REMISIÓN METABÓLICA",
    heroSubtitle: "De la Diabetes Tipo 2",
    heroDescription: "Recuperando tu salud metabólica con ciencia, no con dietas restrictivas.",
    ctaText: "Comenzar mi Transformación",
  });

  useEffect(() => {
    if (initialConfig && Object.keys(initialConfig).length > 0) {
      setFormData(prev => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveConfig(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div className="bg-white rounded-3xl p-8 border border-nutrity-border shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-nutrity-border">
          <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-nutrity-dark">
              CMS de la Landing Page
            </h3>
            <p className="text-sm text-nutrity-gray-text">
              Personaliza el contenido de alto impacto para la página de inicio.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
                <Type className="w-4 h-4" />
                Título Principal (Hero)
              </label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none transition-all"
                placeholder="Ej. REMISIÓN METABÓLICA"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
                <Type className="w-4 h-4" />
                Subtítulo Principal
              </label>
              <input
                type="text"
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none transition-all"
                placeholder="Ej. De la Diabetes Tipo 2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción (Pitch)
            </label>
            <textarea
              name="heroDescription"
              value={formData.heroDescription}
              onChange={handleChange}
              rows={3}
              className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none transition-all resize-none"
              placeholder="Ej. Recuperando tu salud metabólica con ciencia..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Texto del Botón de Acción (CTA)
            </label>
            <input
              type="text"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              className="w-full md:w-1/2 bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none transition-all"
              placeholder="Ej. Comenzar mi Transformación"
            />
          </div>

          <div className="pt-6 border-t border-nutrity-border flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-nutrity-primary text-white shadow-lg shadow-nutrity-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? "Guardando Cambios..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
