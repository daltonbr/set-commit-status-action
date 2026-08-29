import MyrotvoretsConfig from '@myrotvorets/eslint-config-myrotvorets-ts';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['dist/**', 'lib/**'],
    },
    ...MyrotvoretsConfig,
    {
        // Tests are plain CommonJS running under Node's built-in test runner,
        // not part of the TypeScript build. no-undef stays on for them, unlike
        // for .ts where tsc covers it, so the globals have to be declared.
        files: ['tests/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: globals.node,
        },
    },
];
