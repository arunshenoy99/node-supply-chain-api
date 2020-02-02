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
            type: String,
            required: true,
            trim: true
        },
        longitude: {
            type: String,
            required: true,
            trim: true
        }
    },
    size: {
        type: Number
    },
    leasePeriod: {
        type: String,
        validate (value) {
            if (!moment(value, 'YYYY-MM-DD').isValid()) {
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
    // items: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    }
})

const Warehouse = mongoose.model('Warehouse', warehouseSchema)

module.exports = Warehouse