import { Context } from 'telegraf';
import type { Update } from 'telegraf/types';
import { MessageSender } from './message_sender';
import { DatabaseConnector } from './database_connector';
import { QuestionData } from '../quiz_lib/question_data';
import type { I18n } from 'i18n-js';

export class MessageResponder {
    private ctx: Context<Update>;
    private messageSender: MessageSender;
    private questions: QuestionData
    private database: DatabaseConnector
    private i18n: I18n;
    private progresses: { [key: string]: any };

    constructor(ctx: Context<Update>, questions: QuestionData, database: DatabaseConnector, progresses: { [key: string]: any },  i18n: I18n) {
        this.ctx = ctx;
        this.messageSender = new MessageSender(ctx);
        this.questions = questions;
        this.database = database;
        this.i18n = i18n;

        this.progresses = progresses;
    }

    async respond() {
        if (!this.ctx) {
            return;
        }

        const text = this.ctx.updateType === 'message' ? this.ctx.text : '';

        if (text === '/start') {
            await this.handleStart();
        } else if (text === '/stop') {
            await this.messageSender.sendText(this.i18n.t('farewell_message'));
        } else if (text === '/quiz') {
            await this.startQuiz();
        } else if (this.ctx.updateType === 'callback_query') {
            await this.handleAnswer();
        }
    }

    async handleStart() {
        let user = await this.database.get_user(Number(this.ctx.chat?.id ?? ''));

        if (!user) {
            user = await this.database.add_user(Number(this.ctx.chat?.id ?? ''));
        }

        await this.messageSender.sendText(this.i18n.t('greeting_message'));
        await this.messageSender.sendKeyboard(this.i18n.t('start_quiz'), [
            { key: 'quiz_yes', text: this.i18n.t('yes') },
            { key: 'quiz_no', text: this.i18n.t('no') },
        ]);
    }

    async handleAnswer() {
        await this.ctx.answerCbQuery();

        if ((this.ctx.callbackQuery as any).data === 'quiz_yes') {
            await this.startQuiz();
            return;
        }

        let quiz = (await this.database.get_quiz_test_by_user_id(Number(this.ctx.chat?.id ?? '')))!;

        if (!quiz) {
            return;
        }

        const progress = this.progresses[this.ctx.chat?.id ?? ''];

        const answer = (this.ctx.callbackQuery as any).data;
        const question = progress[quiz.current];

        if (question?.isCorrect(answer)) {
            quiz.correct_answers++;

            await this.messageSender.sendText(this.i18n.t('correct_answer'));
        } else {
            await this.messageSender.sendText(this.i18n.t('wrong_answer'));
        }

        quiz.total++;
        quiz.current++;

        await quiz.save();

        if (quiz.current === progress.length) {
            await this.messageSender.sendText(this.i18n.t('statistics', {
                correct_answers: quiz.correct,
                total_answers: quiz.total,
            }));
        } else {
            this.sendNextQuestion();
        }
    }

    async sendNextQuestion() {
        let quiz = await this.database.get_quiz_test_by_user_id(Number(this.ctx.chat?.id ?? ''));

        if (!quiz) {
            return;
        }

        const question = this.progresses[this.ctx.chat?.id ?? ''][quiz.current];

        if (!question) {
            return;
        }

        await this.messageSender.sendKeyboard(
            this.i18n.t('question', {
                name: (this.ctx.chat as any).first_name,
                question: question.question,
            }),
            Object.keys(question.answers).map((char) => ({
                key: char,
                text: `${char}. ${question.answers[char]}`,
            }))
        );
    }

    async startQuiz() {
        let user = (await this.database.get_user(Number(this.ctx.chat?.id ?? '')))!;


        this.progresses[this.ctx.chat?.id ?? '']
            = this.questions.getRandomQuestions(10);

        await this.database.add_quiz_test({
            correct: 0,
            total: 0,
            current: 0,

            UserId: user.id,
        })

        await this.sendNextQuestion();
    }
}
