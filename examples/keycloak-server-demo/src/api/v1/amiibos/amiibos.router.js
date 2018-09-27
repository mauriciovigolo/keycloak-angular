import express from 'express';
import productsService from './products.service';

const router = express.Router();

router.get('', async (req, res) => {
  let products = await productsService.list();
  res.status(200).send(products);
});

module.exports = {
  router,
  path: '/v1/amiibos'
};
