import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRouter.js';
import registersRouter from './routes/registersRouter.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(registersRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`));
