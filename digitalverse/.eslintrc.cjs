module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // The two rules that actually paid for themselves on this codebase.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
    'no-empty': ['error', { allowEmptyCatch: false }],
  },
  overrides: [
    {
      files: ['server.js', 'tests/**/*.js', '*.config.js', 'vite.config.js'],
      env: { browser: false, node: true },
    },
  ],
};
