module.exports = {
  extends: "eslint:recommended",
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  globals: {
    logger: true,
  },
  rules: {
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    'semi': ['error', 'always'],
    'curly': ['error', 'multi-line', 'consistent'],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "dot-location": ["error", "property"],
    "eol-last": ["error", "always"],
    "indent": ["error", 2],
    "max-nested-callbacks": ["error", { "max": 3 }],
    "max-statements-per-line": ["error", { "max": 2 }],
    "no-confusing-arrow": "error",
    "no-console": "warn",
    "no-empty-function": "error",
    "no-floating-decimal": "error",
    "no-lonely-if": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],
    "no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
    "no-trailing-spaces": ["error"],
    "no-var": "error",
    "no-tabs": "error",
    "object-curly-spacing": ["error", "always"],
    "prefer-const": "error",
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always"],
    "yoda": ["error", "never", { "exceptRange": true }]
  }
};
