const webpack = require('webpack');
// const withLess = require('@zeit/next-less')
const cssLoaderConfig = require("@zeit/next-css/css-loader-config")
const lessToJS = require('less-vars-to-js')

const fs = require('fs')
const path = require('path')
const Dotenv = require('dotenv');

const envPath = path.join(__dirname, './.env');
const isExistENV = fs.existsSync(envPath);
if (isExistENV) {
  Dotenv.config({
    path: envPath,
    safe: true,
    systemvars: true,
  });
}

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8')
)

module.exports = {
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
        localIdentName: process.env.NODE_ENV !== 'production' ? '[local]___[hash:base64:5]' : '[hash:base64:8]',
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

    return config
  },
  publicRuntimeConfig: {
    BASE_URL: process.env.BASE_URL,
  },
}