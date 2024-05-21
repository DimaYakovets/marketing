import { Engine } from "./engine_bot";

const botToken = '6400636543:AAHjdWEAMNOkwU7rbRDoTzRTgjwoIg1ur-c';
const questionsFilePath = './../../config/quiz_yaml/questions.yml';
const databaseURI = 'mongodb://localhost:27017';

const engine = new Engine(botToken, questionsFilePath, databaseURI);
await engine.connect();
await engine.start();
