const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // reactStrictMode: true,
  optimization: {
    minimizer: [
      new TerserPlugin({
        
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
}
