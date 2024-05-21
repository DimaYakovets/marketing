export class Question {
    public question: string;
    public correct: string;
    public answers: Record<string, string>;

    constructor(question: string, answers: string[]) {
        this.question = question;
        this.correct = '';
        
        this.answers = this.parseAnswers(answers);
    }

    public displayAnswers() {
        return Object.entries(this.answers)
            .map(([key, value]) => `${key}) ${value}`)
    }

    public parseAnswers(raw_answers: string[]): Record<string, string> {
        const answers: Record<string, string> = {};

        raw_answers.sort((a, b) => Math.random() - 0.5)
            .forEach((answer, index) => {
                answers[String.fromCharCode(65 + index)] = answer;

                if (answer.startsWith('*')) {
                    this.correct = String.fromCharCode(65 + index);

                    answers[String.fromCharCode(65 + index)] = answer.slice(1);
                }
            });

        if (!this.correct) {
            this.correct = 'A';
        }

        return answers;
    }

    findAnswerByChar(char: string) {
        return this.answers[char];
    }

    isCorrect(char: string) {
        return char === this.correct;
    }

    toString(): string {
        return `${this.question}\n${this.displayAnswers().join('\n')}`;
    }
}