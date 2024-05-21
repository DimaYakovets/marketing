import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../db/sequelize";

export const User = (sequelize: Sequelize) => sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});