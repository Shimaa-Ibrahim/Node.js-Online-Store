const { DataTypes, Model } = require("sequelize");

const sequelize = require("../../util/sqlDatabase");

class OrderItems extends Model {}

OrderItems.init(
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
    modelName: "OrderItems"
  }
);


module.exports = OrderItems;