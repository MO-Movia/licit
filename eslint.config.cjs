const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    strict: false,
  }),
  {
    rules: {
      //Include any rule overrides here!
       "dot-notation": ["off", { "allowKeywords": true }],
       "@typescript-eslint/prefer-nullish-coalescing": "off",
       "@typescript-eslint/dot-notation": "off"
    },
  },
];
