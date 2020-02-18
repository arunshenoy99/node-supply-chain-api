const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Warehouse = require('../models/warehouse')

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

userSchema.virtual('warehouses', {
    ref: 'Warehouse',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('items', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'buyer'
})

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        throw new Error('Unable to login')
    }
   
    return user
}

userSchema.pre('remove', async function (next) {
    const user = this
    await Warehouse.updateMany({owner: user._id}, {owner: undefined})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User