import react from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  {
    plugins: {
      react,
    },

    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser,
        SyntheticEvent: false,
        SyntheticInputEvent: false,
        $ReadOnlyArray: false,
      },

      parser: babelParser,
      ecmaVersion: 13,
      sourceType: 'module',

      parserOptions: {
        allowImportExportEverywhere: false,
        codeFrame: true,

        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },

    rules: {
      'react/jsx-sort-props': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'consistent-return': 'error',
      'no-debugger': 'error',
      'no-invalid-regexp': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-trailing-spaces': 'error',
      'no-undef': 'error',

      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          ignoreRestSiblings: false,
        },
      ],

      'no-var': 'error',
      'prefer-const': 'error',

      quotes: [
        2,
        'single',
        {
          avoidEscape: true,
        },
      ],

      semi: [2, 'always'],
      strict: 0,
    },
  },
  {
    files: ['**/*.test.js'],

    plugins: {
      jest,
    },

    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
  },
];
