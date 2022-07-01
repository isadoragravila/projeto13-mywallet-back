import { db, objectId } from '../databases/mongo.js';
import joi from 'joi';
import dayjs from 'dayjs';

export async function getRegisters (req, res) {
    try {
        const { authorization } = req.headers;
        const token = authorization?.replace('Bearer ', '');

        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.status(401).send("Houve algum problema session");
        }

        const userId = session.userId;
        const user = await db.collection('users').findOne({ _id: new objectId(userId) });
        if (!user) {
            return res.status(401).send("Houve algum problema user");
        }

        const registers = await db.collection('transactions').find({ userId: new objectId(userId) }).toArray();

        return res.status(200).send({ name: user.name, registers });
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function postRegisters (req, res) {
    //validação do formato do objeto vindo do body
    const registerSchema = joi.object({
        type: joi.string().valid("inflow", "outflow").required(),
        description: joi.string().required(),
        value: joi.number().required()
    });
    const validation = registerSchema.validate(req.body);
    if (validation.error) {
        return res.status(422).send("Todos os campos são obrigatórios!");
    }

    try {
        //recebe o token e verifica se tem sessão e usuário relacionados
        const { authorization } = req.headers;
        const token = authorization?.replace('Bearer ', '');

        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.status(401).send("Houve algum problema session");
        }

        const userId = session.userId;
        const user = await db.collection('users').findOne({ _id: new objectId(userId) });
        if (!user) {
            return res.status(401).send("Houve algum problema user");
        }
        //insere o registro na coleção transactions
        const { type, description, value } = req.body;
        const date = dayjs().format('DD/MM');

        const register = { type, description, value: Number(value), date, userId };

        await db.collection('transactions').insertOne(register);

        return res.status(201).send("Registro criado com sucesso");
    } catch (error) {
        res.status(500).send(error);
    }
}