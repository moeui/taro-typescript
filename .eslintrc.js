module.exports = {
    extends: [
        "taro/react",
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        // 'prettier/@typescript-eslint',
        // 'plugin:prettier/recommended',
        // 'prettier/react'
    ],
    plugins: ['@typescript-eslint', 'react', 'simple-import-sort'],
    rules: {
        "import/first": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        // 'prettier/prettier': 1,
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: true }],
        '@typescript-eslint/indent': ['error', 4, { VariableDeclarator: 4, SwitchCase: 1 }],
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/explicit-member-accessibility': 0,
        '@typescript-eslint/no-triple-slash-reference': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-this-alias': 0,
        '@typescript-eslint/triple-slash-reference': ['error', { path: 'always', types: 'never', lib: 'never' }],
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/explicit-function-return-type': [
            'warn',
            {
                allowExpressions: true
            }
        ],
        // 'react/jsx-indent': [2, 4],
        'react/jsx-no-undef': [2, { allowGlobals: true }],
        'react/display-name': 0,
        '@typescript-eslint/no-empty-function': 0,
        'react/self-closing-comp': 2
    }
}
