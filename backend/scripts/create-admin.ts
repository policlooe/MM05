import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');

    const email = 'Vingonson1967@admin.mm05.ru';
    const password = 'Arapat14042012';
    const fullName = 'Administrator';

    // Проверка существования админа
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание админа
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: UserRole.ADMIN,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Full Name:', fullName);
    console.log('🛡️  Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
