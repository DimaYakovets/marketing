import type { BunFile, FileSink } from 'bun';


export class FileWriter {
    private readonly file: FileSink;

    constructor(fileName: string) {
        this.file = Bun.file(fileName, {

        }).writer();
    }

    async write(content: string) {
        await this.file.write(content);
    }

    async close() {
        await this.file.end();
    }
}