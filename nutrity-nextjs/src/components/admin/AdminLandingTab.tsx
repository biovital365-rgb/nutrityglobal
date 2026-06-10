"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Loader2, LayoutTemplate, Type, FileText, Image as ImageIcon, Play } from "lucide-react";
import { Base64ImageUpload } from "./shared";

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
    primaryColor: "#012a4a",
    accentColor: "#c19b6c",
    heroImage: "/landing-img-5.jpg",
    scienceImage: "/landing-img-1.jpg",
    missionImage: "/landing-img-3.jpg",
    habitsImage: "/landing-img-2.jpg",
    strategiesImage: "/landing-img-4.jpg",
    tiktokVideos: [
      { id: 1, title: "¿Por qué no bajas de peso?", img: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=400&q=80", link: "https://www.tiktok.com/@biovital.360/video/7599900359984827656" },
      { id: 2, title: "El secreto del Yacón", img: "https://images.unsplash.com/photo-1596422846543-74c6fc0e2418?w=400&q=80", link: "https://www.tiktok.com/@biovital.360/video/7600963485182250258" },
      { id: 3, title: "Sana tu intestino", img: "https://images.unsplash.com/photo-1505253713660-8d4088c18ce8?w=400&q=80", link: "https://www.tiktok.com/@biovital.360/video/7601559572465093906" },
      { id: 4, title: "Ansiedad y Glucosa", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", link: "https://www.tiktok.com/@biovital.360/video/7633199556792028423" }
    ]
  });

  useEffect(() => {
    if (initialConfig && Object.keys(initialConfig).length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        ...initialConfig,
        tiktokVideos: initialConfig.tiktokVideos || prev.tiktokVideos
      }));
    }
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (name: string, value: string) => {
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Color Principal (SaaS)
              </label>
              <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor || "#012a4a"}
                    onChange={handleChange}
                    className="w-12 h-12 rounded cursor-pointer border border-nutrity-border p-1"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor || "#012a4a"}
                    onChange={handleChange}
                    className="flex-1 bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 outline-none"
                    placeholder="Ej. #012a4a"
                  />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-nutrity-gray-text flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Color de Acento (SaaS)
              </label>
              <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="accentColor"
                    value={formData.accentColor || "#c19b6c"}
                    onChange={handleChange}
                    className="w-12 h-12 rounded cursor-pointer border border-nutrity-border p-1"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={formData.accentColor || "#c19b6c"}
                    onChange={handleChange}
                    className="flex-1 bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-nutrity-accent/20 outline-none"
                    placeholder="Ej. #c19b6c"
                  />
              </div>
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

          <div className="border-t border-nutrity-border pt-6 mt-6">
            <h4 className="text-lg font-bold text-nutrity-dark mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-nutrity-accent" />
              Imágenes de la Landing Page
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "heroImage", label: "Imagen Hero (Mujer en montaña)" },
                { name: "scienceImage", label: "Imagen Ciencia (Órganos flotando)" },
                { name: "missionImage", label: "Imagen Misión (Monitor PC)" },
                { name: "habitsImage", label: "Imagen Alimentación (Mujer estirando)" },
                { name: "strategiesImage", label: "Imagen Estrategias (Mujer en parque)" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Base64ImageUpload
                    label={field.label}
                    value={(formData as any)[field.name]}
                    onChange={(v) => handleImageChange(field.name, v)}
                    placeholder="Sube una foto o pega una URL..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-nutrity-border pt-6 mt-6">
            <h4 className="text-lg font-bold text-nutrity-dark mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-nutrity-accent" />
              Píldoras de Valor (TikTok)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.tiktokVideos?.map((video, idx) => (
                <div key={video.id} className="bg-nutrity-bg border border-nutrity-border rounded-2xl p-5 space-y-4 shadow-sm">
                  <span className="text-xs font-bold text-nutrity-accent uppercase tracking-widest block">Video {idx + 1}</span>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-nutrity-gray-text">Título del Video</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => {
                        const newVideos = [...formData.tiktokVideos];
                        newVideos[idx] = { ...newVideos[idx], title: e.target.value };
                        setFormData(prev => ({ ...prev, tiktokVideos: newVideos }));
                      }}
                      className="w-full bg-white border border-nutrity-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none"
                      placeholder="Ej. ¿Por qué no bajas de peso?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-nutrity-gray-text">Enlace de TikTok</label>
                    <input
                      type="text"
                      value={video.link}
                      onChange={(e) => {
                        const newVideos = [...formData.tiktokVideos];
                        newVideos[idx] = { ...newVideos[idx], link: e.target.value };
                        setFormData(prev => ({ ...prev, tiktokVideos: newVideos }));
                      }}
                      className="w-full bg-white border border-nutrity-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none"
                      placeholder="Ej. https://www.tiktok.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Base64ImageUpload
                      label="Imagen de Portada"
                      value={video.img}
                      onChange={(val) => {
                        const newVideos = [...formData.tiktokVideos];
                        newVideos[idx] = { ...newVideos[idx], img: val };
                        setFormData(prev => ({ ...prev, tiktokVideos: newVideos }));
                      }}
                      placeholder="Sube foto de portada o pega URL..."
                    />
                  </div>
                </div>
              ))}
            </div>
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

