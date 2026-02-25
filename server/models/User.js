const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username must be less than 30 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
            select: false,
        },
        avatar: {
            type: String,
            default: '',
        },
        refreshToken: {
            type: String,
            default: null,
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.refreshToken;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
