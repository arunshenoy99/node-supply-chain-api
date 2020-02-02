const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate (value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please provide a valid email address')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7
    },
    supplier: {
        type:Boolean,
        default: false
    },
    warehouses: [{
        warehouse: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)

module.exports = User