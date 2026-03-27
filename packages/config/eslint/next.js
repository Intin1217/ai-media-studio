const { resolve } = require('path');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const nextPlugin = require('@next/eslint-plugin-next');
const prettierConfig = require('eslint-config-prettier');

/**
 * Creates ESLint flat config for Next.js apps.
 * @param {string} projectDir - The root directory of the app (for tsconfig resolution)
 */
function createNextEslintConfig(projectDir) {
  return [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
      plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
        '@next/next': nextPlugin,
      },
      rules: {
        ...reactPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          { prefer: 'type-imports' },
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
      settings: {
        react: { version: 'detect' },
      },
    },
    {
      ignores: ['.next/**', 'node_modules/**', 'dist/**', 'out/**'],
    },
  ];
}

module.exports = { createNextEslintConfig };
