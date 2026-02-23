const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ['admin','marketing','content','sales','customer'], default: 'customer' },
    permissions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next){
    if(this.isModified('role')){
        switch(this.role){
            case 'admin': this.permissions = ['user:*','product:*','order:*','promo:*']; break;
            case 'marketing': this.permissions = ['promo:create','promo:view','report:view']; break;
            case 'content': this.permissions = ['product:update','seo:update','media:upload']; break;
            case 'sales': this.permissions = ['order:view','order:update','report:view']; break;
            default: this.permissions = []; break;
        }
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
