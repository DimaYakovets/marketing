import { DataTypes, type Sequelize } from "sequelize";

export const QuizTest = (sequelize:  Sequelize) => sequelize.define('QuizTest', {
    correct: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    current: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

// Define associations