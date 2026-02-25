const { customAlphabet } = require('nanoid');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoid = customAlphabet(alphabet, 8);

const generateRoomId = () => nanoid();

module.exports = generateRoomId;
