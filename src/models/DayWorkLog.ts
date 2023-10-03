import { DataTypes } from "sequelize";
const sequelize = require('../config/database.ts');

const User = require('./User')
const WorkLog = require('./WorkLog')

const DayWorkLog = sequelize.define(
  "DayWorkLog",
  {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User, // Replace with the actual model name
          key: "_id", // Replace with the actual primary key of DayWorkLog
        },
      },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    weekDay:{
type: DataTypes.TINYINT.UNSIGNED, 
allowNull:false
    },
    totalWorkTime: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // You can set an initial value if needed
    },
  }
);

DayWorkLog.belongsTo(User, { foreignKey: 'userId' });

// DayWorkLog.sync({alter:true})

module.exports = DayWorkLog;
