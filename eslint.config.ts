import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  ...typescriptEslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  /**
   * end
   */
  eslintConfigPrettier,
  eslintPluginPrettierRecommended
)
