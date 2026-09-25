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
    const age = Number(profileForm.age);
    const isFormValid = Boolean(
        profileForm.name.trim() &&
        profileForm.email.trim() &&
        /^\+?[0-9\s()-]{7,20}$/.test(profileForm.phone.trim()) &&
        Number.isFinite(age) && age >= 1 && age <= 120 &&
        profileForm.address.trim() &&
        profileForm.occupation.trim() &&
        profileForm.maritalStatus
    );

    return (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-1 mb-8">
                <h2 className="text-3xl font-display font-bold">Mi perfil</h2>
                <p className="text-nutrity-gray-text text-sm">
                    {!isProfileComplete
                        ? "Por favor, completa todos tus datos personales obligatorios para continuar utilizando Nutrity Global."
                        : "Actualiza tus datos personales y de contacto aquí."}
                </p>
            </div>
            <div className="nutrity-card p-6 md:p-8">
                <form onSubmit={handleSaveProfile} className="space-y-6" aria-label="Datos del perfil">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="profile-name" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Nombre completo *</label>
                            <input id="profile-name" name="name" autoComplete="name" type="text" required maxLength={120} className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-email" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Correo electrónico *</label>
                            <input id="profile-email" name="email" autoComplete="email" type="email" required readOnly aria-readonly="true" className="w-full bg-gray-100 border border-nutrity-border rounded-xl px-4 py-3 font-medium opacity-70 cursor-not-allowed" value={profileForm.email} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-phone" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Celular de contacto *</label>
                            <input id="profile-phone" name="phone" autoComplete="tel" inputMode="tel" type="tel" required pattern="^\+?[0-9\s()\-]{7,20}$" title="Ingresa entre 7 y 20 caracteres usando números, espacios, paréntesis o guiones." placeholder="+591 70000000" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-age" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Edad *</label>
                            <input id="profile-age" name="age" autoComplete="bday-year" inputMode="numeric" type="number" min={1} max={120} required placeholder="Ej. 45" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="profile-address" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Dirección completa *</label>
                            <input id="profile-address" name="address" autoComplete="street-address" type="text" required maxLength={240} placeholder="Calle, Nro, Zona, Ciudad" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-occupation" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ocupación / profesión *</label>
                            <input id="profile-occupation" name="occupation" autoComplete="organization-title" type="text" required maxLength={120} placeholder="Ingeniera, docente, etc." className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.occupation} onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-marital-status" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Estado civil *</label>
                            <select id="profile-marital-status" name="maritalStatus" autoComplete="off" required className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.maritalStatus} onChange={e => setProfileForm({ ...profileForm, maritalStatus: e.target.value })}>
                                <option value="" disabled>Seleccionar estado</option>
                                <option value="soltero">Soltero/a</option>
                                <option value="casado">Casado/a</option>
                                <option value="divorciado">Divorciado/a</option>
                                <option value="viudo">Viudo/a</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="profile-social" className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Red social (opcional)</label>
                            <input id="profile-social" name="socialMedia" autoComplete="url" type="text" maxLength={240} placeholder="@usuario o enlace del perfil" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.socialMedia} onChange={e => setProfileForm({ ...profileForm, socialMedia: e.target.value })} />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-nutrity-border flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p id="profile-form-status" className={`text-xs leading-5 ${isFormValid ? "text-nutrity-success" : "text-nutrity-gray-text"}`} aria-live="polite">
                            {isFormValid ? "Los datos obligatorios están listos para guardar." : "Completa los campos obligatorios y registra un celular válido para continuar."}
                        </p>
                        <button disabled={isSavingProfile || !isFormValid} aria-describedby="profile-form-status" type="submit" className="bg-nutrity-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSavingProfile ? "Guardando..." : "Guardar Perfil"}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
