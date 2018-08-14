const ProductModel = (sequelize, DataTypes) => {
  const Product = sequelize.define('Products', {
    name: DataTypes.STRING
  });

  Product.sync();

  return Product;
};

module.exports = ProductModel;
