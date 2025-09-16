module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'indent': ['warn', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
    'no-undef': 'error',
    'no-extra-semi': 'warn'
  }
};