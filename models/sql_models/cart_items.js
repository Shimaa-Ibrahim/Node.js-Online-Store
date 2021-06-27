const { DataTypes, Model } = require("sequelize");

const sequelize = require("../../util/sqlDatabase");

class CartItems extends Model {}

CartItems.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "CartItems"
  }
);


module.exports = CartItems;