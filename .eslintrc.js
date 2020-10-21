const prettierConfig = require('./prettier.js')

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ['plugin:compat/recommended', 'prettier'],
  plugins: ['import', 'prettier', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      webpack: {
        config: 'eslint-webpack-resolver.config.js',
      },
    },
  },
  env: {
    node: true,
  },
  rules: {
    'prettier/prettier': ['warn', prettierConfig],
    'import/no-extraneous-dependencies': 'off',
    'semi': ['error', 'never'],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'complexity': ['error', 20],
    'max-lines-per-function': [
      'warn',
      {
        max: 100,
        skipComments: true,
        skipBlankLines: true,
      },
    ],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
    ],
    'no-use-before-define': ['error', { functions: false }],
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'test/**/*.ts', 'scripts/rollup.config.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      plugins: ['simple-import-sort'],
      rules: {
        'simple-import-sort/sort': 'error',
      },
    },
    {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'prettier/@typescript-eslint',
        'plugin:@typescript-eslint/eslint-recommended',
      ],
      rules: {
        'import/no-commonjs': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
    {
      files: ['src/**/*.ts'],
      env: {
        'shared-node-browser': true,
        'node': false,
        'browser': false,
      },
    },
    {
      files: ['test/**/*.js', '**/*.spec.js', 'test/**/*.ts', '**/*.spec.ts'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
}
