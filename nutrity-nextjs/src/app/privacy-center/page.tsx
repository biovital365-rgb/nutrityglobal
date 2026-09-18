'use client';

import { useState } from 'react';
import Link from 'next/link';
import { exportMyData, requestAccountDeletion } from '@/actions/privacy-actions';

export default function PrivacyCenterPage() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function downloadData() {
    setBusy(true);
    setMessage('');
    try {
      const result = await exportMyData();
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `nutrity-data-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('La copia de tus datos se descargó correctamente.');
    } catch {
      setMessage('No fue posible exportar los datos. Inicia sesión e inténtalo nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  async function requestDeletion() {
    if (!window.confirm('Tu cuenta se bloqueará mientras se procesa la eliminación. ¿Deseas continuar?')) return;
    setBusy(true);
    try {
      await requestAccountDeletion('ELIMINAR');
      setMessage('Solicitud registrada. La cuenta quedó bloqueada mientras se verifica la eliminación.');
    } catch {
      setMessage('No fue posible registrar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] px-6 py-12 text-[#17324d]">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7740]">Nutrity Global</p>
        <h1 className="mt-3 text-4xl font-bold">Centro de privacidad</h1>
        <p className="mt-4 leading-7 text-slate-600">Descarga una copia de la información asociada a tu cuenta o solicita su eliminación. Debes iniciar sesión para utilizar estas opciones.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button disabled={busy} onClick={downloadData} className="rounded-xl bg-[#17324d] px-5 py-4 font-bold text-white disabled:opacity-50">Descargar mis datos</button>
          <button disabled={busy} onClick={requestDeletion} className="rounded-xl border border-red-300 px-5 py-4 font-bold text-red-700 disabled:opacity-50">Solicitar eliminación</button>
        </div>
        {message && <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">{message}</p>}
        <div className="mt-10 flex gap-5 text-sm font-semibold"><Link href="/privacy" className="underline">Aviso de Privacidad</Link><Link href="/dashboard" className="underline">Volver al panel</Link></div>
      </section>
    </main>
  );
}
