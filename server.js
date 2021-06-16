const express = require("express");
const next = require("next");
// const getConfig = require('next/config')
const getConfig = require('./next.config');
const helmet = require('helmet');
const compression = require('compression');
let bodyParser = require('body-parser');
const logger = require('express-simple-logger');
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const config = require('./next.config.js');
const middlewares = require('./middleware');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production"; //判断是否开发环境
const app = next({
  dev,
  conf: config
}); //创建一个next的app
const handler = app.getRequestHandler(); //请求处理
const api = require("./routes/api");

let nextConfig;
if (typeof getConfig === 'function') {
  nextConfig = getConfig();
} else {
  nextConfig = getConfig;
}

const { publicRuntimeConfig } = nextConfig;
console.log('nextConfig: ', nextConfig);


// console.log('getConfig', publicRuntimeConfig);

const devProxy = {
  '/crm_h': {
    target: publicRuntimeConfig.BASE_URL,
    changeOrigin: true,
  },
};


app
  .prepare()
  .then(() => {
    const {
      publicRuntimeConfig
    } = require('next/config').default();
    const server = express();
    let router = express.Router();
    // server.use(cookieParser());
    server.use(logger({
      unless: ['/_next**'],
      logTime: false
    }))
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({
      extend: true
    }));
    server.use(compression());
    server.use(helmet());
    server.use('/crm_h', api);

    Object.keys(devProxy).forEach((context) => {
      server.use(context, createProxyMiddleware(devProxy[context]));
    });

    // server.get("/", (req, res) => {
    //   const actualPage = "/";
    //   const queryParams = { currentBookId: req.params.currentBookId };
    //   app.render(req, res, actualPage, queryParams);
    // });
    middlewares(server, app);

    server.get('*', (req, res) => handler(req, res));

    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`)
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });