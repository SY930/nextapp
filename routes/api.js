const fetch = require('isomorphic-fetch');
const express = require("express");
const router = express.Router();

function getQueryParam(params) {
    console.log('params: ', params);
    const  p = Object.keys(params).map(key => {
        const val = params[key];
        if (Object.prototype.toString.call(val).indexOf('String') !== -1) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(val));
    }).join('&');
    return p;
}

function getBodyParam(type, params) {
    console.log('type: ', type);
    if (type === 'JSON') return JSON.stringify(params);
    if (type === 'FORM') {
        const formData = new FormData();
        Object.keys(params).forEach(key => {
            formData.append(key, params[key]);
        });
        return formData;
    }
    return getQueryParam(params);
}


function getUrlParams(options) {
    // console.log('options: ', options);
    const { url, method: _m, type: _t, ...params} = options;
    console.log('params: ======================', params);
    const getContentType = (type) => {
        let contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
        if (type === 'JSON') contentType = 'application/json;charset=UTF-8';
        if (type === 'FORM') contentType = '';
        return contentType ? { 'content-type': contentType } : {};
    };
    const _u = (_m === 'GET' || _m === 'get') ? (`${url}?${getQueryParam(params)}`) : url;
    const body = (_m === 'POST' || _m === 'post') ? { body: getBodyParam(_t, params) } : {}
    // console.log('body: ', body);
    const headers = { ...getContentType(_t) }; // token
    return { url: _u, method: _m,  headers, ...body,}
}

router.post('/sain',async function (req, res) {
    let car = req.body;
    const { ip, ...options } = car;
    const opt = {
        method: 'POST', type: 'JSON',
        url: ip,
        ...options,
    }
    const {url, ...params} = getUrlParams({...opt, type: "FORM"});
    console.log('params:--- ', params);

    const result = await fetch(url, params)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          let err = new Error(response.statusText);
          err.response = response;
          return err;
        }
      })
      .catch(err => ({
        code: 500,
        message: err
      }))
      .then((json) => {
        return json
      })
      console.log('result-----------', result)
      res.json(result);
  })

module.exports = router;