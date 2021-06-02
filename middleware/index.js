const LRUCache = require('lru-cache');
const routes = require('../router');
console.log('routes: ', routes);

const ssrCache = new LRUCache({
    max: 1000, // cache item count
    maxAge: 1000 * 60 * 60, // 1 hour
  });
  const getCacheKey = req => `${req.url}`;
  module.exports = (server, app) => {
    routes.map(item => {
        // console.log('item: --', item);
      server.get(item, async (req, res, next) => {
        //   console.log('!(process.env.PAGE_CACHE ===', !(process.env.PAGE_CACHE === 'on'))
        if (!(process.env.PAGE_CACHE === 'on')) return next(); // 可以在.env文件里设置
        const key = getCacheKey(req);
        if (ssrCache.has(key)) {
          try {
            const html = ssrCache.get(key);
            res.setHeader('X-cache-status', 'HIT');
            res.send(html);
            return next();
          } catch (error) { }
          return next();
        }
        try {
            // console.log( 'app---', app.renderToHTML)
          const html = await app.renderToHTML(req, res, item, { ...req.query, ...req.params });
          if (res.statusCode !== 200) {
            res.send(html);
            return next();
          }
          ssrCache.set(key, html);
          res.setHeader('X-cache-status', 'MISS');
          res.send(html);
          return null;
        } catch (error) { }
        return next();
      });
      return null;
    });
  };