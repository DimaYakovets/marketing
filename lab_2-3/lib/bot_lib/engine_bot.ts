import { Context, Telegraf } from "telegraf";
import type { Update } from "telegraf/types";
import { MessageResponder } from "./message_responder";
import path from 'path';
import { DatabaseConnector } from "./database_connector";
import { QuestionData } from "../quiz_lib/question_data";
import { I18n } from "i18n-js";
import { parse } from 'yaml'
import { FileWriter } from "../quiz_lib/file_writer";


const locales = parse(await Bun.file(path.join(__dirname, '../../config/locales.yml')).text());
const answers = path.join(__dirname, '../../quiz_answers');


export class Engine {
    private bot: Telegraf;
    private questions: QuestionData;
    private database: DatabaseConnector;
    private i18n: I18n;
    private progesses: { [key: string]: any };

    constructor(botToken: string, questionsFilePath: string, databaseURI: string) {
        const fullpath = path.join(__dirname, questionsFilePath);

        this.progesses = {};
        this.questions = new QuestionData();
        this.questions.loadFrom(fullpath);
        this.database = new DatabaseConnector(databaseURI);

        this.bot = new Telegraf(botToken);
        this.bot.on('message', this.handleMessage);
        this.bot.on('callback_query', this.handleMessage);

        this.i18n = new I18n(locales)
        this.i18n.locale = 'ua';
    }

    async connect() {
        this.database.connect();
    }

    private handleMessage = async (ctx: Context<Update>) => {
        const responder = new MessageResponder(ctx, this.questions, this.database, this.progesses, this.i18n);

        await responder.respond();
    };

    public async start() {
        await this.bot.launch();
    }
}

