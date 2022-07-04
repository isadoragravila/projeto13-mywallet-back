import { deleteRegister, getRegisters, postRegisters, editRegister } from '../controllers/registersController.js';
import validateUser from '../middlewares/validateUser.js';
import validateId from '../middlewares/validateId.js';
import { Router } from 'express';

const router = Router();

router.get('/registers', validateUser, getRegisters);
router.post('/registers', validateUser, postRegisters);
router.delete('/registers/:id', validateUser, validateId, deleteRegister);
router.put('/registers/:id', validateUser, validateId, editRegister);

export default router;