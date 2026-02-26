const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const authValidation = require('../validations/authValidation');
const validate = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', authLimiter, ...authValidation.register, validate, authController.register);
router.post('/login', authLimiter, ...authValidation.login, validate, authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.getMe);
router.put('/update-profile', authMiddleware, ...authValidation.updateProfile, validate, authController.updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
