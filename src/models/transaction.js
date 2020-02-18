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
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction