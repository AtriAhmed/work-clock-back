import { DataTypes } from "sequelize";
const sequelize = require('../config/database.ts');

const Holiday = sequelize.define(
  "Holiday",
  {
    name:{
      type: DataTypes.STRING,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: false
}
);

Holiday.sync({alter:true})

module.exports = Holiday;
