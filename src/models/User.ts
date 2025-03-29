import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    location: {
        type: String,
    },
    lastInteraction: {
        type: Date,
        default: Date.now,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 