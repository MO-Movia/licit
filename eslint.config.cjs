const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    strict: false,
    header: config.header.mit,
  }),
  {
    rules: {
      //Include any rule overrides here!
       "dot-notation": ["warn", { "allowKeywords": true }],
       "@typescript-eslint/prefer-nullish-coalescing": "warn",
       "@typescript-eslint/dot-notation": "warn",
       "no-var": "warn",
       "import/no-cycle":"warn",
       "sonarjs/todo-tag":"warn",
        "sonarjs/no-clear-text-protocols":"warn"
    },
  },
];

