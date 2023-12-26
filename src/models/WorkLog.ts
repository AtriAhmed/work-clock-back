import { DataTypes } from "sequelize";
const sequelize = require('../config/database.ts');

const DayWorkLog = require('./DayWorkLog');

const WorkLog = sequelize.define(
  "WorkLog",
  {
    dayWorkLogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DayWorkLog, // Replace with the actual model name
        key: "id", // Replace with the actual primary key of DayWorkLog
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true, // Can be null until the user clocks out
    },
  }
);

WorkLog.belongsTo(DayWorkLog, { foreignKey: 'dayWorkLogId' });
DayWorkLog.hasMany(WorkLog, {foreignKey: 'dayWorkLogId'});

module.exports = WorkLog;
