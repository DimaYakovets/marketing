import { Telegraf, Context } from 'telegraf'
import { message, callbackQuery } from 'telegraf/filters'
import type { QuestionData } from './question_data';
import type { Question } from './question';
import type { InlineKeyboardButton } from 'telegraf/types';

interface Quiz {
  questions: Question[];
  answers: string[];
  current_question: number;
  statistics: {
    correct: number;
    incorrect: number;
    total: number;
  }
}

export class Bot {
  private bot: Telegraf
  private questions: QuestionData;
  private quizes: Record<string, Quiz>;

  constructor(token: string, questions: QuestionData) {
    this.bot = new Telegraf(token);
    this.questions = questions;
    this.quizes = {};

    this.bot.command('start', this.handle_start.bind(this));
    this.bot.command('quiz', this.handle_quiz.bind(this));
    this.bot.on('callback_query', this.handle_answer.bind(this));
    this.bot.on('text', this.handle_answer.bind(this));
  }

  private async handle_start(ctx: Context) {
    await ctx.reply('Welcome to the quiz bot! Type /quiz to start.');
  }

  private async handle_quiz(ctx: Context) {
    const id = ctx.senderChat!.id;

    if (this.quizes[id]) {
      await ctx.reply('You are already in a quiz!');

      return;
    }

    const quiz = this.create_quiz();

    this.quizes[id] = quiz;

    this.send_next_question(ctx);
  }

  private async handle_answer(ctx: Context) {
    if (ctx && !ctx?.text) {
      return;
    }


    const answer = (ctx.callbackQuery as any).data;

    if (!this.quizes[ctx.senderChat!.id]) {
      await ctx.reply('Start quiz first! Type /quiz');
      return;
    }

    const quiz = this.quizes[ctx.senderChat!.id];
    const question = quiz.questions[quiz.current_question];

    if (!question) {
      await ctx.reply('Quiz is over!');
      return;
    }

    const correct_answer = question.answers[answer];

    if (!correct_answer) {
      await ctx.reply('Invalid answer! Type one of the following: ' + Object.keys(question.answers).join(', '));

      return;
    }

    if (answer === question.correct) {
      quiz.statistics.correct++;
    } else {
      quiz.statistics.incorrect++;
    }

    quiz.answers.push(answer);

    quiz.statistics.total++;
    quiz.current_question++;

    ctx.answerCbQuery(`You answered: ${answer}`);

    this.send_next_question(ctx);
  }

  private send_next_question(ctx: Context) {
    const quiz = this.quizes[ctx.senderChat!.id];
    const question = quiz.questions[quiz.current_question];

    if(!question) {
      ctx.reply(`Quiz is over! You answered ${quiz.statistics.correct} out of ${quiz.statistics.total} questions correctly.`);

      delete this.quizes[ctx.senderChat!.id];

      return;
    }

    ctx.reply(question.question, {
      reply_markup: {
        inline_keyboard: Object.entries(question.answers).map(([key, value]) => {
          return [
            {
              text: `${key}. ${value}`,
              callback_data: key,
            } as InlineKeyboardButton
          ]
        })
      }
    })
  }

  private create_quiz() {
    const quiz: Quiz = {
      questions: this.questions.getRandomQuestions(5),
      answers: [],
      current_question: 0,

      statistics: {
        correct: 0,
        incorrect: 0,
        total: 0,
      },
    };

    return quiz;
  }

  async start() {
    await this.bot.launch();
  }
}
