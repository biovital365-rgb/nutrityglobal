import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1] px-6 py-12 text-[#17324d]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7740]">Nutrity Global</p>
        <h1 className="mt-3 text-4xl font-bold">Términos de Uso</h1>
        <p className="mt-3 text-sm text-slate-500">Versión 1.1 beta · Vigentes desde el 18 de septiembre de 2026</p>
        <div className="mt-10 space-y-8 leading-7 text-slate-700">
          <section><h2 className="text-xl font-bold text-[#17324d]">Naturaleza del servicio</h2><p className="mt-2">Nutrity Global proporciona educación, organización de hábitos y herramientas de seguimiento. No presta atención de urgencia, no diagnostica enfermedades y no reemplaza a profesionales sanitarios.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Uso seguro</h2><p className="mt-2">No suspendas, inicies ni modifiques medicamentos basándote en el contenido de la plataforma. Ante síntomas agudos, riesgo de hipoglucemia o hiperglucemia, embarazo u otra situación de riesgo, busca atención profesional.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Cuenta</h2><p className="mt-2">Debes proporcionar información correcta, proteger tus credenciales y notificarnos si sospechas un acceso no autorizado. No puedes acceder a cuentas, expedientes u organizaciones ajenas.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Planes y pagos</h2><p className="mt-2">Nutrity Inicio es gratuito. Nutrity Plus cuesta USD 9,99 al mes, Ruta Nutrity 12 semanas USD 49 al mes y Nutrity Profesional USD 149 al mes. Los cobros recurrentes se procesan mediante Stripe; los impuestos aplicables se muestran antes de confirmar. Un pago solo habilita las funciones descritas para el plan adquirido.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Renovación y cancelación</h2><p className="mt-2">Los planes pagados se renuevan mensualmente hasta su cancelación. Puedes cancelar desde el portal de facturación y conservar el acceso hasta el final del periodo ya pagado, salvo fraude, abuso o exigencia legal. PayPal no forma parte del flujo público de suscripción durante esta beta.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Reembolsos y soporte</h2><p className="mt-2">Puedes solicitar revisión de un primer cobro dentro de los siete días calendario siguientes escribiendo a admin@nutrity.global. Evaluaremos el uso realizado y aplicaremos además los derechos obligatorios de tu jurisdicción. El soporte se presta por correo con objetivo de respuesta de dos días hábiles; no es un canal de urgencias ni una consulta sanitaria.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Acompañamiento humano</h2><p className="mt-2">Los planes de consumo incluyen herramientas educativas y seguimiento dentro de la plataforma. No incluyen consulta clínica individual salvo que se contrate y documente por separado con un profesional habilitado. Nutrity Profesional proporciona herramientas de gestión; no acredita ni supervisa las licencias de cada profesional.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Contenido e inteligencia artificial</h2><p className="mt-2">Algunas explicaciones pueden generarse con asistencia de IA y deben entenderse como apoyo educativo. No garantizamos resultados clínicos ni remisión. Conservas la responsabilidad de consultar decisiones clínicas con profesionales habilitados.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Suspensión y terminación</h2><p className="mt-2">Podemos limitar cuentas por fraude, abuso, impago o riesgo para otras personas. Puedes solicitar el cierre y eliminación de tu cuenta conforme al Aviso de Privacidad.</p></section>
          <section><h2 className="text-xl font-bold text-[#17324d]">Cambios</h2><p className="mt-2">Si realizamos cambios materiales, indicaremos la nueva versión y solicitaremos una nueva aceptación cuando corresponda.</p></section>
        </div>
        <div className="mt-12 flex gap-5 border-t pt-6 text-sm font-semibold">
          <Link href="/" className="underline">Volver al inicio</Link>
          <Link href="/privacy" className="underline">Aviso de Privacidad</Link>
        </div>
      </article>
    </main>
  );
}
