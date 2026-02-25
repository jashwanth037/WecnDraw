const { body } = require('express-validator');

const authValidation = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be 3-30 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase and number'),
    ],
    login: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    updateProfile: [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be 3-30 characters'),
    ],
};

module.exports = authValidation;
