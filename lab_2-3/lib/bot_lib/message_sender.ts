import type { Context } from "telegraf";
import type { InlineKeyboardButton, Update } from "telegraf/types";

export class MessageSender {
    private ctx: Context<Update>;


    constructor(ctx: Context<Update>) {
        this.ctx = ctx;
    }

    async sendText(text: string) {
        await this.ctx.reply(text);
    }

    async sendKeyboard(message: string, buttons: { text: string, key: string }[]) {
        await this.ctx.reply(message, {
            reply_markup: {
                inline_keyboard: buttons.map(({ key, text }) => {
                    return [
                        {
                            text: text,
                            callback_data: key,
                        } as InlineKeyboardButton
                    ]
                })
            }
        });
    }
}
