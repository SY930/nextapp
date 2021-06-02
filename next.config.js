const webpack = require('webpack');
const withLess = require('@zeit/next-less')
const cssLoaderConfig = require("@zeit/next-css/css-loader-config")
const lessToJS = require('less-vars-to-js')
// 修复引入 @ycg包问题，如果没有引入就不需要
// const withPlugins = require('next-compose-plugins')
// const withTM = require('next-transpile-modules')(['@ycg/components', '@ycg/widgets'])

const fs = require('fs')
const path = require('path')

// const packageJson = require('./package.json')
// const projectName = `${packageJson.name}`.replace('-frontend', '')

// const __DEV__ = process.env.NODE_ENV === 'development'
// const SERVER_ENV = process.env.SERVER_ENV || 'prod';

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8')
)

// 修复引入 @ycg包问题，如果没有引入就不需要
// module.exports = withPlugins([withLess, withTM], {
module.exports = {
//   distDir: __DEV__ ? './.next' : './dist',
  // 只有生产，才做cdn
//   assetPrefix: SERVER_ENV === 'prod' ? `https://jcsnew.mycaigou.com/${projectName}` : '',
  devIndicators: {
    autoPrerender: false
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      const antStyles = /antd\/.*?\/style.*?/
      const origExternals = [...config.externals]
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback()
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback)
          } else {
            callback()
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ]

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader',
      })

      config.module.rules.push({
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      });
    }

    const lessObj = {
      extensions: ["less"],
      dev,
      isServer,
      loaders: [
        {
          loader: "less-loader",
          options: { javascriptEnabled: true, modifyVars: themeVariables },
        },
      ],
    };
    const less = cssLoaderConfig(config, lessObj);
    const moduleless = cssLoaderConfig(config, {
      ...lessObj,
      cssModules: true,
      cssLoaderOptions: {
        importLoaders: 1,
        localIdentName: "[local]___[hash:base64:5]",
      },
    });

    // config.module.rules.push({
    //     test: new RegExp(`^(.*\\.global).*\\.css`),
    //     use: [{
    //         loader: 'style-loader'
    //       },
    //       {
    //         loader: 'css-loader',
    //       }
    //     ],
    //     exclude: /node_modules/
    // })
    // .less 文件都添加 css module
    config.module.rules.push({
      test: /\.less$/,
      exclude: path.join(__dirname, "node_modules"),
      use: moduleless,
    });

    config.module.rules.push({
      test: /\.less$/,
      include: path.join(__dirname, "node_modules"),
      use: less,
    });

    config.plugins.push(
      new webpack.EnvironmentPlugin([
        'NODE_ENV',
        'SERVER_ENV',
        'PORT',
        'HTTPS',
      ])
    )
    config.resolve.alias['src'] = path.join(__dirname, 'src')
    return config
  },
}