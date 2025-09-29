// eslint.config.js
import js from '@eslint/js';

export default [
  // Configuration de base recommandée par ESLint
  js.configs.recommended,
  {
    // Règles personnalisées (optionnel)
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
    // Ignorer certains fichiers/dossiers (optionnel)
    ignores: ['dist/', 'node_modules/'],
  },
];
