#!/usr/bin/env node
/**
 * Startup script that runs database migrations before starting the server
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

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
  log('\n🚀 Afisha.kz Backend Startup\n', 'cyan');

  // Run migrations if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    log('📦 Running database migrations...', 'cyan');

    try {
      execSync('npx drizzle-kit push --force', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        env: { ...process.env },
        timeout: 60000, // 60 second timeout
      });
      log('✅ Database migrations completed!\n', 'green');
    } catch (error) {
      log('⚠️  Migration warning (continuing anyway):', 'yellow');
      log(`   ${error.message}`, 'yellow');
      log('   Server will start, but some features may not work.\n', 'yellow');
    }
  } else {
    log('⚠️  DATABASE_URL not set, skipping migrations\n', 'yellow');
  }

  // Start the server
  log('🌐 Starting server...', 'cyan');

  const server = spawn('node', ['dist/index.js'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env },
  });

  server.on('error', (error) => {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    process.exit(1);
  });

  server.on('close', (code) => {
    process.exit(code || 0);
  });

  // Handle termination signals
  process.on('SIGTERM', () => {
    server.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    server.kill('SIGINT');
  });
}

main();
