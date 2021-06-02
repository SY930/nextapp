const express = require("express");
const next = require("next");
const helmet = require('helmet');
const compression = require('compression');
let bodyParser = require('body-parser');
const config = require('./next.config.js');
const middlewares = require('./middleware');
const { response } = require("express");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production"; //判断是否开发环境
const app = next({ dev, conf: config }); //创建一个next的app
const handler = app.getRequestHandler(); //请求处理
const api = require("./routes/api")
app
  .prepare()
  .then(() => {
    const server = express();
    let router = express.Router();
    // server.use(cookieParser());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({extend:true}));
    server.use(compression());
    server.use(helmet());
    server.use('/crm_h', api);
    

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