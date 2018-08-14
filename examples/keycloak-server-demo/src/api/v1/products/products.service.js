import { db } from '../../../core/config';

const productModel = db.models.find(model => model.name === 'Products');

const list = async () => {
  return await productModel.findAll();
};

module.exports = {
  list
};
