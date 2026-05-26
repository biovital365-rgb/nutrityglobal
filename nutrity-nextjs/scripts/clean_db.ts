import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpieza de base de datos ---');

  // 1. Borrar cualquier usuario que no sea ELITE
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      NOT: {
        plan: 'ELITE'
      }
    }
  });
  console.log(`Usuarios NO Elite eliminados: ${deletedUsers.count}`);

  // 2. Verificar usuarios restantes
  const remainingUsers = await prisma.user.findMany({
    select: { email: true, plan: true, role: true }
  });
  console.log('Usuarios actuales en la base de datos:');
  console.table(remainingUsers);

  // 3. Limpiar huérfanos (por si acaso quedaron de antes del CASCADE)
  // Como Prisma no permite deleteMany con joins fácilmente si el padre no existe,
  // el CASCADE ya debió borrar todo. Si algo falló, lo forzamos.
  const userIds = (await prisma.user.findMany({ select: { id: true } })).map(u => u.id);

  const cleanOrphans = async (modelName: any) => {
    const res = await (prisma as any)[modelName].deleteMany({
      where: {
        userId: {
          notIn: userIds
        }
      }
    });
    if (res.count > 0) {
      console.log(`Registros huérfanos eliminados en ${modelName}: ${res.count}`);
    }
  };

  await cleanOrphans('evaluation');
  await cleanOrphans('biologicalDiagnosis');
  await cleanOrphans('dailyMenu');
  await cleanOrphans('measurement');
  await cleanOrphans('appointment');
  await cleanOrphans('enrollment');
  await cleanOrphans('lessonProgress'); // lessonProgress has userId
  await cleanOrphans('pDFReportLog');

  console.log('--- Limpieza completada ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
