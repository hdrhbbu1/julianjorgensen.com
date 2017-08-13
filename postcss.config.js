module.exports = {
  plugins: {
    'postcss-import': {
      root: __dirname,
    },
    'postcss-mixins': {},
    'postcss-each': {},
    'postcss-cssnext': {},
    'postcss-font-magician' : {
      hosted: ['./app/assets/fonts']
    }
  },
};
