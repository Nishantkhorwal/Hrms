import express from 'express';
import { registerUser, loginUser, editUser, getUser, updateDailyLimit, getDailyLimits} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/edit', authenticateUser, editUser);
router.get('/get', authenticateUser, getUser);
router.post('/setSiteLimit', authenticateUser, updateDailyLimit);
router.get('/getSiteLimits', authenticateUser, getDailyLimits);

export default router;