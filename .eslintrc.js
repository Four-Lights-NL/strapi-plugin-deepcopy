module.exports = {
  extends: [
    'airbnb',
    'airbnb/hooks',

    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',

    'prettier',
    // Disable rules conflicting when using `--fix`
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.server.json'],
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'simple-import-sort'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'warn',
    'react/function-component-definition': 'off',

    // Automatically (try to) sort import statements
    // https://github.com/lydell/eslint-plugin-simple-import-sort
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // Allow CJS until ESM support improves
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
