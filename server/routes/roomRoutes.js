const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roomValidation = require('../validations/roomValidation');
const validate = require('../middleware/validate');

router.use(authMiddleware);

router.post('/create', ...roomValidation.create, validate, roomController.createRoom);
router.get('/my-rooms', roomController.getMyRooms);
router.get('/:roomId', roomController.getRoom);
router.post('/:roomId/join', ...roomValidation.join, validate, roomController.joinRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.put('/:roomId/settings', roomController.updateSettings);
router.post('/:roomId/kick/:userId', roomController.kickUser);

module.exports = router;
