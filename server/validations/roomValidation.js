const { body } = require('express-validator');

const roomValidation = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Room name must be 1-100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description too long'),
        body('password')
            .optional()
            .isLength({ min: 4 })
            .withMessage('Room password must be at least 4 characters'),
        body('maxUsers')
            .optional()
            .isInt({ min: 2, max: 50 })
            .withMessage('Max users must be 2-50'),
        body('template')
            .optional()
            .isIn(['blank', 'wireframe', 'flowchart', 'kanban'])
            .withMessage('Invalid template'),
    ],
    join: [
        body('password').optional().isString(),
    ],
};

module.exports = roomValidation;
