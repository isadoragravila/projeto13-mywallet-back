import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signUpUser, signInUser } from './controllers/authController.js';
import { getRegisters, postRegisters } from './controllers/registersController.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/signup', signUpUser);
app.post('/signin', signInUser);

app.get('/registers', getRegisters);
app.post('/registers', postRegisters);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));
