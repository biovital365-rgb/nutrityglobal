import { motion } from "framer-motion";

export interface DashboardProfileTabProps {
    isProfileComplete: boolean;
    handleSaveProfile: (e: React.FormEvent) => void;
    isSavingProfile: boolean;
    profileForm: {
        name: string;
        email: string;
        phone: string;
        age: string;
        address: string;
        occupation: string;
        maritalStatus: string;
        socialMedia: string;
    };
    setProfileForm: React.Dispatch<React.SetStateAction<any>>;
}

export function DashboardProfileTab({
    isProfileComplete,
    handleSaveProfile,
    isSavingProfile,
    profileForm,
    setProfileForm
}: DashboardProfileTabProps) {
    return (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-1 mb-8">
                <h2 className="text-3xl font-display font-bold">Perfil del Paciente</h2>
                <p className="text-nutrity-gray-text text-sm">
                    {!isProfileComplete
                        ? "Por favor, completa todos tus datos personales obligatorios para continuar utilizando Nutrity Global."
                        : "Actualiza tus datos personales y de contacto aquí."}
                </p>
            </div>
            <div className="nutrity-card p-6 md:p-8">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Nombre Completo *</label>
                            <input type="text" required className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Correo Electrónico *</label>
                            <input type="email" required disabled className="w-full bg-gray-100 border border-nutrity-border rounded-xl px-4 py-3 font-medium opacity-70 cursor-not-allowed" value={profileForm.email} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Celular de Contacto *</label>
                            <input type="tel" required placeholder="+591 70000000" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Edad *</label>
                            <input type="number" required placeholder="Ej. 45" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Dirección Completa *</label>
                            <input type="text" required placeholder="Calle, Nro, Zona, Ciudad" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ocupación / Profesión *</label>
                            <input type="text" required placeholder="Ingeniera, Docente, etc." className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.occupation} onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Estado Civil *</label>
                            <select required className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.maritalStatus} onChange={e => setProfileForm({ ...profileForm, maritalStatus: e.target.value })}>
                                <option value="" disabled>Seleccionar estado</option>
                                <option value="soltero">Soltero/a</option>
                                <option value="casado">Casado/a</option>
                                <option value="divorciado">Divorciado/a</option>
                                <option value="viudo">Viudo/a</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Redes Sociales / IG o Facebook (Opcional)</label>
                            <input type="text" placeholder="@usuario o link de perfil" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.socialMedia} onChange={e => setProfileForm({ ...profileForm, socialMedia: e.target.value })} />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-nutrity-border flex justify-end">
                        <button disabled={isSavingProfile} type="submit" className="bg-nutrity-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                            {isSavingProfile ? "Guardando..." : "Guardar Perfil"}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
