export default [
    {
        ignores: ['node_modules/**', '.agents/**']
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            }
        },
        rules: {
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': 'off',
            'no-undef': 'error',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single']
        }
    }
];
