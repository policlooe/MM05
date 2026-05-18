import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');

    // Get credentials from environment variables
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_FULL_NAME || 'Administrator';

    // Validate required environment variables
    if (!email) {
      throw new Error('ADMIN_EMAIL environment variable is required');
    }

    if (!password) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
    }

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
    console.log('👤 Full Name:', fullName);
    console.log('🛡️  Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  ВАЖНО: Сохраните учетные данные в безопасном месте!');
    console.log('⚠️  Пароль НЕ отображается в целях безопасности.');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
