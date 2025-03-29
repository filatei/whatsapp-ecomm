import mongoose from 'mongoose';

export interface Category {
    _id?: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

const categorySchema = new mongoose.Schema<Category>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString(),
    },
    updatedAt: {
        type: String,
        default: () => new Date().toISOString(),
    },
});

// Update the updatedAt timestamp before saving
categorySchema.pre('save', function (next) {
    const doc = this as mongoose.Document & Category;
    doc.updatedAt = new Date().toISOString();
    next();
});

const Category = mongoose.models.Category || mongoose.model<Category>('Category', categorySchema);

export default Category; 