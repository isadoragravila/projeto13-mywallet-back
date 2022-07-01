import { getRegisters, postRegisters } from '../controllers/registersController.js';
import { Router } from 'express';

const router = Router();

router.get('/registers', getRegisters);
router.post('/registers', postRegisters);

export default router;