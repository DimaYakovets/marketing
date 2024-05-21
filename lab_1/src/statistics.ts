import type { FileWriter } from './file_writer';

export class Statistics {
    private correct: number;
    private incorrect: number;
    private total: number;

    constructor(correct: number, incorrect: number, total: number) {
        this.correct = correct;
        this.incorrect = incorrect;
        this.total = total;
    }

    public incrementCorrect() {
        this.correct++;
        this.total++;
    }

    public incrementIncorrect() {
        this.incorrect++;
        this.total++;
    }

    async printReport(writer: FileWriter) {
        await writer.write('Statistics:\n');
        await writer.write(`Correct: ${this.correct}\n`);
        await writer.write(`Incorrect: ${this.incorrect}\n`);
        await writer.write(`Total: ${this.total}\n`);
    }
}
