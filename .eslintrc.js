module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    rules: {
        'quotes': ['error', 'single'],
        'indent': 'off',
        'space-before-function-paren': 'off',
        'no-unused-vars': 'warn',
        'max-len': 'off',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
};
