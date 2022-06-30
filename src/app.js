import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db(process.env.DATABASE);
});

app.post('/signup', async (req, res) => {
    //validação do formato do objeto vindo do body
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
        //verificação se já existe alguém utilizando o email
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
});

app.post('/signin', async (req, res) => {
    //validação do formato do objeto vindo do body
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
        //verificação email e senha, criação do token e armazenar sessão
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
});

app.get('/registers', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const token = authorization?.replace('Bearer ', '');

        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.status(401).send("Houve algum problema session");
        }

        const userId = session.userId;
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(401).send("Houve algum problema user");
        }

        const registers = await db.collection('transactions').find({ userId: new ObjectId(userId) }).toArray();

        return res.status(200).send({ name: user.name, registers });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/registers', async (req, res) => {
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
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
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
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));
