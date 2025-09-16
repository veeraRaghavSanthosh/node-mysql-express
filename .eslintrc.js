module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    // Custom rules for this project
    'no-console': 'off', // Allow console.log for server logging
    'camelcase': 'off', // Allow snake_case for database fields
    'space-before-function-paren': ['error', 'never']
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '*.min.js'
  ]
}