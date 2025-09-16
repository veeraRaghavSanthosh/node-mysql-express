#!/usr/bin/env node

/**
 * CI Setup Validation Script
 * 
 * This script validates that the GitHub Actions CI setup is properly configured
 * and provides recommendations for optimal usage.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating CI Setup...\n');

// Check for required files
const requiredFiles = [
  '.github/workflows/pr-tests.yml',
  '.github/workflows/ci.yml'
];

const optionalFiles = [
  '.eslintrc.js',
  '.eslintignore',
  '.prettierrc',
  '.prettierignore',
  'test/example.test.js'
];

let allGood = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n📁 Checking optional files:');
optionalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} - Not found (recommended)`);
  }
});

// Check package.json
console.log('\n📦 Checking package.json:');
if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('  ✅ package.json exists and is valid JSON');
    
    // Check for recommended scripts
    const recommendedScripts = ['test', 'lint', 'start'];
    const existingScripts = pkg.scripts || {};
    
    console.log('  📝 Scripts:');
    recommendedScripts.forEach(script => {
      if (existingScripts[script]) {
        console.log(`    ✅ ${script}: ${existingScripts[script]}`);
      } else {
        console.log(`    ⚠️  ${script} - Not defined (recommended)`);
      }
    });
    
    // Check for test dependencies
    const testDeps = ['mocha', 'jest', 'supertest'];
    const devDeps = pkg.devDependencies || {};
    const deps = pkg.dependencies || {};
    
    console.log('  🧪 Test Dependencies:');
    const hasTestFramework = testDeps.some(dep => devDeps[dep] || deps[dep]);
    if (hasTestFramework) {
      testDeps.forEach(dep => {
        if (devDeps[dep] || deps[dep]) {
          console.log(`    ✅ ${dep}`);
        }
      });
    } else {
      console.log('    ⚠️  No test framework found (mocha, jest, supertest recommended)');
    }
    
    // Check for linting dependencies
    const lintDeps = ['eslint', 'prettier'];
    console.log('  🔍 Linting Dependencies:');
    lintDeps.forEach(dep => {
      if (devDeps[dep] || deps[dep]) {
        console.log(`    ✅ ${dep}`);
      } else {
        console.log(`    ⚠️  ${dep} - Not found (recommended)`);
      }
    });
    
  } catch (error) {
    console.log('  ❌ package.json is invalid JSON');
    allGood = false;
  }
} else {
  console.log('  ❌ package.json not found');
  allGood = false;
}

// Check test directory
console.log('\n🧪 Checking test setup:');
if (fs.existsSync('test') || fs.existsSync('tests')) {
  const testDir = fs.existsSync('test') ? 'test' : 'tests';
  const testFiles = fs.readdirSync(testDir).filter(f => 
    f.endsWith('.test.js') || f.endsWith('.spec.js')
  );
  
  if (testFiles.length > 0) {
    console.log(`  ✅ Test directory found: ${testDir}/`);
    console.log(`  ✅ Test files found: ${testFiles.length}`);
    testFiles.forEach(file => {
      console.log(`    - ${file}`);
    });
  } else {
    console.log(`  ⚠️  Test directory exists but no test files found`);
  }
} else {
  console.log('  ⚠️  No test directory found (test/ or tests/ recommended)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 CI Setup Validation Complete!');
  console.log('\n✅ All required files are present.');
  console.log('🚀 Your GitHub Actions workflows are ready to use.');
  console.log('\n💡 Next steps:');
  console.log('   1. Commit these files to your repository');
  console.log('   2. Create a pull request to test the workflows');
  console.log('   3. Add recommended dependencies and scripts');
  console.log('   4. Write unit tests for your application');
} else {
  console.log('⚠️  CI Setup Validation Found Issues');
  console.log('\n❌ Some required files are missing.');
  console.log('📖 Please check the CI-SETUP.md file for detailed instructions.');
}

console.log('\n📚 Documentation:');
console.log('   - CI-SETUP.md - Complete setup guide');
console.log('   - package-scripts-enhancement.json - Recommended package.json additions');
console.log('   - test/example.test.js - Example test structure');

console.log('\n🔗 Useful commands:');
console.log('   npm install --save-dev mocha supertest eslint prettier');
console.log('   npm test');
console.log('   npm run lint');
console.log('   node validate-ci-setup.js');