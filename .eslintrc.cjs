
const SEVERITY = {
  ERROR: 2,
  OFF: 0,
  WARN: 1,
};

module.exports = {
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      files: ["**/__tests__/*.test.js"],
      globals: {
        afterEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    "@typescript-eslint/no-unused-vars": SEVERITY.ERROR,
    "arrow-parens": SEVERITY.ERROR,
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "newline-per-chained-call": SEVERITY.ERROR,
    "semi": SEVERITY.ERROR,
    "space-infix-ops": SEVERITY.ERROR,
  },
};
