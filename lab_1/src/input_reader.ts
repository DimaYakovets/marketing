// proxy for user input
// validates input 
// could be set error messages callbalc
// could be set input callback

export class InputReader {
    async read(message: string, validator: (value: string) => boolean, error: string): Promise<string> {
        let value: string = '';
        let valid: boolean = true;

        do {
            console.write(message);

            for await (const line of console) {
                value = line;
                break;
            }

            valid = validator(value);

            if (!valid) {
                console.log(error);
            }

        } while (!valid);

        return value;
    }
}
