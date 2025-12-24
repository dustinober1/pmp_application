import { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    refreshToken,
} from '../controllers/authController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', optionalAuth, logout);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

export default router;
