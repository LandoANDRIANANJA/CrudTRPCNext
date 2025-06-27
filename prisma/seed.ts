import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { clerkUserId: 'TON_CLERK_USER_ID_ICI' }, // Remplace par ton vrai clerkUserId
    update: {
      email: 'ton.email@exemple.com', // Remplace par ton email
      role: 'admin',
      firstName: 'TonPrénom',
      lastName: 'TonNom',
    },
    create: {
      email: 'ton.email@exemple.com',
      role: 'admin',
      firstName: 'TonPrénom',
      lastName: 'TonNom',
      clerkUserId: 'TON_CLERK_USER_ID_ICI',
    },
  });
  console.log('Utilisateur complet inséré ou mis à jour !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 