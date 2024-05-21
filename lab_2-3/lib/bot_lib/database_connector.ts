import { sequelize } from "../../db/sequelize";
import { Model, Sequelize, type ModelCtor, type ModelStatic } from "sequelize";
import { User } from "../../models/user";
import { QuizTest } from "../../models/quiz_test";

export interface IUser {
    id: number;
    [key: string]: any;
}

export interface IQuizTest {
    id: number;
    correct: number;
    total: number;
    current: number;
    UserId: number;
};

export class DatabaseConnector {
    private db: { users?: { [id: number]: IUser } };
    private url: string;
    private squalize: Sequelize;
    private user: any;
    private quizTest: any;

    constructor(url: string) {
        this.url = url;
        this.db = {};

        this.squalize = sequelize;
    }

    async connect(): Promise<void> {
        this.user = User(this.squalize);
        this.quizTest = QuizTest(this.squalize);

        this.user.hasMany(this.quizTest);
        this.quizTest.belongsTo(this.user);

        await this.squalize.authenticate();
        await this.squalize.sync({ alter: true })
    }

    async get_user(id: number): Promise<IUser | null> {
        return this.user.findOne({ where: { id } });
    }

    async add_user(id: number): Promise<IUser> {
        return this.user.create({ id, username: `user_${id}` });
    }

    async update_user(id: number, data: Partial<IUser>): Promise<void> {
        const user = await this.get_user(id);

        if (user) {
            await user.update(data);
        }
    }

    async delete_user(id: number): Promise<void> {
        const user = await this.get_user(id);

        if (user) {
            await user.destroy();
        }
    }

    async get_quiz_test(id: number): Promise<IQuizTest> {
        return this.quizTest.findOne({ where: { id } });
    }

    async get_quiz_test_by_user_id(id: number) {
        return (await this.quizTest.findAll({
            limit: 1,
            where: {
                UserId: id,
            },
            order: [['createdAt', 'DESC']]
        }))[0];
    }

    async add_quiz_test(data: Partial<IQuizTest>): Promise<IQuizTest> {
        return await this.quizTest.create(data);
    }

    async update_quiz_test(id: number, data: any): Promise<void> {
        await this.quizTest.update(data, { where: { id } });
    }

    async delete_quiz_test(id: number): Promise<void> {
        await this.quizTest.destroy({ where: { id } });
    }
}
