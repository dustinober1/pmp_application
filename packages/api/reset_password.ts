/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 12);

  console.log(`Resetting password for ${email}...`);

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      emailVerified: true,
    },
  });

  console.log('Password reset successful for user:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
