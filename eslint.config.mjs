import MyrotvoretsConfig from '@myrotvorets/eslint-config-myrotvorets-ts';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['dist/**', 'lib/**'],
    },
    ...MyrotvoretsConfig,
    {
        // Tests are plain CommonJS running under Node's built-in test runner,
        // not part of the TypeScript build.
        files: ['tests/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                module: 'writable',
                require: 'readonly',
            },
        },
    },
];
