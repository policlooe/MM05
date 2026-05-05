import { z } from 'zod';

/**
 * Environment variables schema with strict validation
 * Ensures all required configuration is present and valid before app starts
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection URL')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),

  // JWT Configuration
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters for security')
    .refine(
      (secret) => !/^(your-|test-|example-|change-this)/i.test(secret),
      'JWT_ACCESS_SECRET must not use default/example values'
    ),
  
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
    .refine(
      (secret) => !/^(your-|test-|example-|change-this)/i.test(secret),
      'JWT_REFRESH_SECRET must not use default/example values'
    ),
  
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .default('15m')
    .refine(
      (val) => /^\d+[smhd]$/.test(val),
      'JWT_ACCESS_EXPIRES_IN must be in format: 15m, 1h, 7d, etc.'
    ),
  
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default('7d')
    .refine(
      (val) => /^\d+[smhd]$/.test(val),
      'JWT_REFRESH_EXPIRES_IN must be in format: 15m, 1h, 7d, etc.'
    ),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z
    .string()
    .refine(
      (key) => key.startsWith('sk_test_') || key.startsWith('sk_live_'),
      'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_'
    ),
  
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .refine(
      (key) => key.startsWith('pk_test_') || key.startsWith('pk_live_'),
      'STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_'
    ),
  
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .refine(
      (secret) => secret.startsWith('whsec_'),
      'STRIPE_WEBHOOK_SECRET must start with whsec_'
    ),

  // Application Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  PORT: z
    .string()
    .default('3000')
    .transform((val) => {
      const port = parseInt(val, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be a valid port number (1-65535)');
      }
      return port;
    }),
  
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'FRONTEND_URL must start with http:// or https://'
    ),

  // Optional: SMTP Configuration (for email notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Optional: Admin Configuration
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_FULL_NAME: z.string().optional(),

  // Optional: Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates environment variables on application startup
 * Exits process with error code 1 if validation fails
 * 
 * @returns Validated and typed environment variables
 */
export function validateEnv(): ValidatedEnv {
  console.log('🔍 Validating environment variables...');
  
  try {
    const validated = envSchema.parse(process.env);
    
    console.log('✅ Environment variables validated successfully');
    console.log(`   - Environment: ${validated.NODE_ENV}`);
    console.log(`   - Port: ${validated.PORT}`);
    console.log(`   - Database: ${validated.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   - Stripe Mode: ${validated.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
    console.log(`   - Frontend URL: ${validated.FRONTEND_URL}`);
    
    // Security warnings
    if (validated.NODE_ENV === 'production') {
      if (validated.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        console.warn('⚠️  WARNING: Using Stripe TEST keys in PRODUCTION environment!');
      }
      
      if (validated.FRONTEND_URL.includes('localhost')) {
        console.warn('⚠️  WARNING: FRONTEND_URL points to localhost in PRODUCTION!');
      }
    }
    
    return validated;
  } catch (error) {
    console.error('❌ Environment validation failed!\n');
    
    if (error instanceof z.ZodError) {
      console.error('Missing or invalid environment variables:\n');
      error.errors.forEach((err, index) => {
        const path = err.path.join('.');
        console.error(`  ${index + 1}. ${path}`);
        console.error(`     Error: ${err.message}`);
        console.error('');
      });
      
      console.error('💡 How to fix:');
      console.error('   1. Check your .env file exists in the backend/ directory');
      console.error('   2. Compare with .env.example for required variables');
      console.error('   3. Generate secure secrets:');
      console.error('      node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      console.error('');
    } else {
      console.error('Unexpected error:', error);
    }
    
    console.error('🚫 Application cannot start with invalid configuration');
    process.exit(1);
  }
}

/**
 * Helper function to generate secure random secrets
 * Use this to generate JWT secrets
 */
export function generateSecret(): string {
  return require('crypto').randomBytes(32).toString('hex');
}
