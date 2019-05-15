module.exports = {
  devServer: {
    port: 1234
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/cavis-frontend/' : '/'
}
