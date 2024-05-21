import { Question } from './question';
import { parse } from 'yaml';

export class QuestionData {
  private questions: Question[];

  constructor() {
    this.questions = [];
  }

  async loadFrom(filename: string) {
    const text = await Bun.file(filename).text();
    const data = parse(text);

    data.map((question_data: any) => {
      return new Question(question_data.question, question_data.answers);
    })
    
    for (const question_data of data) {
      const question = new Question(question_data.question, question_data.answers);

      this.questions.push(question);      
    }
  }

  getRandomQuestions(limit: number) {
    return this.questions
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }
}
