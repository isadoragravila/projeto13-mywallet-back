import { signUpUser, signInUser, deleteToken } from '../controllers/authController.js';
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', signInUser);
router.delete('/signout', validateUser, deleteToken);

export default router;