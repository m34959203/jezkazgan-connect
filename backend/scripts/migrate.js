#!/usr/bin/env node
/**
 * Database Migration Script
 *
 * Usage:
 *   node scripts/migrate.js
 *
 * Or with custom DATABASE_URL:
 *   DATABASE_URL="postgresql://..." node scripts/migrate.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🚀 Afisha.kz Database Migration Script\n', 'cyan');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL environment variable is not set!', 'red');
    log('\nHow to use:', 'yellow');
    log('  Windows (PowerShell):', 'reset');
    log('    $env:DATABASE_URL="postgresql://user:pass@host/db"; node scripts/migrate.js', 'cyan');
    log('\n  Windows (CMD):', 'reset');
    log('    set DATABASE_URL=postgresql://user:pass@host/db && node scripts/migrate.js', 'cyan');
    log('\n  Linux/Mac:', 'reset');
    log('    DATABASE_URL="postgresql://user:pass@host/db" node scripts/migrate.js', 'cyan');
    log('\nGet DATABASE_URL from Railway Dashboard → Variables\n', 'yellow');
    process.exit(1);
  }

  log('✓ DATABASE_URL found', 'green');

  // Mask the password in logs
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  log(`  Database: ${maskedUrl}\n`, 'reset');

  try {
    log('📦 Running drizzle-kit push...', 'cyan');

    execSync('npx drizzle-kit push', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });

    log('\n✅ Migration completed successfully!', 'green');
    log('   All tables are now up to date.\n', 'reset');

  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    log(`   Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
