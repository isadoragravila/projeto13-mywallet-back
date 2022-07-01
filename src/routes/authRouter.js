import { signUpUser, signInUser } from '../controllers/authController.js';
import { Router } from 'express';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', signInUser);

export default router;