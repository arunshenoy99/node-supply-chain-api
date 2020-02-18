const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    status: {
        type: 'String'
    },
    locatedAt: {
        type: 'String'
    },
    quantity: {
        type: Number,
        default: 1
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction