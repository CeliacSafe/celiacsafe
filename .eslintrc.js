module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['i18next'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['node_modules/', '.expo/'],
  rules: {
    'i18next/no-literal-string': [
      'warn',
      {
        mode: 'jsx-text-only',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
