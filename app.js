import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';

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


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));
