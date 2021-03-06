import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../databases/mongo.js';
import joi from 'joi';

export async function signUpUser(req, res) {
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const validation = userSchema.validate(req.body);
    if (validation.error) {
        return res.status(422).send("Todos os campos são obrigatórios!");
    }

    try {
        const { email, password } = req.body;
        const verifyEmail = await db.collection('users').findOne({ email });
        if (verifyEmail) {
            return res.status(409).send("E-mail já em uso. Utilize outro e-mail");
        }
        //criptografar a senha e enviar para o db
        const encryptedPassword = bcrypt.hashSync(password, 10);
        await db.collection('users').insertOne({ ...req.body, password: encryptedPassword });
        res.sendStatus(201);

    } catch (error) {
        res.status(500).send(error);
    }
}

export async function signInUser(req, res) {
    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const validation = userSchema.validate(req.body);
    if (validation.error) {
        return res.status(422).send("Todos os campos são obrigatórios!");
    }

    try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email });

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
            await db.collection('sessions').insertOne({ userId: user._id, token });
            return res.status(201).send({ token });
        } else {
            return res.status(401).send("E-mail ou senha incorretos!");
        }
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function deleteToken(req, res) {
    try {
        const token = res.locals.token;
        await db.collection('sessions').deleteOne({ token });
        return res.status(201).send("Token deletado com sucesso!")

    } catch (error) {
        res.status(500).send(error);
    }
}