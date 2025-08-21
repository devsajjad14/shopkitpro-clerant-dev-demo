// Webpack optimization hints for media upload module
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        'media-upload': {
          name: 'media-upload',
          test: /[\\/]app[\\/]admin[\\/]media[\\/]upload-media[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        'upload-components': {
          name: 'upload-components',
          test: /[\\/]app[\\/]admin[\\/]media[\\/]upload-media[\\/]components[\\/]/,
          priority: 20,
          reuseExistingChunk: true,
        }
      }
    }
  },
  resolve: {
    alias: {
      // Tree shake unused utilities
      '@/media-upload': path.resolve(__dirname, './')
    }
  }
}