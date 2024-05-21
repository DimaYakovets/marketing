import { Sequelize } from 'sequelize';
import { parse } from 'yaml'
import path from 'path';

const config = parse(await Bun.file(path.join(__dirname, '../config/database.yml')).text());


export const sequelize = new Sequelize(config.database, config.username, 'password', {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
});
