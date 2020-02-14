const mongoose = require('mongoose')
const moment = require('moment')
const { createCanvas } = require('canvas')
const JSBarCode = require('jsbarcode')
const sharp = require('sharp')

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase:true,
    },
    price: {
        type: Number,
        required: true,
        validate (value) {
            if (value<0) {
                throw new Error('Price must be positive')
            }
        }
    },
    expiry: {
        type: String,
        trim: true,
        validate (value) {
            if (!moment(value, 'YYYY-MM-DD').isValid()) {
                throw new Error('Enter a valid date in YYYY-MM-DD format')
            }
        }
    },
    handleWithCare: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number,
        default: 1
    },
    image: {
        type: Buffer
    },
    barcode: {
        type: Buffer,
        required: true
    },
    locatedAt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse'
    }
}, {
    timestamps: true
})


itemSchema.methods.generateBarCode = async function () {
    const item = this
    const canvas = createCanvas()
    JSBarCode(canvas, item._id)
    const buffer = await sharp(canvas.toBuffer()).png().toBuffer()
    return buffer
}

itemSchema.methods.toJSON = function () {
    const item = this
    const itemObject = item.toObject()

    delete itemObject.barcode,
    delete itemObject.locatedAt,
    delete itemObject.buyer,
    delete itemObject.image

    return itemObject
}

const Item = mongoose.model('Item', itemSchema)


module.exports = Item