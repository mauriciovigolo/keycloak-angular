module.exports = function(sequelize, DataTypes) {
  const Amiibo = sequelize.define('Amiibo', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amiiboSeries: DataTypes.STRING,
    character: DataTypes.STRING,
    gameSeries: DataTypes.STRING,
    head: DataTypes.STRING,
    image: DataTypes.STRING,
    name: DataTypes.STRING,
    tail: DataTypes.STRING,
    type: DataTypes.STRING
  });
  return Amiibo;
};
