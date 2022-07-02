import { deleteRegister, getRegisters, postRegisters } from '../controllers/registersController.js';
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.get('/registers', validateUser, getRegisters);
router.post('/registers', validateUser, postRegisters);
router.delete('/registers/:id', validateUser, deleteRegister);

export default router;