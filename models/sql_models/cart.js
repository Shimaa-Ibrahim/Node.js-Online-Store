const { DataTypes, Model } = require("sequelize");

const sequelize = require("../../util/sqlDatabase");

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  },
  {
    sequelize,
    modelName: "Cart"
  }
);


module.exports = Cart;