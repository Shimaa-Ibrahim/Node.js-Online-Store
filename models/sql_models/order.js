const { DataTypes, Model } = require("sequelize");

const sequelize = require("../../util/sqlDatabase");

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  },
  {
    sequelize,
    modelName: "Order"
  }
);


module.exports = Order;