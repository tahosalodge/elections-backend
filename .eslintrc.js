module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-underscore-dangle': 0,
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'class-methods-use-this': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['src/', 'node_modules/'],
      },
    },
  },
};
