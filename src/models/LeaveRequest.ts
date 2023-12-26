import { DataTypes } from "sequelize";
const sequelize = require('../config/database.ts');

const User = require('./User')

const LeaveRequest = sequelize.define(
  "LeaveRequest",
  {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User, // Replace with the actual model name
          key: "_id", // Replace with the actual primary key of DayWorkLog
        },
      },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description:{
      type: DataTypes.TEXT,
    },
    status:{
type: DataTypes.TINYINT, 
allowNull:false,
defaultValue: 0
    },
  }
);

LeaveRequest.belongsTo(User, { foreignKey: 'userId' });

  // LeaveRequest.sync({alter:true})

module.exports = LeaveRequest;
