module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-underscore-dangle': 0,
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['src/', 'node_modules/'],
      },
    },
  },
};
