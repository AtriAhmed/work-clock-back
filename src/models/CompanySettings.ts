import {DataTypes} from "sequelize"

const db = require("../config/database");

const CompanySettings = db.define('CompanySettings', {
    weekRestDays: {
        type: DataTypes.STRING(256),
        allowNull: false,
        defaultValue:`[5,6]`
    },
    yearLeaveDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:`30`
    }
}, {
    timestamps: false
})

 CompanySettings.sync({alter:true})

module.exports = CompanySettings
