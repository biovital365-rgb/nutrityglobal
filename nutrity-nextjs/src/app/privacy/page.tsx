import Link from "next/link";

const sections = [
  ["Datos que tratamos", "Datos de cuenta y contacto; respuestas de evaluación; información de hábitos y valores de salud que decides registrar; actividad dentro del producto; y datos de pago administrados por el proveedor de cobro. Nutrity Global no necesita ni almacena el número completo de tu tarjeta."],
  ["Finalidades", "Crear y proteger tu cuenta, ofrecer orientación educativa personalizada, guardar tu progreso, prestar soporte, gestionar suscripciones, mejorar el servicio y cumplir obligaciones de seguridad y legales."],
  ["Métricas opcionales", "Si aceptas las métricas, registramos eventos de navegación como visita, inicio y finalización del onboarding, consulta de planes, inicio de pago y avance en Academia. No incluimos síntomas, mediciones, respuestas de salud, nombre ni correo en estos eventos. Puedes elegir Solo esenciales y seguir utilizando el servicio."],
  ["Proveedores", "Usamos proveedores tecnológicos para autenticación y datos (Supabase), infraestructura, generación de texto educativo (Google Gemini cuando corresponda), correo (Resend) y pagos (Stripe o PayPal). Solo enviamos la información necesaria para cada función."],
  ["Datos sensibles e inteligencia artificial", "Las respuestas sobre salud pueden ser datos sensibles. Antes de usar una función con IA solicitamos tu consentimiento. La IA no debe diagnosticar, predecir una remisión ni recomendar cambios de medicación. Evita incluir información que no sea necesaria."],
  ["Conservación", "Conservamos la cuenta y su historial mientras el servicio esté activo o durante el periodo necesario para prestar el servicio y atender obligaciones aplicables. Los datos que ya no sean necesarios se eliminan o anonimizan."],
  ["Tus decisiones", "Puedes solicitar acceso, corrección, exportación o eliminación de tus datos y retirar consentimientos opcionales. La retirada no afecta tratamientos ya realizados legítimamente, pero puede impedir funciones que necesitan esos datos."],
  ["Seguridad e incidentes", "Aplicamos controles de acceso, separación por organización y registro de operaciones. Ningún sistema es infalible; si ocurre un incidente que afecte tus datos, actuaremos y notificaremos conforme resulte aplicable."],
  ["Transferencias y jurisdicción", "Los proveedores pueden procesar información fuera de tu país. Antes del lanzamiento comercial se ajustarán las condiciones y mecanismos aplicables a los países donde se ofrezca el servicio."],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1] px-6 py-12 text-[#17324d]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7740]">Nutrity Global</p>
        <h1 className="mt-3 text-4xl font-bold">Aviso de Privacidad</h1>
        <p className="mt-3 text-sm text-slate-500">Versión 1.1 beta · Vigente desde el 18 de septiembre de 2026</p>
        <p className="mt-8 leading-7 text-slate-700">Este aviso explica cómo Nutrity Global trata la información que proporcionas. El servicio ofrece educación y acompañamiento de hábitos; no sustituye diagnóstico, tratamiento ni atención médica.</p>
        <div className="mt-10 space-y-8">
          {sections.map(([title, text]) => (
            <section key={title}>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 leading-7 text-slate-700">{text}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-bold">Contacto</h2>
            <p className="mt-2 leading-7 text-slate-700">Para ejercer tus derechos o realizar una consulta, escribe a <a className="font-semibold underline" href="mailto:admin@nutrity.global">admin@nutrity.global</a>. Este texto deberá revisarse legalmente antes de ampliar el servicio a nuevos países.</p>
          </section>
        </div>
        <div className="mt-12 flex gap-5 border-t pt-6 text-sm font-semibold">
          <Link href="/" className="underline">Volver al inicio</Link>
          <Link href="/terms" className="underline">Términos de Uso</Link>
        </div>
      </article>
    </main>
  );
}
