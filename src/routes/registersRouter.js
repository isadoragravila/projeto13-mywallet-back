import { getRegisters, postRegisters } from '../controllers/registersController.js';
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.get('/registers', validateUser, getRegisters);
router.post('/registers', validateUser, postRegisters);

export default router;