const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:roomId', sessionController.getSession);
router.post('/:roomId/save', sessionController.saveSession);
router.get('/:roomId/history', sessionController.getHistory);
router.post('/:roomId/snapshot', sessionController.saveSnapshot);
router.post('/:roomId/record', sessionController.toggleRecording);
router.get('/:roomId/messages', sessionController.getMessages);

module.exports = router;
