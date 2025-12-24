import eslint from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
    eslint.configs.recommended,
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': tseslintPlugin,
            prettier,
        },
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        rules: {
            // Prettier integration
            'prettier/prettier': 'error',

            // TypeScript specific rules
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // General rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],

            // Disable base rules that conflict with TypeScript
            'no-unused-vars': 'off',
            'no-undef': 'off',
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
            'client/**',
        ],
    }
];
