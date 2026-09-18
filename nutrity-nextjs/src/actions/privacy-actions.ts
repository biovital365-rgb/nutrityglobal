'use server';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/authz';

export async function exportMyData() {
  const user = await requireUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      age: true,
      address: true,
      occupation: true,
      maritalStatus: true,
      socialMedia: true,
      plan: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      measurements: true,
      evaluations: true,
      appointments: true,
      dailyMenus: true,
      biologicalDiagnoses: true,
      enrollments: true,
      quizAttempts: true,
      assignmentSubmissions: true,
    },
  });
  if (!data) throw new Error('Usuario no encontrado');
  return { exportedAt: new Date().toISOString(), data };
}

export async function requestAccountDeletion(confirmation: string) {
  if (confirmation !== 'ELIMINAR') throw new Error('Confirmación no válida');
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date(), status: 'BLOCKED' },
  });
  return { success: true };
}
