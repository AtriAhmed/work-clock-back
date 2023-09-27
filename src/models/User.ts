import { DataTypes } from "sequelize";
const sequelize = require('../config/database.ts');

const AccessLevel = require('./AccessLevel');

const User = sequelize.define('User', {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  contractType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salary: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: AccessLevel,
      key: 'permissionLevel'
    }
  }
},
  {
    tableName: "users",
    timestamps: false,
  });

User.belongsTo(AccessLevel, { foreignKey: 'accessId' });


module.exports = User;