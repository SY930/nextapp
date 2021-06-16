const fetch = require('isomorphic-fetch');
const express = require("express");
const router = express.Router();

function getBody(opts) {
  const  p = Object.keys(opts).map(key => {
    const val = opts[key];
    return key + '=' + val;
  }).join('&');
  return p;
}

router.post('/sain',async function (req, res) {
    let car = req.body;
    // console.log('car: -----', car);
    const { ip, ...opts } = car;

    const result = await fetch(ip, {
      method:'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: getBody(opts)
    })
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