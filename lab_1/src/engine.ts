import { FileWriter } from './file_writer';
import { InputReader } from './input_reader';
import { QuestionData } from './question_data';
import { Statistics } from './statistics';
import { userInfo } from 'os';
import fs from 'fs';
import config from './config';

export class Engine {
    private readonly writer: FileWriter;
    private readonly reader: InputReader;
    private readonly statistics: Statistics;
    private readonly questions: QuestionData;

    constructor() {
        const time = new Date().toISOString().substring(0, 19).split('T');

        this.writer = new FileWriter(`${config.ANSWERS_DIR}/answer_${time[0]}_${time[1]}_by_${userInfo().username}.txt`);
        this.reader = new InputReader();
        this.statistics = new Statistics(0, 0, 0);
        this.questions = new QuestionData();
    }

    async init() {
        for (const file of fs.readdirSync(config.QUESTIONS_DIR)) {
            await this.questions.loadFrom(`${config.QUESTIONS_DIR}/${file}`);
        }
    }

    async run() {
        const questions = this.questions.getRandomQuestions(config.DEFAULT_QUESTIONS_COUNT);

        const start = new Date();
        const start_time = start.toISOString().substring(0, 19).split('T');

        await this.writer.write(`Starting the quiz by ${userInfo().username}\n`);
        this.writer.write(`Quiz started at ${start_time[0]} ${start_time[1]}\n`);

        let i = 1;

        for (const question of questions) {
            console.write(`${i++}. ${question.toString()}\n`);

            const answer = await this.reader.read('Your answer: ',
                (value) => !!question.findAnswerByChar(value),
                'Invalid answer! Type one of the following: ' + Object.keys(question.answers).join(', ')
            );

            if (question.isCorrect(answer)) {
                this.statistics.incrementCorrect();
            } else {
                this.statistics.incrementIncorrect();
            }

            await this.writer.write(`Question: ${question.question}, Your answer: ${answer}, Correct answer: ${question.correct}\n`);
        }

        const end = new Date();
        const end_time = end.toISOString().substring(0, 19).split('T');

        await this.writer.write('Quiz is over\n');
        await this.statistics.printReport(this.writer);
        await this.writer.write(`Quiz ended at ${end_time[0]} ${end_time[1]}\n`);

        const timeDifference = end.getTime() - start.getTime();

        const hours = Math.floor(timeDifference / 3600000);
        const minutes = Math.floor((timeDifference % 3600000) / 60000);
        const seconds = Math.floor((timeDifference % 60000) / 1000);


        console.log(`You've finished Quiz in: ${hours}h ${minutes}m ${seconds}s.\n`);
    }
}
