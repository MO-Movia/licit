const config = require('@modusoperandi/eslint-config');

const baseConfig = config.getFlatConfig({
  strict: false
});

// Find and modify the config object that has parserOptions
const modifiedConfig = baseConfig.map(cfg => {
  if (cfg.languageOptions?.parserOptions?.project) {
    return {
      ...cfg,
      languageOptions: {
        ...cfg.languageOptions,
        parserOptions: {
          ...cfg.languageOptions.parserOptions,
          project: undefined, // Remove project since projectService is enabled
        },
      },
    };
  }
  return cfg;
});

module.exports = [
  ...modifiedConfig,
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

