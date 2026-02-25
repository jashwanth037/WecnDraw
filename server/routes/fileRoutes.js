const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authMiddleware);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/:roomId', fileController.getRoomFiles);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
