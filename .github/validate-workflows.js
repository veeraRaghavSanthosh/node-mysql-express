#!/usr/bin/env node

/**
 * Simple workflow validation script
 * Checks basic YAML syntax and structure of GitHub Actions workflows
 */

const fs = require('fs');
const path = require('path');

// Simple YAML syntax validation (basic checks)
function validateYAMLSyntax(content, filename) {
  const errors = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for tab characters (YAML should use spaces)
    if (line.includes('\t')) {
      errors.push(`${filename}:${lineNum}: Contains tab characters (use spaces instead)`);
    }
    
    // Check for trailing spaces (optional warning)
    if (line.endsWith(' ') && line.trim() !== '') {
      console.warn(`${filename}:${lineNum}: Warning - trailing spaces detected`);
    }
    
    // Basic indentation check
    if (line.trim() && line.match(/^\s+/) && line.search(/\S/) % 2 !== 0) {
      console.warn(`${filename}:${lineNum}: Warning - odd number of spaces (YAML typically uses 2-space indentation)`);
    }
  });
  
  return errors;
}

function validateWorkflowStructure(content, filename) {
  const errors = [];
  
  // Check for required top-level keys
  if (!content.includes('name:')) {
    errors.push(`${filename}: Missing 'name' field`);
  }
  
  if (!content.includes('on:')) {
    errors.push(`${filename}: Missing 'on' trigger field`);
  }
  
  if (!content.includes('jobs:')) {
    errors.push(`${filename}: Missing 'jobs' field`);
  }
  
  // Check for common GitHub Actions patterns
  if (content.includes('actions/checkout@') && !content.includes('actions/checkout@v4')) {
    console.warn(`${filename}: Consider updating to actions/checkout@v4`);
  }
  
  if (content.includes('actions/setup-node@') && !content.includes('actions/setup-node@v4')) {
    console.warn(`${filename}: Consider updating to actions/setup-node@v4`);
  }
  
  return errors;
}

function validateWorkflows() {
  const workflowsDir = path.join(__dirname, 'workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    console.error('Workflows directory not found');
    return false;
  }
  
  const files = fs.readdirSync(workflowsDir).filter(file => 
    file.endsWith('.yml') || file.endsWith('.yaml')
  );
  
  if (files.length === 0) {
    console.log('No workflow files found');
    return true;
  }
  
  let allValid = true;
  
  files.forEach(file => {
    const filePath = path.join(workflowsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\nValidating ${file}...`);
    
    const syntaxErrors = validateYAMLSyntax(content, file);
    const structureErrors = validateWorkflowStructure(content, file);
    
    const allErrors = [...syntaxErrors, ...structureErrors];
    
    if (allErrors.length > 0) {
      allValid = false;
      console.error(`❌ ${file} has errors:`);
      allErrors.forEach(error => console.error(`  - ${error}`));
    } else {
      console.log(`✅ ${file} is valid`);
    }
  });
  
  return allValid;
}

// Run validation
console.log('GitHub Actions Workflow Validator');
console.log('==================================');

const isValid = validateWorkflows();

if (isValid) {
  console.log('\n🎉 All workflows are valid!');
  process.exit(0);
} else {
  console.log('\n❌ Some workflows have issues. Please review and fix.');
  process.exit(1);
}