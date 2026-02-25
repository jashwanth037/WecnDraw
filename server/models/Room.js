const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const participantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['host', 'participant'], default: 'participant' },
});

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Room name is required'],
            trim: true,
            maxlength: [100, 'Room name too long'],
        },
        description: {
            type: String,
            default: '',
            maxlength: [500, 'Description too long'],
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participants: [participantSchema],
        isActive: { type: Boolean, default: true },
        isPasswordProtected: { type: Boolean, default: false },
        password: { type: String, default: null, select: false },
        maxUsers: { type: Number, default: 10, min: 2, max: 50 },
        tags: [{ type: String, trim: true }],
        template: {
            type: String,
            enum: ['blank', 'wireframe', 'flowchart', 'kanban'],
            default: 'blank',
        },
        lastSnapshot: { type: String, default: '' },
    },
    { timestamps: true }
);

roomSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

roomSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Room', roomSchema);
