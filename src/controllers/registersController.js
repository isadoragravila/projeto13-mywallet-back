import { db, objectId } from '../databases/mongo.js';
import joi from 'joi';
import dayjs from 'dayjs';

export async function getRegisters(req, res) {
    try {
        const user = res.locals.user;

        const registers = await db.collection('transactions').find({ userId: new objectId(user._id) }).toArray();

        return res.status(200).send({ name: user.name, registers });
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function postRegisters(req, res) {
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
        const user = res.locals.user;

        const { type, description, value } = req.body;
        const date = dayjs().format('DD/MM');

        const register = { type, description, value: Number(value), date, userId: user._id };

        await db.collection('transactions').insertOne(register);

        return res.status(201).send("Registro criado com sucesso");
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function deleteRegister(req, res) {
    const id = req.params.id;
    try {
        const user = res.locals.user;
        const registerId = await db.collection('transactions').findOne({ _id: new objectId(id), userId: new objectId(user._id) });

        if (!registerId) {
            return res.status(404).send("Deu ruim na hora de apagar!");
        }

        await db.collection('transactions').deleteOne({ _id: new objectId(id) });
        return res.sendStatus(200);

    } catch (error) {
        res.status(500).send(error);
    }
}