'use server';

import { Resend } from 'resend';
import { prisma as db } from '@/lib/prisma';
import { requireUser, requireUserAccess } from '@/lib/authz';

// Inicializar Resend solo si existe la key, de lo contrario usamos un mock
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = 'Nutrity Global <onboarding@resend.dev>'; // Idealmente configurado en .env

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const actor = await requireUser();
    if (actor.role !== 'ADMIN' && actor.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('Forbidden');
    }
    if (!resend) {
      console.log(`[MOCK EMAIL] Bienvenida enviada a: ${userEmail}`);
      return { success: true, mock: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: 'Bienvenido a Nutrity Global - Tu ruta de hábitos',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f766e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nutrity Global</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f766e;">¡Hola ${userName}!</h2>
            <p style="font-size: 16px; line-height: 1.5;">Gracias por dar el primer paso hacia hábitos metabólicos más claros y sostenibles.</p>
            <p style="font-size: 16px; line-height: 1.5;">Ingresa a tu panel y completa la evaluación educativa para crear tu Ruta Nutrity de 12 semanas.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir a mi Panel</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Nutrity Global. Todos los derechos reservados.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL ACTION ERROR]', error);
    return { success: false, error };
  }
}

export async function sendMenuApprovedEmail(userId: string) {
  try {
    const { target } = await requireUserAccess(userId, { coachAllowed: true });
    const user = await db.user.findUnique({ where: { id: target.id } });
    if (!user || !user.email) throw new Error('Usuario no encontrado o sin email');

    if (!resend) {
      console.log(`[MOCK EMAIL] Menú aprobado enviado a: ${user.email}`);
      return { success: true, mock: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject: 'Tu Menú Semanal ha sido Aprobado ✅',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Menú Aprobado!</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f766e;">Hola ${user.name || 'Amig@'},</h2>
            <p style="font-size: 16px; line-height: 1.5;">Tu coach clínico ha revisado y aprobado tu menú de precisión para esta semana.</p>
            <p style="font-size: 16px; line-height: 1.5;">Ingresa ahora a tu panel para ver tu protocolo, imprimirlo y comenzar a aplicar las terapias asignadas.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver mi Menú</a>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL ACTION ERROR]', error);
    return { success: false, error };
  }
}

export async function sendMenuChangesRequestedEmail(userId: string, notes: string) {
  try {
    const { target } = await requireUserAccess(userId, { coachAllowed: true });
    const user = await db.user.findUnique({ 
      where: { id: target.id },
      include: { organization: true }
    });
    
    if (!user || !user.email) throw new Error('Usuario no encontrado o sin email');

    // We assume the coach/admin email is the organization owner or a general admin email.
    // For now, we will notify the general admin or the coach if available.
    // To correctly find the coach email, we could query the User table, but we'll use ADMIN_EMAIL for now.
    const notifyEmail = process.env.ADMIN_EMAIL || 'support@nutrityglobal.com';

    if (!resend) {
      console.log(`[MOCK EMAIL] Solicitud de cambios de ${user.name} enviada a: ${notifyEmail} con notas: ${notes}`);
      return { success: true, mock: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [notifyEmail],
      subject: `Solicitud de Cambios en Menú - Paciente: ${user.name || user.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Revisión de Menú Solicitada</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #0f766e;">Hola Coach,</h2>
            <p style="font-size: 16px; line-height: 1.5;">El paciente <strong>${user.name || user.email}</strong> ha solicitado cambios en su menú semanal.</p>
            <p style="font-size: 16px; line-height: 1.5;"><strong>Notas del paciente:</strong></p>
            <blockquote style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #f59e0b; font-style: italic;">
              ${notes}
            </blockquote>
            <p style="font-size: 16px; line-height: 1.5;">Por favor, ingresa al panel de administración para revisar el menú y aprobar los ajustes.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir al Panel de Administración</a>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL ACTION ERROR]', error);
    return { success: false, error };
  }
}

