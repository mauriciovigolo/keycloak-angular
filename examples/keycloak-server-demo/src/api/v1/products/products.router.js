import express from 'express';

const router = express.Router();

router.get('', (req, res) => {
  res.send('');
});

module.exports.routerInfo = {
  router,
  path: '/v1/products'
};
