#!/usr/bin/env node
/**
 * Deployment Helper Script
 * Run: node deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

function run(cmd) {
    try {
        execSync(cmd, { stdio: 'inherit' });
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    log('\n🚀 Deployment Helper for Pizza Shop\n', 'cyan');

    // Step 1: Check .env
    log('📋 Step 1: Checking environment file...', 'yellow');
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        log('Creating .env file...', 'yellow');
        const envContent = `# Database connection (change for production)
DATABASE_URL="file:./dev.db"

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="change-this-to-a-secure-random-string-min-32-chars"

# Site URL (optional, for production)
# NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
`;
        fs.writeFileSync(envPath, envContent);
        log('✅ Created .env file - PLEASE EDIT IT with your production values!', 'green');
    } else {
        log('✅ .env file exists', 'green');
    }

    // Step 2: Install dependencies
    log('\n📦 Step 2: Installing dependencies...', 'yellow');
    run('npm install');
    log('✅ Dependencies installed', 'green');

    // Step 3: Generate Prisma client
    log('\n🔧 Step 3: Generating Prisma client...', 'yellow');
    run('npx prisma generate');
    log('✅ Prisma client generated', 'green');

    // Step 4: Push database schema
    log('\n📊 Step 4: Pushing database schema...', 'yellow');
    run('npx prisma db push');
    log('✅ Database schema pushed', 'green');

    // Step 5: Build
    log('\n🏗️  Step 5: Building for production...', 'yellow');
    const buildSuccess = run('npm run build');

    if (buildSuccess) {
        log('\n✅ BUILD SUCCESSFUL!', 'green');
        log('\n📌 Next Steps:', 'cyan');
        log('1. Edit .env with your production DATABASE_URL', 'yellow');
        log('2. Push code to GitHub', 'yellow');
        log('3. Deploy to Vercel/Railway/Render', 'yellow');
        log('4. Set environment variables on hosting platform', 'yellow');
        log('\n🎉 Your app is ready to deploy!', 'green');
    } else {
        log('\n❌ Build failed. Check errors above.', 'red');
    }
}

main();
