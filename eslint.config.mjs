import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        plugins: {
            prettier,
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            // Prettier integration
            'prettier/prettier': 'error',

            // TypeScript specific rules
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // General rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],

            // Import rules
            'no-duplicate-imports': 'error',

            // Best practices
            'no-return-await': 'error',
            'require-await': 'off', // TypeScript handles this better
            'no-throw-literal': 'error',
        },
    },
    {
        // Test file specific rules
        files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },
    {
        // Ignore patterns
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'prisma/migrations/**',
            '*.js',
        ],
    }
);
