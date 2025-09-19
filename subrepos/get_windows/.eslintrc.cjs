module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: 'standard-with-typescript',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.dev.json'],
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/space-before-function-paren': 0
  }
}
