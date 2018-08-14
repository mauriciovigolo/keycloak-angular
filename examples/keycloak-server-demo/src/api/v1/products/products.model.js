module.exports = function(sequelize, DataTypes) {
  const Product = sequelize.define('Product', { name: DataTypes.STRING });
  return Product;
};
