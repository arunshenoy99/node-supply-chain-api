const mongoose = require('mongoose')
const moment = require('moment')

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    size: {
        type: Number
    },
    leasePeriod: {
        type: String,
        trim: true,
        validate (value) {
            if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Please enter a valid date in YYYY-MM-DD format')
            }
        }
    },
    rent: {
        type: Number,
        validate (value) {
            if (value<0) {
                throw new Error('Rent must be a postitive number')
            } 
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

warehouseSchema.methods.toJSON = function () {
    const warehouse = this.toObject()
    warehouse.location = `https://www.google.com/maps?q=${warehouse.location.latitude},${warehouse.location.longitude}`
    return warehouse
}

const Warehouse = mongoose.model('Warehouse', warehouseSchema)

module.exports = Warehouse