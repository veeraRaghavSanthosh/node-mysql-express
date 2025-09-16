#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔒 Installing security dependencies...\n');

const dependencies = [
  'express-rate-limit@^6.7.0',
  'express-validator@^6.15.0', 
  'helmet@^6.1.5',
  'xss@^1.0.14'
];

const devDependencies = [
  'jest@^29.5.0',
  'supertest@^6.3.3'
];

try {
  console.log('Installing production dependencies...');
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  
  console.log('\nInstalling development dependencies...');
  execSync(`npm install --save-dev ${devDependencies.join(' ')}`, { stdio: 'inherit' });
  
  console.log('\n✅ Security dependencies installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the CHANGELOG.md for details of security improvements');
  console.log('2. Review the SECURITY.md for configuration options');
  console.log('3. Run `npm test` to verify the installation');
  console.log('4. Restart your server to apply security middleware');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}