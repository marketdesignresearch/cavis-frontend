module.exports = {
  devServer: {
    port: 1234
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  chainWebpack: config => {
    config.plugin('provide').use(require('webpack').ProvidePlugin, [
      {
        introJs: ['intro.js']
      }
    ])
  }
}
